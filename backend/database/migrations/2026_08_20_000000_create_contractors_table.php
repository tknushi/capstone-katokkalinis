<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contractors', function (Blueprint $table) {
            $table->id();

            $table->string('contractor_code')->unique();
            $table->string('company_name');
            $table->string('contact_person')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();

            $table->enum('status', [
                'active',
                'inactive',
                'suspended'
            ])->default('active');

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contractors');
    }
};