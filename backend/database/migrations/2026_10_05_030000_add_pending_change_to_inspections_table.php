<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->integer('pending_hygiene_system')->nullable()->after('notes');
            $table->integer('pending_condition_of_premises')->nullable()->after('pending_hygiene_system');
            $table->integer('pending_total_score')->nullable()->after('pending_condition_of_premises');
            $table->text('pending_notes')->nullable()->after('pending_total_score');
            $table->foreignId('change_requested_by')->nullable()->after('pending_notes')->constrained('users')->nullOnDelete();
            $table->timestamp('change_requested_at')->nullable()->after('change_requested_by');
            $table->string('change_status')->default('none')->after('change_requested_at'); // none, pending, accepted, rejected
            $table->text('rejection_reason')->nullable()->after('change_status');
        });
    }

    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropForeign(['change_requested_by']);
            $table->dropColumn([
                'pending_hygiene_system',
                'pending_condition_of_premises',
                'pending_total_score',
                'pending_notes',
                'change_requested_by',
                'change_requested_at',
                'change_status',
                'rejection_reason',
            ]);
        });
    }
};
