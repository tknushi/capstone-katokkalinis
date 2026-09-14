<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->id();

            $table->string('truck_number')->unique();

            $table->string('plate_number')
                ->unique();

            $table->foreignId('driver_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('contractor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('truck_type')
                ->nullable();

            $table->enum('status', [
                'available',
                'on_route',
                'maintenance',
                'inactive'
            ])->default('available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucks');
    }
};
