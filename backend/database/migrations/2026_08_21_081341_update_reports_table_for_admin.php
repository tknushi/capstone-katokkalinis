<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {

            if (!Schema::hasColumn('reports', 'barangay_id')) {
                $table->foreignId('barangay_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('barangays')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('reports', 'latitude')) {
                $table->decimal('latitude', 10, 7)
                    ->nullable()
                    ->after('location');
            }

            if (!Schema::hasColumn('reports', 'longitude')) {
                $table->decimal('longitude', 10, 7)
                    ->nullable()
                    ->after('latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {

            if (Schema::hasColumn('reports', 'barangay_id')) {
                $table->dropForeign(['barangay_id']);
                $table->dropColumn('barangay_id');
            }

            if (Schema::hasColumn('reports', 'latitude')) {
                $table->dropColumn('latitude');
            }

            if (Schema::hasColumn('reports', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};