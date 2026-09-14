<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_schedules', function (Blueprint $table) {
            $table->date('date')->nullable()->after('barangay_id');
            $table->string('status')->default('scheduled')->after('active');
        });
    }

    public function down(): void
    {
        Schema::table('collection_schedules', function (Blueprint $table) {
            $table->dropColumn(['date', 'status']);
        });
    }
};