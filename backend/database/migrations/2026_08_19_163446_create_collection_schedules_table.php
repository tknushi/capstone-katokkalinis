<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('barangay_id')
                ->constrained('barangays')
                ->cascadeOnDelete();

            $table->string('day');

            $table->time('pickup_time');

            $table->string('schedule_type')
                ->default('regular');

            $table->text('notes')->nullable();

            $table->boolean('active')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_schedules');
    }
};
