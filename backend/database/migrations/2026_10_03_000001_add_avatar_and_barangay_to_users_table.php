<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->longText('avatar')->nullable()->after('address');
            }
            if (!Schema::hasColumn('users', 'barangay_id')) {
                $table->foreignId('barangay_id')
                    ->nullable()
                    ->after('avatar')
                    ->constrained('barangays')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'barangay_id')) {
                $table->dropForeign(['barangay_id']);
                $table->dropColumn('barangay_id');
            }
            if (Schema::hasColumn('users', 'avatar')) {
                $table->dropColumn('avatar');
            }
        });
    }
};
