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
            ClenroPileupReportSeeder::class,
            OverviewDataSeeder::class,
        ]);
    }
}
