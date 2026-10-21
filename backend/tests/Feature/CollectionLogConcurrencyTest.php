<?php

namespace Tests\Feature;

use App\Models\CollectionLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CollectionLogConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'driver'], ['description' => 'Garbage truck driver']);
    }

    /**
     * Test concurrent submissions with idempotency and server timestamps.
     */
    public function test_driver_can_submit_collection_log_with_idempotency(): void
    {
        $driver = User::factory()->create();
        $driverRole = Role::where('name', 'driver')->first();
        $driver->roles()->attach($driverRole->id);

        $idempotencyKey = (string) Str::uuid();

        $payload = [
            'amount_collected' => 3.75,
            'unit' => 'tons',
            'barangay_name' => 'Barangay 1',
            'waste_type' => 'Residual',
            'notes' => 'Morning collection run',
            'idempotency_key' => $idempotencyKey,
        ];

        // 1. First submission
        $response = $this->actingAs($driver, 'sanctum')
            ->postJson('/api/driver/collection-logs', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount_collected', 3.75)
            ->assertJsonPath('data.is_finalized', false);

        $logId = $response->json('data.id');

        // Verify server timestamp recorded
        $log = CollectionLog::find($logId);
        $this->assertNotNull($log->server_timestamp);

        // 2. Retry with same idempotency key (network retry) -> should not duplicate
        $retryResponse = $this->actingAs($driver, 'sanctum')
            ->postJson('/api/driver/collection-logs', $payload);

        $retryResponse->assertStatus(200)
            ->assertJsonPath('is_idempotent_replay', true)
            ->assertJsonPath('data.id', $logId);

        $this->assertEquals(1, CollectionLog::where('idempotency_key', $idempotencyKey)->count());
    }

    /**
     * Test typographical error edit before finalization and audit trail logging.
     */
    public function test_driver_can_edit_typo_before_finalization(): void
    {
        $driver = User::factory()->create();
        $driverRole = Role::where('name', 'driver')->first();
        $driver->roles()->attach($driverRole->id);

        $log = CollectionLog::create([
            'driver_id' => $driver->id,
            'barangay_name' => 'Barangay 2',
            'amount_collected' => 5.0,
            'unit' => 'tons',
            'idempotency_key' => (string) Str::uuid(),
            'is_finalized' => false,
            'server_timestamp' => now(),
        ]);

        // Driver corrects 5.0 tons to 4.0 tons
        $updateResponse = $this->actingAs($driver, 'sanctum')
            ->putJson("/api/driver/collection-logs/{$log->id}", [
                'amount_collected' => 4.0,
                'reason' => 'Corrected typographical error from 5 to 4 tons',
            ]);

        $updateResponse->assertStatus(200);
        $this->assertEquals(4.0, (float) $updateResponse->json('data.amount_collected'));

        // Check audit trail recorded
        $this->assertDatabaseHas('collection_log_audits', [
            'collection_log_id' => $log->id,
            'action' => 'TYPO_CORRECTED',
        ]);
    }

    /**
     * Test finalized log is locked and rejects further edits and deletes.
     */
    public function test_finalized_log_is_locked_from_editing_and_deletion(): void
    {
        $driver = User::factory()->create();
        $driverRole = Role::where('name', 'driver')->first();
        $driver->roles()->attach($driverRole->id);

        $log = CollectionLog::create([
            'driver_id' => $driver->id,
            'barangay_name' => 'Barangay 3',
            'amount_collected' => 2.5,
            'unit' => 'tons',
            'idempotency_key' => (string) Str::uuid(),
            'is_finalized' => false,
            'server_timestamp' => now(),
        ]);

        // Finalize log
        $finalizeResponse = $this->actingAs($driver, 'sanctum')
            ->postJson("/api/driver/collection-logs/{$log->id}/finalize");

        $finalizeResponse->assertStatus(200)
            ->assertJsonPath('data.is_finalized', true);

        // Attempting to edit finalized log must be rejected
        $attemptEdit = $this->actingAs($driver, 'sanctum')
            ->putJson("/api/driver/collection-logs/{$log->id}", [
                'amount_collected' => 3.0,
            ]);

        $attemptEdit->assertStatus(422);

        // Eloquent model-level protection throws DomainException on deletion
        $this->expectException(\DomainException::class);
        $log->delete();
    }
}
