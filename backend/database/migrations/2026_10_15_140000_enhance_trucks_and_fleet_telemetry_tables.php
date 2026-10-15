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
        | 1. ROUTES & ROUTE STOPS
        |--------------------------------------------------------------------------
        | Ordered stops with name, barangay or market, reference lat/lng, scheduled time.
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('routes')) {
            Schema::create('routes', function (Blueprint $table) {
                $table->id();
                $table->string('name', 150);
                $table->string('code', 50)->unique();
                $table->string('zone', 100)->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('route_stops')) {
            Schema::create('route_stops', function (Blueprint $table) {
                $table->id();
                $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
                $table->unsignedSmallInteger('stop_order')->default(1);
                $table->string('name', 150);
                $table->string('barangay_or_market', 150);
                $table->decimal('latitude', 10, 7);
                $table->decimal('longitude', 10, 7);
                $table->string('scheduled_time', 20)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['route_id', 'stop_order']);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 2. ENHANCE TRUCKS TABLE
        |--------------------------------------------------------------------------
        */
        Schema::table('trucks', function (Blueprint $table) {
            // Vehicle specifications
            if (!Schema::hasColumn('trucks', 'make')) {
                $table->string('make', 100)->nullable()->after('truck_type');
            }
            if (!Schema::hasColumn('trucks', 'model')) {
                $table->string('model', 100)->nullable()->after('make');
            }
            if (!Schema::hasColumn('trucks', 'year')) {
                $table->unsignedSmallInteger('year')->nullable()->after('model');
            }
            if (!Schema::hasColumn('trucks', 'color')) {
                $table->string('color', 50)->nullable()->after('year');
            }
            if (!Schema::hasColumn('trucks', 'chassis_number')) {
                $table->string('chassis_number', 100)->nullable()->unique()->after('color');
            }
            if (!Schema::hasColumn('trucks', 'engine_number')) {
                $table->string('engine_number', 100)->nullable()->after('chassis_number');
            }
            if (!Schema::hasColumn('trucks', 'fuel_type')) {
                $table->string('fuel_type', 50)->nullable()->default('Diesel')->after('engine_number');
            }
            if (!Schema::hasColumn('trucks', 'payload_capacity')) {
                $table->decimal('payload_capacity', 8, 2)->nullable()->after('fuel_type');
            }
            if (!Schema::hasColumn('trucks', 'volume_capacity')) {
                $table->decimal('volume_capacity', 8, 2)->nullable()->after('payload_capacity');
            }
            if (!Schema::hasColumn('trucks', 'odometer_reading')) {
                $table->unsignedInteger('odometer_reading')->nullable()->default(0)->after('volume_capacity');
            }
            if (!Schema::hasColumn('trucks', 'truck_photo')) {
                $table->text('truck_photo')->nullable()->after('odometer_reading');
            }

            // Registration & compliance
            if (!Schema::hasColumn('trucks', 'or_cr_number')) {
                $table->string('or_cr_number', 100)->nullable()->after('truck_photo');
            }
            if (!Schema::hasColumn('trucks', 'registration_expiry')) {
                $table->date('registration_expiry')->nullable()->after('or_cr_number');
            }
            if (!Schema::hasColumn('trucks', 'insurance_provider')) {
                $table->string('insurance_provider', 150)->nullable()->after('registration_expiry');
            }
            if (!Schema::hasColumn('trucks', 'insurance_policy_number')) {
                $table->string('insurance_policy_number', 100)->nullable()->after('insurance_provider');
            }
            if (!Schema::hasColumn('trucks', 'insurance_expiry')) {
                $table->date('insurance_expiry')->nullable()->after('insurance_policy_number');
            }
            if (!Schema::hasColumn('trucks', 'emission_test_date')) {
                $table->date('emission_test_date')->nullable()->after('insurance_expiry');
            }
            if (!Schema::hasColumn('trucks', 'last_maintenance_date')) {
                $table->date('last_maintenance_date')->nullable()->after('emission_test_date');
            }
            if (!Schema::hasColumn('trucks', 'next_maintenance_due')) {
                $table->date('next_maintenance_due')->nullable()->after('last_maintenance_date');
            }

            // Ownership & operator
            if (!Schema::hasColumn('trucks', 'ownership_type')) {
                $table->string('ownership_type', 50)->default('CLENRO-owned')->after('next_maintenance_due');
            }
            if (!Schema::hasColumn('trucks', 'driver_license_number')) {
                $table->string('driver_license_number', 100)->nullable()->after('ownership_type');
            }
            if (!Schema::hasColumn('trucks', 'driver_license_expiry')) {
                $table->date('driver_license_expiry')->nullable()->after('driver_license_number');
            }
            if (!Schema::hasColumn('trucks', 'driver_contact_number')) {
                $table->string('driver_contact_number', 50)->nullable()->after('driver_license_expiry');
            }
            if (!Schema::hasColumn('trucks', 'crew_members')) {
                $table->text('crew_members')->nullable()->after('driver_contact_number');
            }
            if (!Schema::hasColumn('trucks', 'emergency_contact')) {
                $table->string('emergency_contact', 150)->nullable()->after('crew_members');
            }

            // Assignment & telemetry
            if (!Schema::hasColumn('trucks', 'operating_zone')) {
                $table->text('operating_zone')->nullable()->after('emergency_contact');
            }
            if (!Schema::hasColumn('trucks', 'assigned_route_id')) {
                $table->foreignId('assigned_route_id')->nullable()->constrained('routes')->nullOnDelete()->after('operating_zone');
            }
            if (!Schema::hasColumn('trucks', 'default_schedule')) {
                $table->string('default_schedule', 100)->nullable()->after('assigned_route_id');
            }
            if (!Schema::hasColumn('trucks', 'telemetry_source_id')) {
                $table->string('telemetry_source_id', 100)->nullable()->after('default_schedule');
            }
            if (!Schema::hasColumn('trucks', 'checkpoint_settings')) {
                $table->json('checkpoint_settings')->nullable()->after('telemetry_source_id');
            }
            if (!Schema::hasColumn('trucks', 'notes')) {
                $table->text('notes')->nullable()->after('checkpoint_settings');
            }

            // Audit & archive tracking
            if (!Schema::hasColumn('trucks', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('notes');
            }
            if (!Schema::hasColumn('trucks', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
            }
            if (!Schema::hasColumn('trucks', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('updated_by');
            }
        });

        // Modify status to string(50) so it supports 'available', 'on_route', 'maintenance', 'out_of_service', 'inactive'
        try {
            DB::statement("ALTER TABLE trucks MODIFY status VARCHAR(50) NOT NULL DEFAULT 'available'");
        } catch (\Throwable $e) {
            // Ignore if already string
        }

        // Add performance & audit indexes
        try {
            Schema::table('trucks', function (Blueprint $table) {
                $table->index('status');
                $table->index('archived_at');
            });
        } catch (\Throwable $e) {}

        /*
        |--------------------------------------------------------------------------
        | 3. TRUCK DOCUMENTS TABLE
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('truck_documents')) {
            Schema::create('truck_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('truck_id')->constrained('trucks')->cascadeOnDelete();
                $table->string('type', 100); // OR/CR, Insurance, Emission, Franchise, Other
                $table->string('file_path');
                $table->string('file_name')->nullable();
                $table->unsignedBigInteger('file_size')->nullable();
                $table->date('expiry')->nullable();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['truck_id', 'type']);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 4. TRUCK MAINTENANCE RECORDS TABLE
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('truck_maintenance_records')) {
            Schema::create('truck_maintenance_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('truck_id')->constrained('trucks')->cascadeOnDelete();
                $table->date('date');
                $table->string('type', 100); // Preventive, Tire, Hydraulic, Engine, Oil Change, Inspection
                $table->text('notes')->nullable();
                $table->unsignedInteger('odometer')->nullable();
                $table->decimal('cost', 10, 2)->nullable();
                $table->string('performed_by', 150)->nullable();
                $table->date('next_due')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['truck_id', 'date']);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 5. TRUCK STATUS HISTORY TABLE
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('truck_status_history')) {
            Schema::create('truck_status_history', function (Blueprint $table) {
                $table->id();
                $table->foreignId('truck_id')->constrained('trucks')->cascadeOnDelete();
                $table->string('old_status', 50)->nullable();
                $table->string('new_status', 50);
                $table->text('reason')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('time')->useCurrent();
                $table->timestamps();

                $table->index(['truck_id', 'time']);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 6. ROUTE RUNS TABLE
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('route_runs')) {
            Schema::create('route_runs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('truck_id')->constrained('trucks')->cascadeOnDelete();
                $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
                $table->date('date');
                $table->time('start')->nullable();
                $table->time('end')->nullable();
                $table->string('status', 50)->default('scheduled'); // scheduled, in_progress, completed, cancelled
                $table->decimal('tonnage', 8, 2)->default(0);
                $table->timestamps();

                $table->index(['date', 'status']);
                $table->index(['truck_id', 'date']);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 7. ROUTE TELEMETRY EVENTS TABLE
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('route_telemetry_events')) {
            Schema::create('route_telemetry_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('run_id')->constrained('route_runs')->cascadeOnDelete();
                $table->foreignId('stop_id')->nullable()->constrained('route_stops')->nullOnDelete();
                $table->string('event_type', 50); // arrived, departed, collected, delayed, skipped, checkpoint
                $table->timestamp('timestamp')->useCurrent();
                $table->decimal('volume', 8, 2)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['run_id', 'timestamp']);
                $table->index(['stop_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('route_telemetry_events');
        Schema::dropIfExists('route_runs');
        Schema::dropIfExists('truck_status_history');
        Schema::dropIfExists('truck_maintenance_records');
        Schema::dropIfExists('truck_documents');
        Schema::dropIfExists('route_stops');
        Schema::dropIfExists('routes');
    }
};
