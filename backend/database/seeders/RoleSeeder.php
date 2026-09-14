<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'resident',
                'description' => 'Resident user',
            ],
            [
                'name' => 'vendor',
                'description' => 'Public market vendor',
            ],
            [
                'name' => 'driver',
                'description' => 'Garbage truck driver',
            ],
            [
                'name' => 'inspector',
                'description' => 'Sanitation inspector',
            ],
            [
                'name' => 'barangay_admin',
                'description' => 'Barangay administrator',
            ],
            [
                'name' => 'contractor',
                'description' => 'Waste management contractor',
            ],
            [
                'name' => 'employee',
                'description' => 'KatokKalinis employee',
            ],
            [
                'name' => 'super_admin',
                'description' => 'System administrator',
            ],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name']],
                [
                    'description' => $role['description'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
