<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('attendances', 'user_id')
            && Schema::hasColumn('attendances', 'date')
            && Schema::hasColumn('attendances', 'time_in')
            && Schema::hasColumn('attendances', 'time_out')
            && Schema::hasColumn('attendances', 'status')
            && Schema::hasColumn('attendances', 'remarks')) {
            return;
        }

        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'user_id')) {
                $table->foreignId('user_id')->after('id')->constrained('users')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('attendances', 'date')) {
                $table->date('date')->after('user_id');
            }
            if (!Schema::hasColumn('attendances', 'time_in')) {
                $table->time('time_in')->nullable()->after('date');
            }
            if (!Schema::hasColumn('attendances', 'time_out')) {
                $table->time('time_out')->nullable()->after('time_in');
            }
            if (!Schema::hasColumn('attendances', 'status')) {
                $table->enum('status', ['present', 'late', 'absent', 'on_leave'])->default('present')->after('time_out');
            }
            if (!Schema::hasColumn('attendances', 'remarks')) {
                $table->text('remarks')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {

            $table->dropUnique(
                'attendances_user_id_date_unique'
            );

            $table->dropForeign([
                'user_id'
            ]);

            $table->dropColumn([
                'user_id',
                'date',
                'time_in',
                'time_out',
                'status',
                'remarks',
            ]);
        });
    }
};