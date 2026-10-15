<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Creates the tables that the Feedback, Notification and Violation models
 * (and their controllers) already use but that never had a migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('feedback')) {
            Schema::create('feedback', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resident_id')->constrained('users')->cascadeOnDelete();
                $table->text('content');
                $table->string('status')->default('new');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('message');
                $table->string('type')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->index(['user_id', 'is_read']);
            });
        }

        if (!Schema::hasTable('violations')) {
            Schema::create('violations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
                $table->foreignId('inspection_id')->nullable()->constrained('inspections')->nullOnDelete();
                $table->string('violation_type');
                $table->text('description')->nullable();
                $table->string('penalty')->nullable();
                $table->text('corrective_action')->nullable();
                $table->string('status')->default('open');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('violations');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('feedback');
    }
};
