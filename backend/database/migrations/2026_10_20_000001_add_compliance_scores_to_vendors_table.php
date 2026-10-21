<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->decimal('sanitation_score', 4, 1)->default(0.0)->after('status');
            $table->integer('compliance_score')->default(0)->after('sanitation_score');
            $table->string('compliance_grade', 10)->default('N/A')->after('compliance_score');
            $table->integer('violations_count')->default(0)->after('compliance_grade');
            $table->timestamp('last_inspected_at')->nullable()->after('violations_count');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'sanitation_score',
                'compliance_score',
                'compliance_grade',
                'violations_count',
                'last_inspected_at',
            ]);
        });
    }
};
