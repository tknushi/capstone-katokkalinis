<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Change trucks.contractor_id to reference contractors.id.
     */
    public function up(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            // Remove the existing foreign key pointing to users.id
            $table->dropForeign(['contractor_id']);
        });

        Schema::table('trucks', function (Blueprint $table) {
            // Make contractor_id reference the contractors table
            $table->foreign('contractor_id')
                ->references('id')
                ->on('contractors')
                ->nullOnDelete();
        });
    }

    /**
     * Revert contractor_id back to users.id.
     */
    public function down(): void
    {
        Schema::table('trucks', function (Blueprint $table) {
            $table->dropForeign(['contractor_id']);
        });

        Schema::table('trucks', function (Blueprint $table) {
            $table->foreign('contractor_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }
};