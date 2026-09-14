<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();

            // Contractor account
            $table->foreignId('contractor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Contract information
            $table->decimal('contract_value', 15, 2);

            $table->date('start_date');

            $table->date('end_date');

            // Performance percentage: 0 - 100
            $table->decimal('performance', 5, 2)
                ->default(0);

            // active, completed, expired, suspended
            $table->string('status')
                ->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
