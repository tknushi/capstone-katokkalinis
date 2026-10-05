<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('password');
            }
            if (!Schema::hasColumn('users', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('is_archived');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_archived', 'archived_at']);
        });
    }
};
