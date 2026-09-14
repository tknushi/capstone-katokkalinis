<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vendor_id')
                ->constrained('vendors')
                ->cascadeOnDelete();

            $table->foreignId('inspector_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->integer('hygiene_system')
                ->default(0);

            $table->integer('condition_of_premises')
                ->default(0);

            $table->integer('total_score')
                ->default(0);

            $table->integer('compliance_level')
                ->default(0);

            $table->text('notes')
                ->nullable();

            $table->enum('status', [
                'pending',
                'completed',
                'reviewed'
            ])->default('completed');

            $table->timestamp('inspected_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
