<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('truck_locations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('truck_id')
                ->constrained('trucks')
                ->cascadeOnDelete();

            $table->decimal('latitude', 10, 7);

            $table->decimal('longitude', 10, 7);

            $table->decimal('speed', 8, 2)
                ->nullable();

            $table->decimal('heading', 8, 2)
                ->nullable();

            $table->timestamp('recorded_at');

            $table->timestamps();

            $table->index([
                'truck_id',
                'recorded_at'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('truck_locations');
    }
};
