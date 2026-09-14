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