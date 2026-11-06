<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today()->toDateString();

        $records = [
            // 1. Danilo Ramos (Driver) - Present On-Time
            [
                'email' => 'danilo.driver@katokkalinis.com',
                'name' => 'Danilo Ramos',
                'time_in' => '04:45:00',
                'time_out' => '13:10:00',
                'status' => 'present',
                'remarks' => 'Compactor #04 (ABC-4102) Morning Arterial Run',
            ],
            // 2. Rodrigo Villanueva (Driver) - Present On-Time
            [
                'email' => 'rodrigo.driver@katokkalinis.com',
                'name' => 'Rodrigo Villanueva',
                'time_in' => '04:52:00',
                'time_out' => '13:05:00',
                'status' => 'present',
                'remarks' => 'Arm-Roll #01 Carmen Commercial Route',
            ],
            // 3. Nestor Cabunoc (Driver) - Present On-Time
            [
                'email' => 'nestor.driver@katokkalinis.com',
                'name' => 'Nestor Cabunoc',
                'time_in' => '05:00:00',
                'time_out' => '13:00:00',
                'status' => 'present',
                'remarks' => 'Mini Dump #02 Secondary Waste Corridors',
            ],
            // 4. John Driver (Driver) - Present On-Time
            [
                'email' => 'driver@katokkalinis.com',
                'name' => 'John Driver',
                'time_in' => '04:50:00',
                'time_out' => '13:15:00',
                'status' => 'present',
                'remarks' => 'Truck KAL-104 South Poblacion Active Mobile Run',
            ],
            // 5. Juan Driver (Driver) - Present On-Time
            [
                'email' => 'driver1@katokkalinis.com',
                'name' => 'Juan Driver',
                'time_in' => '05:05:00',
                'time_out' => '13:00:00',
                'status' => 'present',
                'remarks' => 'Truck KAL-101 North Poblacion Corridor',
            ],
            // 6. Ramon Bautista (Sweeper / Crew) - Present On-Time
            [
                'email' => 'ramon.crew@katokkalinis.com',
                'name' => 'Ramon Bautista',
                'time_in' => '05:15:00',
                'time_out' => '13:30:00',
                'status' => 'present',
                'remarks' => 'Cogon Market Perimeter Street Sweep',
            ],
            // 7. Carlos Mendoza (Sweeper / Crew) - Present On-Time
            [
                'email' => 'carlos.crew@katokkalinis.com',
                'name' => 'Carlos Mendoza',
                'time_in' => '05:10:00',
                'time_out' => '13:30:00',
                'status' => 'present',
                'remarks' => 'Velez & Burgos St. Commercial Strip Cleaning',
            ],
            // 8. John Inspector (Inspector) - Present On-Time
            [
                'email' => 'inspector@katokkalinis.com',
                'name' => 'John Inspector',
                'time_in' => '07:30:00',
                'time_out' => '16:30:00',
                'status' => 'present',
                'remarks' => 'Divisoria Public Market Sanitary Audit',
            ],
            // 9. Maria Inspector (Inspector) - Present On-Time
            [
                'email' => 'maria.inspector@katokkalinis.com',
                'name' => 'Maria Inspector',
                'time_in' => '07:40:00',
                'time_out' => '16:30:00',
                'status' => 'present',
                'remarks' => 'Carmen Market Stalls Compliance Inspection',
            ],
            // 10. Super Administrator (Admin) - Present On-Time
            [
                'email' => 'superadmin@katokkalinis.com',
                'name' => 'Super Administrator',
                'time_in' => '07:15:00',
                'time_out' => '17:00:00',
                'status' => 'present',
                'remarks' => 'CLENRO Central Command & Dispatch Oversight',
            ],

            // 11. Crisanto Ocampos (Driver) - Late Arrival
            [
                'email' => 'crisanto.driver@katokkalinis.com',
                'name' => 'Crisanto Ocampos',
                'time_in' => '05:42:00',
                'time_out' => '13:45:00',
                'status' => 'late',
                'remarks' => 'Mechanical pre-trip tire inspection delayed departure',
            ],
            // 12. Lito Atienza (Sweeper / Crew) - Late Arrival
            [
                'email' => 'lito.crew@katokkalinis.com',
                'name' => 'Lito Atienza',
                'time_in' => '05:35:00',
                'time_out' => '13:30:00',
                'status' => 'late',
                'remarks' => 'Traffic detour at Puerto flyover',
            ],
            // 13. Mario Santos (Sweeper / Crew) - Late Arrival
            [
                'email' => 'mario.crew@katokkalinis.com',
                'name' => 'Mario Santos',
                'time_in' => '05:38:00',
                'time_out' => '13:30:00',
                'status' => 'late',
                'remarks' => 'Assigned to backup corridor sweeping',
            ],

            // 14. Barangay 1 Administrator - On Leave
            [
                'email' => 'brgy1.admin@katokkalinis.com',
                'name' => 'Barangay 1 Administrator',
                'time_in' => null,
                'time_out' => null,
                'status' => 'on_leave',
                'remarks' => 'Official LGU Local Government Training Leave',
            ],
            // 15. System Administrator - Absent
            [
                'email' => 'admin@katokkalinis.com',
                'name' => 'System Administrator',
                'time_in' => null,
                'time_out' => null,
                'status' => 'absent',
                'remarks' => 'Emergency leave filed; relief operations active',
            ],
        ];

        foreach ($records as $item) {
            $user = User::where('email', $item['email'])->first();

            if (!$user) {
                // If user record wasn't found by email, find by name
                $user = User::where('name', $item['name'])->first();
            }

            if (!$user) {
                // Create user if missing
                $user = User::create([
                    'name' => $item['name'],
                    'email' => $item['email'],
                    'password' => bcrypt('Password@123'),
                ]);
            }

            Attendance::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $today,
                ],
                [
                    'time_in' => $item['time_in'],
                    'time_out' => $item['time_out'],
                    'status' => $item['status'],
                    'remarks' => $item['remarks'],
                    'is_archived' => false,
                ]
            );
        }

        $this->command->info('Seeded ' . count($records) . ' attendance records.');
    }
}

