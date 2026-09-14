<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * CLENRO Historical Garbage Pile-Up Reports for Decision Making
     * Specifically for Barangay 1 to 40, Cogon Market, and Carmen Market in Cagayan de Oro City.
     */
    public function up(): void
    {
        Schema::create('clenro_pileup_reports', function (Blueprint $table) {
            $table->id();
            $table->string('incident_code')->unique(); // e.g., CDO-CGN-2025-0104
            $table->string('location_zone'); // 'Cogon Market Zone', 'Carmen Market Zone', 'Barangay 1' ... 'Barangay 40'
            $table->unsignedTinyInteger('barangay_number')->nullable(); // 1 to 40, or NULL for Market Zones
            $table->string('specific_landmark'); // e.g., 'Yacapin St. Entrance near Veg. Stalls'
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->dateTime('incident_date');
            $table->dateTime('cleared_date')->nullable();
            $table->decimal('turnaround_hours', 6, 2)->nullable();
            $table->enum('sla_status', [
                'within_sla',        // Cleared in <= 12 hrs
                'breached_24h',      // 12 to 24 hrs
                'breached_48h',      // 24 to 48 hrs
                'critical_unresolved' // > 48 hrs or still open
            ])->default('within_sla');

            $table->decimal('waste_volume_m3', 8, 2);
            $table->decimal('estimated_tonnage', 8, 2);
            $table->enum('severity', ['low', 'moderate', 'high', 'critical'])->default('moderate');

            $table->enum('waste_category', [
                'market_organic_vegetable',
                'commercial_retail_packaging',
                'household_unsegregated',
                'single_use_plastics',
                'wet_fish_meat_waste',
                'drainage_canal_debris'
            ])->default('household_unsegregated');

            $table->enum('root_cause', [
                'market_closing_overflow',
                'delayed_contractor_dispatch',
                'unauthorized_vendor_dumping',
                'monsoon_drainage_blockage',
                'street_sweeping_backlog',
                'collection_truck_breakdown'
            ])->default('delayed_contractor_dispatch');

            $table->string('contractor_assigned')->default('IPM CDO Urban Haulers');
            $table->string('truck_plate')->nullable();
            $table->enum('status', ['resolved', 'in_progress', 'pending', 'chronic_hotspot'])->default('resolved');

            $table->text('clenro_action_taken')->nullable();
            $table->text('decision_recommendation')->nullable();
            $table->string('reported_by')->default('CLENRO Field Inspector');

            $table->timestamps();

            // Indexes for fast querying in CLENRO Decision Support System
            $table->index('location_zone');
            $table->index('barangay_number');
            $table->index('incident_date');
            $table->index('severity');
            $table->index('status');
            $table->index('root_cause');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clenro_pileup_reports');
    }
};
