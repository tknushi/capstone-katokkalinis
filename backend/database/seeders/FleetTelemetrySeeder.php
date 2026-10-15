<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;
use App\Models\RouteStop;
use App\Models\RouteRun;
use App\Models\RouteTelemetryEvent;
use App\Models\Truck;
use App\Models\TruckMaintenanceRecord;
use App\Models\TruckStatusHistory;
use App\Models\User;
use App\Models\Contractor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FleetTelemetrySeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::whereHas('roles', fn($q) => $q->where('name', 'super_admin'))->first();
        $adminUser = User::whereHas('roles', fn($q) => $q->where('name', 'admin'))->first() ?? $superAdmin;
        $driverUser = User::whereHas('roles', fn($q) => $q->where('name', 'driver'))->first() ?? $superAdmin;

        // Ensure we have a default contractor
        $contractor = Contractor::first();
        if (!$contractor) {
            $contractor = Contractor::create([
                'contractor_code' => 'CTR-IPM-01',
                'company_name' => 'IPM CDO Urban Waste Haulers Inc.',
                'contact_person' => 'Engr. Roberto Gomez',
                'contact_number' => '+63 917 555 1234',
                'email' => 'operations@ipmcdo.ph',
                'address' => 'Lapasan Highway, Cagayan de Oro City',
                'status' => 'active',
                'description' => 'Accredited Solid Waste Hauling Partner for Cagayan de Oro City.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 1. SEED ROUTES & ROUTE STOPS
        |--------------------------------------------------------------------------
        */
        $routesData = [
            [
                'code' => 'RT-NORTH-01',
                'name' => 'Route 1: Sector North (Barangay 1–10)',
                'zone' => 'Sector North (Barangay 1 to 10)',
                'description' => 'Morning collection run for Divisoria, City Hall, and Poblacion North corridors.',
                'stops' => [
                    ['order' => 1, 'name' => 'Stop 1: Divisoria Plaza', 'barangay' => 'Barangay 1', 'lat' => 8.47450, 'lng' => 124.64320, 'time' => '06:00 AM'],
                    ['order' => 2, 'name' => 'Stop 2: City Hall Complex', 'barangay' => 'Barangay 2', 'lat' => 8.47600, 'lng' => 124.64410, 'time' => '06:45 AM'],
                    ['order' => 3, 'name' => 'Stop 3: Burgos St Commercial', 'barangay' => 'Barangay 4', 'lat' => 8.47750, 'lng' => 124.64500, 'time' => '07:30 AM'],
                    ['order' => 4, 'name' => 'Stop 4: Capistrano Corridor', 'barangay' => 'Barangay 7', 'lat' => 8.47900, 'lng' => 124.64580, 'time' => '08:15 AM'],
                    ['order' => 5, 'name' => 'Stop 5: Velez St Junction', 'barangay' => 'Barangay 10', 'lat' => 8.48150, 'lng' => 124.64650, 'time' => '09:00 AM'],
                ],
            ],
            [
                'code' => 'RT-CENTRAL-02',
                'name' => 'Route 2: Sector Central (Barangay 11–20)',
                'zone' => 'Sector Central (Barangay 11 to 20)',
                'description' => 'Mid-day residential & mixed commercial loop along Yacapin and Corrales Ave.',
                'stops' => [
                    ['order' => 1, 'name' => 'Stop 1: Yacapin West', 'barangay' => 'Barangay 12', 'lat' => 8.47650, 'lng' => 124.64750, 'time' => '08:00 AM'],
                    ['order' => 2, 'name' => 'Stop 2: Corrales Commercial', 'barangay' => 'Barangay 14', 'lat' => 8.47800, 'lng' => 124.64850, 'time' => '08:45 AM'],
                    ['order' => 3, 'name' => 'Stop 3: Hayes Junction', 'barangay' => 'Barangay 17', 'lat' => 8.48000, 'lng' => 124.64950, 'time' => '09:30 AM'],
                    ['order' => 4, 'name' => 'Stop 4: Osmeña St Corridor', 'barangay' => 'Barangay 19', 'lat' => 8.48200, 'lng' => 124.65050, 'time' => '10:15 AM'],
                    ['order' => 5, 'name' => 'Stop 5: Limketkai Perimeter', 'barangay' => 'Barangay 20', 'lat' => 8.48400, 'lng' => 124.65150, 'time' => '11:00 AM'],
                ],
            ],
            [
                'code' => 'RT-EAST-03',
                'name' => 'Route 3: Sector East (Barangay 21–30)',
                'zone' => 'Sector East (Barangay 21 to 30)',
                'description' => 'Afternoon haul servicing Nazareth perimeter, Chavez St, and Lapasan boundary.',
                'stops' => [
                    ['order' => 1, 'name' => 'Stop 1: Nazareth Boundary', 'barangay' => 'Barangay 22', 'lat' => 8.47300, 'lng' => 124.64900, 'time' => '01:00 PM'],
                    ['order' => 2, 'name' => 'Stop 2: Chavez St Residential', 'barangay' => 'Barangay 24', 'lat' => 8.47500, 'lng' => 124.65100, 'time' => '01:45 PM'],
                    ['order' => 3, 'name' => 'Stop 3: JR Borja Hub', 'barangay' => 'Barangay 26', 'lat' => 8.47700, 'lng' => 124.65300, 'time' => '02:30 PM'],
                    ['order' => 4, 'name' => 'Stop 4: Gaabucayan St', 'barangay' => 'Barangay 29', 'lat' => 8.47950, 'lng' => 124.65450, 'time' => '03:15 PM'],
                    ['order' => 5, 'name' => 'Stop 5: Lapasan Transfer', 'barangay' => 'Barangay 30', 'lat' => 8.48300, 'lng' => 124.65600, 'time' => '04:00 PM'],
                ],
            ],
            [
                'code' => 'RT-MARKET-04',
                'name' => 'Route 4: Commercial Core & Public Markets',
                'zone' => 'Cogon Market Commercial Zone',
                'description' => 'High-priority bulk waste sweeps for Cogon Market, Carmen Market, and wet market terminals.',
                'stops' => [
                    ['order' => 1, 'name' => 'Stop 1: Cogon Market Bulk Transfer', 'barangay' => 'Cogon Market Commercial Zone', 'lat' => 8.47761, 'lng' => 124.64821, 'time' => '05:30 AM'],
                    ['order' => 2, 'name' => 'Stop 2: JR Borja Wet Section', 'barangay' => 'Barangay 32', 'lat' => 8.47850, 'lng' => 124.64920, 'time' => '07:00 AM'],
                    ['order' => 3, 'name' => 'Stop 3: Carmen Market Terminal', 'barangay' => 'Carmen Market Commercial Zone', 'lat' => 8.48310, 'lng' => 124.63640, 'time' => '08:30 AM'],
                    ['order' => 4, 'name' => 'Stop 4: Gaabucayan Port Rd', 'barangay' => 'Barangay 36', 'lat' => 8.48550, 'lng' => 124.65200, 'time' => '10:00 AM'],
                    ['order' => 5, 'name' => 'Stop 5: Macabalan Gateway', 'barangay' => 'Barangay 40', 'lat' => 8.48800, 'lng' => 124.65400, 'time' => '11:30 AM'],
                ],
            ],
        ];

        $seededRoutes = [];
        foreach ($routesData as $rData) {
            $route = Route::updateOrCreate(
                ['code' => $rData['code']],
                [
                    'name' => $rData['name'],
                    'zone' => $rData['zone'],
                    'description' => $rData['description'],
                    'is_active' => true,
                ]
            );

            // Re-seed stops
            RouteStop::where('route_id', $route->id)->delete();
            foreach ($rData['stops'] as $s) {
                RouteStop::create([
                    'route_id' => $route->id,
                    'stop_order' => $s['order'],
                    'name' => $s['name'],
                    'barangay_or_market' => $s['barangay'],
                    'latitude' => $s['lat'],
                    'longitude' => $s['lng'],
                    'scheduled_time' => $s['time'],
                    'notes' => 'Designated solid waste collection reference checkpoint.',
                ]);
            }
            $seededRoutes[$rData['code']] = $route;
        }

        /*
        |--------------------------------------------------------------------------
        | 2. SEED SAMPLE TRUCKS
        |--------------------------------------------------------------------------
        */
        $trucks = [
            [
                'truck_number' => 'CLENRO-TRK-2026-004',
                'plate_number' => 'ABC-4102',
                'truck_type' => 'Compactor Truck (10–12 cu.m / Heavy Duty - 16T)',
                'make' => 'Isuzu',
                'model' => 'Giga FVZ',
                'year' => 2024,
                'color' => 'Forest Green',
                'chassis_number' => 'VIN-ISZ-FVZ-2024-0041',
                'engine_number' => 'ENG-6HK1-90142',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 16.0,
                'volume_capacity' => 12.0,
                'odometer_reading' => 28450,
                'or_cr_number' => 'ORCR-CDO-2024-0981',
                'registration_expiry' => '2027-04-15',
                'insurance_provider' => 'GSIS Government Insurance Group',
                'insurance_policy_number' => 'POL-GSIS-TRK-9801',
                'insurance_expiry' => '2027-05-20',
                'emission_test_date' => '2026-08-10',
                'last_maintenance_date' => '2026-09-01',
                'next_maintenance_due' => '2026-11-01',
                'ownership_type' => 'Contractor/Fleet Partner',
                'contractor_id' => $contractor->id,
                'driver_id' => $driverUser->id,
                'driver_license_number' => 'N03-12-089412',
                'driver_license_expiry' => '2028-11-14',
                'driver_contact_number' => '+63 917 555 4102',
                'crew_members' => 'Rolando D. (Sweeper), Mark B. (Loader)',
                'emergency_contact' => 'Maria Ramos (Spouse) - 0917-555-0921',
                'operating_zone' => 'Cogon Market Commercial Zone',
                'assigned_route_id' => $seededRoutes['RT-MARKET-04']->id,
                'default_schedule' => 'Morning Shift (05:00 AM – 01:00 PM)',
                'telemetry_source_id' => 'TEL-CDO-004',
                'status' => 'available',
                'notes' => 'Heavy compaction unit dedicated to Cogon Market wet sections.',
            ],
            [
                'truck_number' => 'CLENRO-TRK-2026-008',
                'plate_number' => 'KDG-8821',
                'truck_type' => 'Compactor Truck (10–12 cu.m / Heavy Duty - 16T)',
                'make' => 'Hino',
                'model' => '500 Series Wide',
                'year' => 2023,
                'color' => 'Emerald Green',
                'chassis_number' => 'VIN-HNO-500-2023-0082',
                'engine_number' => 'ENG-J08E-77319',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 16.0,
                'volume_capacity' => 10.0,
                'odometer_reading' => 34120,
                'or_cr_number' => 'ORCR-CDO-2023-5512',
                'registration_expiry' => '2027-06-30',
                'insurance_provider' => 'Pioneer Insurance Corp',
                'insurance_policy_number' => 'POL-PIO-8821',
                'insurance_expiry' => '2027-07-15',
                'emission_test_date' => '2026-07-22',
                'last_maintenance_date' => '2026-08-15',
                'next_maintenance_due' => '2026-10-25',
                'ownership_type' => 'Contractor/Fleet Partner',
                'contractor_id' => $contractor->id,
                'driver_id' => $driverUser->id,
                'driver_license_number' => 'N02-09-041829',
                'driver_license_expiry' => '2028-09-20',
                'driver_contact_number' => '+63 918 333 8821',
                'crew_members' => 'Nestor C. (Lead Sweeper), Jun P. (Loader)',
                'emergency_contact' => 'Elena Cabunoc - 0918-333-1122',
                'operating_zone' => 'Sector East: Barangay 21–30',
                'assigned_route_id' => $seededRoutes['RT-EAST-03']->id,
                'default_schedule' => 'Afternoon Shift (01:00 PM – 09:00 PM)',
                'telemetry_source_id' => 'TEL-CDO-008',
                'status' => 'on_route',
                'notes' => 'Active collection along JR Borja extension corridor.',
            ],
            [
                'truck_number' => 'CLENRO-TRK-2026-011',
                'plate_number' => 'LGU-9014',
                'truck_type' => 'Mini Dump Truck (3–4 cu.m / Narrow Alley Collector)',
                'make' => 'Mitsubishi Fuso',
                'model' => 'Canter FE71',
                'year' => 2024,
                'color' => 'White / Green Accent',
                'chassis_number' => 'VIN-FUS-CAN-2024-0113',
                'engine_number' => 'ENG-4D34-11029',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 4.5,
                'volume_capacity' => 4.0,
                'odometer_reading' => 15200,
                'or_cr_number' => 'ORCR-LGU-2024-9014',
                'registration_expiry' => '2027-09-10',
                'insurance_provider' => 'GSIS Government Insurance Group',
                'insurance_policy_number' => 'POL-GSIS-LGU-9014',
                'insurance_expiry' => '2027-10-01',
                'emission_test_date' => '2026-09-02',
                'last_maintenance_date' => '2026-09-12',
                'next_maintenance_due' => '2026-12-15',
                'ownership_type' => 'CLENRO-owned',
                'contractor_id' => null,
                'driver_id' => $driverUser->id,
                'driver_license_number' => 'K01-14-002931',
                'driver_license_expiry' => '2029-01-10',
                'driver_contact_number' => '+63 920 444 9014',
                'crew_members' => 'City Sweep Team #2 (3 sweepers)',
                'emergency_contact' => 'CLENRO Dispatch Motorpool - (088) 857-3100',
                'operating_zone' => 'Sector North: Barangay 1–10',
                'assigned_route_id' => $seededRoutes['RT-NORTH-01']->id,
                'default_schedule' => 'Morning Shift (06:00 AM – 02:00 PM)',
                'telemetry_source_id' => 'TEL-CDO-011',
                'status' => 'on_route',
                'notes' => 'Specialized narrow-chassis hauler for interior alleys in Divisoria and Burgos.',
            ],
            [
                'truck_number' => 'CLENRO-TRK-2026-015',
                'plate_number' => 'ABC-4105',
                'truck_type' => 'Arm-Roll / Hook Lift Truck (Market Bulk Bin Carrier)',
                'make' => 'Isuzu',
                'model' => 'Forward FTR',
                'year' => 2022,
                'color' => 'Forest Green',
                'chassis_number' => 'VIN-ISZ-FTR-2022-0154',
                'engine_number' => 'ENG-4HK1-55018',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 14.0,
                'volume_capacity' => 14.0,
                'odometer_reading' => 48200,
                'or_cr_number' => 'ORCR-CDO-2022-4105',
                'registration_expiry' => '2027-02-28',
                'insurance_provider' => 'Malayan Insurance Co',
                'insurance_policy_number' => 'POL-MAL-4105',
                'insurance_expiry' => '2027-03-15',
                'emission_test_date' => '2026-06-18',
                'last_maintenance_date' => '2026-08-20',
                'next_maintenance_due' => '2026-11-20',
                'ownership_type' => 'Contractor/Fleet Partner',
                'contractor_id' => $contractor->id,
                'driver_id' => $driverUser->id,
                'driver_license_number' => 'N01-08-011928',
                'driver_license_expiry' => '2028-05-19',
                'driver_contact_number' => '+63 927 666 4105',
                'crew_members' => 'Rodrigo V. (Operator), Dan P. (Hydraulic Tech)',
                'emergency_contact' => 'Teresa Villanueva - 0927-666-0012',
                'operating_zone' => 'Carmen Market Commercial Zone',
                'assigned_route_id' => $seededRoutes['RT-MARKET-04']->id,
                'default_schedule' => 'Midday Market Run (10:00 AM – 06:00 PM)',
                'telemetry_source_id' => 'TEL-CDO-015',
                'status' => 'available',
                'notes' => 'Equipped with heavy steel hooklift for 10-ton enclosed market bins.',
            ],
            [
                'truck_number' => 'CLENRO-TRK-2026-019',
                'plate_number' => 'LGU-9015',
                'truck_type' => 'Street Sweeper Vacuum Truck (Arterial Road Cleaner)',
                'make' => 'Bucher Municipal',
                'model' => 'CityCat 5006',
                'year' => 2024,
                'color' => 'Bright Yellow-Green',
                'chassis_number' => 'VIN-BCH-CAT-2024-0195',
                'engine_number' => 'ENG-VM-38910',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 6.0,
                'volume_capacity' => 6.0,
                'odometer_reading' => 12400,
                'or_cr_number' => 'ORCR-LGU-2024-9015',
                'registration_expiry' => '2027-10-31',
                'insurance_provider' => 'GSIS Government Insurance Group',
                'insurance_policy_number' => 'POL-GSIS-LGU-9015',
                'insurance_expiry' => '2027-11-15',
                'emission_test_date' => '2026-08-05',
                'last_maintenance_date' => '2026-09-08',
                'next_maintenance_due' => '2026-12-08',
                'ownership_type' => 'CLENRO-owned',
                'contractor_id' => null,
                'driver_id' => $driverUser->id,
                'driver_license_number' => 'K03-16-094112',
                'driver_license_expiry' => '2029-03-24',
                'driver_contact_number' => '+63 935 888 9015',
                'crew_members' => 'Arlene Macasero (Lead Operator), Gary S.',
                'emergency_contact' => 'CLENRO City Engineering - (088) 857-3101',
                'operating_zone' => 'Sector Commercial: Barangay 31–40',
                'assigned_route_id' => $seededRoutes['RT-CENTRAL-02']->id,
                'default_schedule' => 'Night Arterial Sweep (08:00 PM – 04:00 AM)',
                'telemetry_source_id' => 'TEL-CDO-019',
                'status' => 'on_route',
                'notes' => 'Vacuum filtration sweeper deployed on CM Recto and Velez arterial avenues.',
            ],
            [
                'truck_number' => 'CLENRO-TRK-2026-022',
                'plate_number' => 'SJC-7734',
                'truck_type' => 'Open Dump Truck (10-Wheeler / 20T Landfill Transfer)',
                'make' => 'Foton',
                'model' => 'Auman GTL 10W',
                'year' => 2021,
                'color' => 'Dark Blue',
                'chassis_number' => 'VIN-FTN-AUM-2021-0226',
                'engine_number' => 'ENG-ISG-43920',
                'fuel_type' => 'Diesel',
                'payload_capacity' => 20.0,
                'volume_capacity' => 18.0,
                'odometer_reading' => 76500,
                'or_cr_number' => 'ORCR-CDO-2021-7734',
                'registration_expiry' => '2026-12-15',
                'insurance_provider' => 'Standard Insurance Co',
                'insurance_policy_number' => 'POL-STD-7734',
                'insurance_expiry' => '2026-12-30',
                'emission_test_date' => '2026-05-14',
                'last_maintenance_date' => '2026-09-10',
                'next_maintenance_due' => '2026-10-10',
                'ownership_type' => 'Contractor/Fleet Partner',
                'contractor_id' => $contractor->id,
                'driver_id' => null,
                'driver_license_number' => null,
                'driver_license_expiry' => null,
                'driver_contact_number' => '+63 917 222 7734',
                'crew_members' => 'Motorpool Standby Crew',
                'emergency_contact' => 'City Engineer Motorpool - (088) 856-4200',
                'operating_zone' => 'Emergency Flood & Riverbank Corridor',
                'assigned_route_id' => $seededRoutes['RT-EAST-03']->id,
                'default_schedule' => 'On-Call Emergency Rotation',
                'telemetry_source_id' => 'TEL-CDO-022',
                'status' => 'maintenance',
                'notes' => 'Hydraulic lift piston replacement in progress at City Engineer motorpool.',
            ],
        ];

        foreach ($trucks as $tData) {
            $truck = Truck::updateOrCreate(
                ['plate_number' => $tData['plate_number']],
                array_merge($tData, [
                    'created_by' => $superAdmin?->id,
                    'updated_by' => $superAdmin?->id,
                ])
            );

            // Add sample maintenance record
            TruckMaintenanceRecord::firstOrCreate(
                ['truck_id' => $truck->id, 'date' => $tData['last_maintenance_date'] ?? '2026-09-01'],
                [
                    'type' => 'Preventive Maintenance & Inspection',
                    'notes' => '10,000 km periodic check, fluid levels verified, brake linings inspected.',
                    'odometer' => $tData['odometer_reading'] - 2000,
                    'cost' => 12500.00,
                    'performed_by' => 'CLENRO Central Motorpool & Certified Technicians',
                    'next_due' => $tData['next_maintenance_due'] ?? '2026-11-01',
                    'created_by' => $superAdmin?->id,
                ]
            );

            // Add initial status history record
            TruckStatusHistory::firstOrCreate(
                ['truck_id' => $truck->id, 'new_status' => $tData['status']],
                [
                    'old_status' => 'available',
                    'reason' => 'Daily municipal dispatch schedule assignment.',
                    'user_id' => $superAdmin?->id,
                    'time' => Carbon::now()->subHours(rand(1, 6)),
                ]
            );

            // For active 'on_route' trucks, seed an active today's RouteRun and Telemetry Events!
            if ($truck->status === 'on_route' && $truck->assigned_route_id) {
                $today = Carbon::today()->toDateString();
                $run = RouteRun::firstOrCreate(
                    [
                        'truck_id' => $truck->id,
                        'route_id' => $truck->assigned_route_id,
                        'date' => $today,
                    ],
                    [
                        'driver_id' => $truck->driver_id,
                        'start' => '07:30:00',
                        'end' => null,
                        'status' => 'in_progress',
                        'tonnage' => 4.8,
                    ]
                );

                $stops = RouteStop::where('route_id', $truck->assigned_route_id)->orderBy('stop_order')->get();
                // Add telemetry events for completed stops
                $completedCount = min(3, $stops->count());
                for ($i = 0; $i < $completedCount; $i++) {
                    $stop = $stops[$i];
                    RouteTelemetryEvent::firstOrCreate(
                        [
                            'run_id' => $run->id,
                            'stop_id' => $stop->id,
                            'event_type' => 'collected',
                        ],
                        [
                            'timestamp' => Carbon::now()->subMinutes((3 - $i) * 35),
                            'volume' => 1.6,
                            'notes' => "Completed scheduled collection at {$stop->name} ({$stop->barangay_or_market}).",
                        ]
                    );
                }
            }
        }
    }
}
