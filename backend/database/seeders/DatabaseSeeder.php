<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            BarangaySeeder::class,
            UserSeeder::class,
            Barangay1to40Seeder::class,
            ClenroPileupReportSeeder::class,
            OverviewDataSeeder::class,
        ]);
    }
}
