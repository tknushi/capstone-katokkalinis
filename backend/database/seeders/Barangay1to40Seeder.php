<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Barangay1to40Seeder extends Seeder
{
    /**
     * Seeds Barangays 1 through 40 in Cagayan de Oro City, Northern Mindanao, Philippines.
     * With GPS coordinates in the Cagayan de Oro Poblacion / downtown area.
     */
    public function run(): void
    {
        // Cagayan de Oro downtown coordinates baseline: Lat 8.4750 to 8.4890, Lng 124.6400 to 124.6620
        $barangayCoordinates = [
            1 => [8.4822, 124.6472, 'Poblacion - City Health & Rizal Park Sector'],
            2 => [8.4835, 124.6480, 'Poblacion - Main Commercial Avenue & Burgos'],
            3 => [8.4842, 124.6495, 'Poblacion - Fernandez & Hayes Junction'],
            4 => [8.4815, 124.6455, 'Poblacion - Public Market & Port Access'],
            5 => [8.4800, 124.6440, 'Poblacion - Macabalan Gateway'],
            6 => [8.4785, 124.6460, 'Poblacion - Toribio Chaves St Residential'],
            7 => [8.4795, 124.6490, 'Poblacion - Corrales Ave North'],
            8 => [8.4850, 124.6470, 'Poblacion - Capistrano North Sector'],
            9 => [8.4865, 124.6485, 'Poblacion - Velez Commercial Corridor'],
            10 => [8.4875, 124.6500, 'Poblacion - Gaabucayan Industrial Fringe'],
            11 => [8.4770, 124.6450, 'Central - Tirso Neri Heritage Zone'],
            12 => [8.4760, 124.6470, 'Central - Pacana St Mixed Zone'],
            13 => [8.4755, 124.6495, 'Central - Dolores Compound'],
            14 => [8.4740, 124.6465, 'Central - Yacapin St Residential'],
            15 => [8.4730, 124.6480, 'Central - JR Borja West Corridor'],
            16 => [8.4725, 124.6510, 'Central - Osmeña Extension North'],
            17 => [8.4745, 124.6525, 'Central - Cogon Public Market Periphery'],
            18 => [8.4760, 124.6540, 'Central - Capt. Vicente Roa Sector'],
            19 => [8.4775, 124.6520, 'Central - Corrales Commercial East'],
            20 => [8.4790, 124.6535, 'Central - Limketkai Access Corridor'],
            21 => [8.4810, 124.6550, 'East - Lapasan Boundary North'],
            22 => [8.4825, 124.6565, 'East - Julio Pacana Warehouse Sector'],
            23 => [8.4840, 124.6550, 'East - Agora Terminal Linkage'],
            24 => [8.4855, 124.6530, 'East - Gaisano City Perimeter'],
            25 => [8.4830, 124.6515, 'East - Provincial Capitol Perimeter'],
            26 => [8.4815, 124.6500, 'East - Apolinar Velez Central'],
            27 => [8.4800, 124.6510, 'East - Tiano Brothers St North'],
            28 => [8.4780, 124.6505, 'East - Pabayo St Residential'],
            29 => [8.4765, 124.6515, 'East - Mortola St Junction'],
            30 => [8.4750, 124.6530, 'East - Daumar St Commercial Hub'],
            31 => [8.4735, 124.6545, 'South - Cogon Market Central Bay'],
            32 => [8.4720, 124.6535, 'South - San Agustin Cathedral Periphery'],
            33 => [8.4710, 124.6520, 'South - Burgos St Riverfront Access'],
            34 => [8.4705, 124.6500, 'South - City Hall & Gaston Park Zone'],
            35 => [8.4695, 124.6485, 'South - Carmen Bridge Approach East'],
            36 => [8.4715, 124.6470, 'South - Victoria St Riverside'],
            37 => [8.4730, 124.6455, 'South - CDO Riverbank West Sector'],
            38 => [8.4745, 124.6440, 'South - Consolacion Perimeter Road'],
            39 => [8.4760, 124.6425, 'South - Puntod Port Access Route'],
            40 => [8.4780, 124.6410, 'South - Macabalan Coastal Boundary'],
        ];

        for ($i = 1; $i <= 40; $i++) {
            $coord = $barangayCoordinates[$i];
            $name = "Barangay {$i}";
            $code = sprintf("CDO-BRGY-%02d", $i);

            // Assign standard garbage truck route:
            // Route 1 (KAL-101): Brgy 1-10
            // Route 2 (KAL-102): Brgy 11-20
            // Route 3 (KAL-103): Brgy 21-30
            // Route 4 (KAL-104): Brgy 31-40
            $routeNum = ceil($i / 10);
            $assignedTruck = sprintf("KAL-%03d", 100 + $routeNum);

            DB::table('barangays')->updateOrInsert(
                ['code' => $code],
                [
                    'name' => $name,
                    'city' => 'Cagayan de Oro City',
                    'latitude' => $coord[0],
                    'longitude' => $coord[1],
                    'description' => "{$coord[2]} • Route #{$routeNum} (Truck {$assignedTruck})",
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Seed 4 garbage trucks for Cagayan de Oro routes
        $driverUser = DB::table('users')->where('email', 'driver@katokkalinis.com')->first();
        $driverId = $driverUser ? $driverUser->id : null;

        for ($t = 1; $t <= 4; $t++) {
            $plate = sprintf("KAL-%03d", 100 + $t);
            $num = "TRK-0" . $t;
            $type = $t % 2 === 0 ? "Compactor Truck" : "Rear-Loader Compactor";

            DB::table('trucks')->updateOrInsert(
                ['plate_number' => $plate],
                [
                    'truck_number' => $num,
                    'driver_id' => $driverId,
                    'truck_type' => $type,
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info("Seeded 40 Barangays in Cagayan de Oro City and 4 garbage trucks (KAL-101 to KAL-104).");
    }
}
