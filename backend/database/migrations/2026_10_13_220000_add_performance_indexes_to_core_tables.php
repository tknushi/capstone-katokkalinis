<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add composite and single-column indexes on frequently filtered columns
     * to eliminate table scans and accelerate analytics and summary queries.
     */
    public function up(): void
    {
        // 1. Reports indexes
        if (Schema::hasTable('reports')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->index('status', 'idx_reports_status');
                $table->index('created_at', 'idx_reports_created_at');
            });
        }

        // 2. Trucks indexes
        if (Schema::hasTable('trucks')) {
            Schema::table('trucks', function (Blueprint $table) {
                $table->index('status', 'idx_trucks_status');
            });
        }

        // 3. Vendors indexes
        if (Schema::hasTable('vendors')) {
            Schema::table('vendors', function (Blueprint $table) {
                if (Schema::hasColumn('vendors', 'barangay_id')) {
                    $table->index('barangay_id', 'idx_vendors_barangay_id');
                }
            });
        }

        // 4. Attendances indexes
        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->index(['user_id', 'status'], 'idx_attendances_user_status');
                if (Schema::hasColumn('attendances', 'date')) {
                    $table->index('date', 'idx_attendances_date');
                }
            });
        }

        // 5. Inspections indexes
        if (Schema::hasTable('inspections')) {
            Schema::table('inspections', function (Blueprint $table) {
                if (Schema::hasColumn('inspections', 'total_score')) {
                    $table->index('total_score', 'idx_inspections_total_score');
                }
            });
        }

        // 6. Collection Routes indexes
        if (Schema::hasTable('collection_routes')) {
            Schema::table('collection_routes', function (Blueprint $table) {
                if (Schema::hasColumn('collection_routes', 'collection_date')) {
                    $table->index('collection_date', 'idx_collection_routes_date');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('reports')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->dropIndex('idx_reports_status');
                $table->dropIndex('idx_reports_created_at');
            });
        }

        if (Schema::hasTable('trucks')) {
            Schema::table('trucks', function (Blueprint $table) {
                $table->dropIndex('idx_trucks_status');
            });
        }

        if (Schema::hasTable('vendors')) {
            Schema::table('vendors', function (Blueprint $table) {
                if (Schema::hasColumn('vendors', 'barangay_id')) {
                    $table->dropIndex('idx_vendors_barangay_id');
                }
            });
        }

        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->dropIndex('idx_attendances_user_status');
                if (Schema::hasColumn('attendances', 'date')) {
                    $table->dropIndex('idx_attendances_date');
                }
            });
        }

        if (Schema::hasTable('inspections')) {
            Schema::table('inspections', function (Blueprint $table) {
                if (Schema::hasColumn('inspections', 'total_score')) {
                    $table->dropIndex('idx_inspections_total_score');
                }
            });
        }

        if (Schema::hasTable('collection_routes')) {
            Schema::table('collection_routes', function (Blueprint $table) {
                if (Schema::hasColumn('collection_routes', 'collection_date')) {
                    $table->dropIndex('idx_collection_routes_date');
                }
            });
        }
    }
};
