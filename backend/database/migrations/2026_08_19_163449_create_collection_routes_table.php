<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_routes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('truck_id')
                ->constrained('trucks')
                ->cascadeOnDelete();

            $table->foreignId('barangay_id')
                ->constrained('barangays')
                ->cascadeOnDelete();

            $table->date('collection_date');

            $table->time('start_time')
                ->nullable();

            $table->time('end_time')
                ->nullable();

            $table->enum('status', [
                'pending',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('pending');

            $table->text('notes')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_routes');
    }
};
