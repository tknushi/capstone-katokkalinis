<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE reports
            MODIFY status ENUM(
                'pending',
                'reviewed',
                'resolved',
                'rejected'
            ) NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE reports
            MODIFY status ENUM(
                'reviewed',
                'resolved',
                'rejected'
            ) NOT NULL DEFAULT 'reviewed'
        ");
    }
};