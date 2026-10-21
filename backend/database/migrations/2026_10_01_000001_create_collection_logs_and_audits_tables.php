<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. COLLECTION LOGS TABLE
        |--------------------------------------------------------------------------
        | Every collection entry is saved as a new row (INSERT only).
        | Record amount collected, barangay, driver, idempotency_key, and server timestamp.
        |--------------------------------------------------------------------------
        */
        Schema::create('collection_logs', function (Blueprint $table) {
            $table->id();

            // Driver who submitted it
            $table->foreignId('driver_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Optional truck assignment
            $table->foreignId('truck_id')
                ->nullable()
                ->constrained('trucks')
                ->nullOnDelete();

            // Barangay (can reference barangays table or store name directly)
            $table->foreignId('barangay_id')
                ->nullable()
                ->constrained('barangays')
                ->nullOnDelete();

            $table->string('barangay_name', 100);

            // Amount collected (tons or volume)
            $table->decimal('amount_collected', 10, 2);
            $table->string('unit', 20)->default('tons');

            // Waste classification
            $table->string('waste_type', 50)->default('Residual');
            $table->text('notes')->nullable();

            // Idempotency key per submission to prevent duplicates on weak mobile connections
            $table->string('idempotency_key', 64)->unique();

            // Finalization flag: once finalized, locked against any UPDATE/DELETE
            $table->boolean('is_finalized')->default(false)->index();
            $table->timestamp('finalized_at')->nullable();

            // Server-side timestamp
            $table->timestamp('server_timestamp')->useCurrent();

            $table->timestamps();

            // Indexes for concurrent driver queries
            $table->index(['driver_id', 'created_at']);
            $table->index(['barangay_name', 'created_at']);
        });

        /*
        |--------------------------------------------------------------------------
        | 2. COLLECTION LOG AUDITS TABLE
        |--------------------------------------------------------------------------
        | Logs every correction in an audit trail: old value, new value, who changed it, and when.
        |--------------------------------------------------------------------------
        */
        Schema::create('collection_log_audits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('collection_log_id')
                ->constrained('collection_logs')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('action', 50); // CREATED, TYPO_CORRECTED, FINALIZED
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('reason')->nullable(); // e.g. "Typographical correction"

            $table->timestamp('created_at')->useCurrent();
        });

        /*
        |--------------------------------------------------------------------------
        | 3. DATABASE-LEVEL TRIGGERS (MySQL / MariaDB)
        |--------------------------------------------------------------------------
        | Enforce insert-only and finalized locking at the database level:
        | - Block UPDATE on finalized rows.
        | - Block DELETE on collection_logs completely (insert-only).
        |--------------------------------------------------------------------------
        */
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared("
                CREATE TRIGGER trg_collection_logs_prevent_update
                BEFORE UPDATE ON collection_logs
                FOR EACH ROW
                BEGIN
                    IF OLD.is_finalized = 1 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Disallowed: Finalized collection log is permanently locked and cannot be edited.';
                    END IF;

                    IF OLD.is_finalized = 1 AND NEW.is_finalized = 0 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Disallowed: Finalized status cannot be reversed.';
                    END IF;
                END
            ");

            DB::unprepared("
                CREATE TRIGGER trg_collection_logs_prevent_delete
                BEFORE DELETE ON collection_logs
                FOR EACH ROW
                BEGIN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Disallowed: Collection logs are insert-only records and can never be deleted.';
                END
            ");
        }
    }

    public function down(): void
    {
        DB::unprepared("DROP TRIGGER IF EXISTS trg_collection_logs_prevent_delete");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_collection_logs_prevent_update");
        Schema::dropIfExists('collection_log_audits');
        Schema::dropIfExists('collection_logs');
    }
};
