<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('barangay_id')
                ->nullable()
                ->constrained('barangays')
                ->nullOnDelete();

            $table->string('vendor_code')->unique();
            $table->string('business_name');
            $table->string('owner_name');

            $table->string('market')->nullable();
            $table->string('stall_number')->nullable();

            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();

            $table->string('qr_code')->nullable()->unique();

            $table->enum('status', [
                'active',
                'inactive',
                'suspended'
            ])->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
