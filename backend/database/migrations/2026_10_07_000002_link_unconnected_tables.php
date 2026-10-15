<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Links tables that were previously isolated in the ERD:
 *  - clenro_pileup_reports -> barangays, trucks, contractors, users
 *    (existing text columns are kept; new FK columns are backfilled from them)
 *  - collection_schedules  -> trucks, users (driver)
 *  - collection_logs       -> collection_schedules
 */
return new class extends Migration
{
    public function up(): void
    {
        /*
        |------------------------------------------------------------------
        | CLENRO PILE-UP REPORTS
        |------------------------------------------------------------------
        */
        Schema::table('clenro_pileup_reports', function (Blueprint $table) {
            if (!Schema::hasColumn('clenro_pileup_reports', 'barangay_id')) {
                $table->foreignId('barangay_id')->nullable()->after('barangay_number')
                    ->constrained('barangays')->nullOnDelete();
            }
            if (!Schema::hasColumn('clenro_pileup_reports', 'contractor_id')) {
                $table->foreignId('contractor_id')->nullable()->after('contractor_assigned')
                    ->constrained('contractors')->nullOnDelete();
            }
            if (!Schema::hasColumn('clenro_pileup_reports', 'truck_id')) {
                $table->foreignId('truck_id')->nullable()->after('truck_plate')
                    ->constrained('trucks')->nullOnDelete();
            }
            if (!Schema::hasColumn('clenro_pileup_reports', 'reported_by_user_id')) {
                $table->foreignId('reported_by_user_id')->nullable()->after('reported_by')
                    ->constrained('users')->nullOnDelete();
            }
        });

        // Backfill from the existing text / number columns.
        DB::statement("
            UPDATE clenro_pileup_reports r
            JOIN barangays b
              ON b.code = CONCAT('BRGY-', LPAD(r.barangay_number, 3, '0'))
              OR b.name = CONCAT('Barangay ', r.barangay_number)
            SET r.barangay_id = b.id
            WHERE r.barangay_number IS NOT NULL AND r.barangay_id IS NULL
        ");

        DB::statement("
            UPDATE clenro_pileup_reports r
            JOIN trucks t ON t.plate_number = r.truck_plate
            SET r.truck_id = t.id
            WHERE r.truck_plate IS NOT NULL AND r.truck_id IS NULL
        ");

        DB::statement("
            UPDATE clenro_pileup_reports r
            JOIN contractors c ON c.company_name = r.contractor_assigned
            SET r.contractor_id = c.id
            WHERE r.contractor_id IS NULL
        ");

        DB::statement("
            UPDATE clenro_pileup_reports r
            JOIN users u ON u.name = r.reported_by
            SET r.reported_by_user_id = u.id
            WHERE r.reported_by_user_id IS NULL
        ");

        /*
        |------------------------------------------------------------------
        | COLLECTION SCHEDULES -> TRUCK + DRIVER
        |------------------------------------------------------------------
        */
        Schema::table('collection_schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('collection_schedules', 'truck_id')) {
                $table->foreignId('truck_id')->nullable()->after('barangay_id')
                    ->constrained('trucks')->nullOnDelete();
            }
            if (!Schema::hasColumn('collection_schedules', 'driver_id')) {
                $table->foreignId('driver_id')->nullable()->after('truck_id')
                    ->constrained('users')->nullOnDelete();
            }
        });

        /*
        |------------------------------------------------------------------
        | COLLECTION LOGS -> SCHEDULE
        |------------------------------------------------------------------
        */
        Schema::table('collection_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('collection_logs', 'schedule_id')) {
                $table->foreignId('schedule_id')->nullable()->after('id')
                    ->constrained('collection_schedules')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('collection_logs', function (Blueprint $table) {
            if (Schema::hasColumn('collection_logs', 'schedule_id')) {
                $table->dropConstrainedForeignId('schedule_id');
            }
        });

        Schema::table('collection_schedules', function (Blueprint $table) {
            foreach (['driver_id', 'truck_id'] as $col) {
                if (Schema::hasColumn('collection_schedules', $col)) {
                    $table->dropConstrainedForeignId($col);
                }
            }
        });

        Schema::table('clenro_pileup_reports', function (Blueprint $table) {
            foreach (['reported_by_user_id', 'truck_id', 'contractor_id', 'barangay_id'] as $col) {
                if (Schema::hasColumn('clenro_pileup_reports', $col)) {
                    $table->dropConstrainedForeignId($col);
                }
            }
        });
    }
};
