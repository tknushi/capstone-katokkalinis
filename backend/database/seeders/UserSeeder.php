<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | SUPER ADMIN
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Super Administrator',
            email: 'superadmin@katokkalinis.com',
            password: 'SuperAdmin@123',
            roleName: 'super_admin'
        );

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'System Administrator',
            email: 'admin@katokkalinis.com',
            password: 'Admin@123',
            roleName: 'admin'
        );

        /*
        |--------------------------------------------------------------------------
        | DRIVER
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'John Driver',
            email: 'driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        /*
        |--------------------------------------------------------------------------
        | INSPECTOR
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'John Inspector',
            email: 'inspector@katokkalinis.com',
            password: 'Inspector@123',
            roleName: 'inspector'
        );

        /*
        |--------------------------------------------------------------------------
        | BARANGAY ADMIN (LOCAL OVERSIGHT)
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Barangay Administrator',
            email: 'barangayadmin@katokkalinis.com',
            password: 'BarangayAdmin@123',
            roleName: 'barangay_admin'
        );

        /*
        |--------------------------------------------------------------------------
        | RESIDENT (COMMUNITY HOUSEHOLD)
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Jane Resident',
            email: 'resident@katokkalinis.com',
            password: 'Resident@123',
            roleName: 'resident'
        );

        /*
        |--------------------------------------------------------------------------
        | VENDOR 1: COGON PUBLIC MARKET
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Juan Dela Cruz',
            email: 'vendor@katokkalinis.com',
            password: 'Vendor@123',
            roleName: 'vendor'
        );

        $vendorUser = DB::table('users')->where('email', 'vendor@katokkalinis.com')->first();

        if ($vendorUser) {
            $cogonBrgy = DB::table('barangays')->where('name', 'Barangay 33')->first()
                ?: DB::table('barangays')->first();

            $cogonBrgyId = $cogonBrgy ? $cogonBrgy->id : 1;

            DB::table('vendors')->updateOrInsert(
                ['vendor_code' => '2026012345'],
                [
                    'user_id' => $vendorUser->id,
                    'barangay_id' => $cogonBrgyId,
                    'business_name' => 'KatokKalimpyo Fruit & Produce',
                    'owner_name' => 'Juan Dela Cruz',
                    'market' => 'Cogon Public Market',
                    'stall_number' => 'Stall #12',
                    'contact_number' => '09467802940',
                    'address' => 'Cogon Market Zone, Cagayan de Oro City',
                    'qr_code' => '2026012345',
                    'status' => 'active',
                    'updated_at' => now(),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | VENDOR 2: CARMEN PUBLIC MARKET
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Maria Carmen',
            email: 'carmen.vendor@katokkalinis.com',
            password: 'Vendor@123',
            roleName: 'vendor'
        );

        $carmenUser = DB::table('users')->where('email', 'carmen.vendor@katokkalinis.com')->first();

        if ($carmenUser) {
            $carmenBrgy = DB::table('barangays')->where('name', 'Barangay 15')->first()
                ?: DB::table('barangays')->first();

            $carmenBrgyId = $carmenBrgy ? $carmenBrgy->id : 1;

            DB::table('vendors')->updateOrInsert(
                ['vendor_code' => '2026012346'],
                [
                    'user_id' => $carmenUser->id,
                    'barangay_id' => $carmenBrgyId,
                    'business_name' => 'Carmen Fresh Vegetables & Dry Goods',
                    'owner_name' => 'Maria Carmen Santos',
                    'market' => 'Carmen Public Market',
                    'stall_number' => 'Stall #08',
                    'contact_number' => '09351234567',
                    'address' => 'Carmen Market Zone, Cagayan de Oro City',
                    'qr_code' => '2026012346',
                    'status' => 'active',
                    'updated_at' => now(),
                ]
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE USER AND ASSIGN ROLE
    |--------------------------------------------------------------------------
    */

    private function createUserWithRole(
        string $name,
        string $email,
        string $password,
        string $roleName
    ): void {
        /*
        |--------------------------------------------------------------------------
        | Find Role
        |--------------------------------------------------------------------------
        */

        $role = DB::table('roles')
            ->where('name', $roleName)
            ->first();

        if (!$role) {
            $this->command->error(
                "Role '{$roleName}' does not exist."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Create or Update User
        |--------------------------------------------------------------------------
        */

        DB::table('users')->updateOrInsert(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Get User
        |--------------------------------------------------------------------------
        */

        $user = DB::table('users')
            ->where('email', $email)
            ->first();

        if (!$user) {
            $this->command->error(
                "Unable to create user '{$email}'."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Assign Role
        |--------------------------------------------------------------------------
        */

        DB::table('user_roles')->updateOrInsert(
            [
                'user_id' => $user->id,
                'role_id' => $role->id,
            ],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Console Output
        |--------------------------------------------------------------------------
        */

        $this->command->info(
            "Created/updated {$roleName}: {$email}"
        );
    }
}