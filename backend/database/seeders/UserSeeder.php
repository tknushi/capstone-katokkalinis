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
        | ADMIN & BARANGAY ADMINS
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'System Administrator',
            email: 'admin@katokkalinis.com',
            password: 'Admin@123',
            roleName: 'admin'
        );

        $this->createUserWithRole(
            name: 'Barangay 1 Administrator',
            email: 'brgy1.admin@katokkalinis.com',
            password: 'Admin@123',
            roleName: 'barangay_admin'
        );

        $this->createUserWithRole(
            name: 'Barangay 2 Administrator',
            email: 'brgy2.admin@katokkalinis.com',
            password: 'Admin@123',
            roleName: 'barangay_admin'
        );

        /*
        |--------------------------------------------------------------------------
        | DRIVERS & FLEET OPERATORS
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'John Driver',
            email: 'driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        $this->createUserWithRole(
            name: 'Juan Driver',
            email: 'driver1@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        $this->createUserWithRole(
            name: 'Danilo Ramos',
            email: 'danilo.driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        $this->createUserWithRole(
            name: 'Rodrigo Villanueva',
            email: 'rodrigo.driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        $this->createUserWithRole(
            name: 'Nestor Cabunoc',
            email: 'nestor.driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        $this->createUserWithRole(
            name: 'Crisanto Ocampos',
            email: 'crisanto.driver@katokkalinis.com',
            password: 'Driver@123',
            roleName: 'driver'
        );

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEES / SWEEPERS & FIELD CREWS
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'Ramon Bautista',
            email: 'ramon.crew@katokkalinis.com',
            password: 'Employee@123',
            roleName: 'employee'
        );

        $this->createUserWithRole(
            name: 'Carlos Mendoza',
            email: 'carlos.crew@katokkalinis.com',
            password: 'Employee@123',
            roleName: 'employee'
        );

        $this->createUserWithRole(
            name: 'Lito Atienza',
            email: 'lito.crew@katokkalinis.com',
            password: 'Employee@123',
            roleName: 'employee'
        );

        $this->createUserWithRole(
            name: 'Mario Santos',
            email: 'mario.crew@katokkalinis.com',
            password: 'Employee@123',
            roleName: 'employee'
        );

        /*
        |--------------------------------------------------------------------------
        | INSPECTORS
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'John Inspector',
            email: 'inspector@katokkalinis.com',
            password: 'Inspector@123',
            roleName: 'inspector'
        );

        $this->createUserWithRole(
            name: 'Maria Inspector',
            email: 'maria.inspector@katokkalinis.com',
            password: 'Inspector@123',
            roleName: 'inspector'
        );

        /*
        |--------------------------------------------------------------------------
        | CONTRACTORS
        |--------------------------------------------------------------------------
        */

        $this->createUserWithRole(
            name: 'IPM Urban Haulers Manager',
            email: 'ipm.contractor@katokkalinis.com',
            password: 'Contractor@123',
            roleName: 'contractor'
        );

        /*
        |--------------------------------------------------------------------------
        | VENDOR
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
            $barangay = DB::table('barangays')->first();
            if (!$barangay) {
                $barangayId = DB::table('barangays')->insertGetId([
                    'name' => 'Barangay 1',
                    'code' => 'BRGY-001',
                    'city' => 'Cagayan de Oro City',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $barangayId = $barangay->id;
            }

            DB::table('vendors')->updateOrInsert(
                ['vendor_code' => '2026012345'],
                [
                    'user_id' => $vendorUser->id,
                    'barangay_id' => $barangayId,
                    'business_name' => 'KatokKalimpyo',
                    'owner_name' => 'Juan Dela Cruz',
                    'market' => 'Divi Public Market',
                    'stall_number' => 'Stall #12',
                    'contact_number' => '09467802940',
                    'address' => 'Barangay 123, Divi',
                    'qr_code' => '2026012345',
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