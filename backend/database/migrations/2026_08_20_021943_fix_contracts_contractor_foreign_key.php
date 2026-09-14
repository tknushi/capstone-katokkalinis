php artisan migrate<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Remove the incorrect foreign key:
            // contracts.contractor_id -> users.id
            $table->dropForeign(['contractor_id']);

            // Add the correct foreign key:
            // contracts.contractor_id -> contractors.id
            $table->foreign('contractor_id')
                ->references('id')
                ->on('contractors')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Remove the correct contractors relationship
            $table->dropForeign(['contractor_id']);

            // Restore the previous users relationship
            $table->foreign('contractor_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
};
