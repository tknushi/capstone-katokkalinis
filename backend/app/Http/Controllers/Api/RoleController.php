<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ROLE HIERARCHY CONFIGURATION
    |--------------------------------------------------------------------------
    */

    public const HIERARCHY_CONFIG = [
        'super_admin' => [
            'rank' => 1,
            'category' => 'System & Administration',
            'display_title' => 'Super Admin',
            'description' => 'System & CLENRO Super Administrator',
        ],
        'admin' => [
            'rank' => 2,
            'category' => 'System & Administration',
            'display_title' => 'Barangay Admin',
            'description' => 'Barangay Administrator',
        ],
        'barangay_admin' => [
            'rank' => 2,
            'category' => 'System & Administration',
            'display_title' => 'Barangay Admin',
            'description' => 'Barangay Administrator',
        ],
        'inspector' => [
            'rank' => 3,
            'category' => 'Operations & Compliance',
            'display_title' => 'Inspector',
            'description' => 'Sanitation & Vendor Inspector',
        ],
        'contractor' => [
            'rank' => 4,
            'category' => 'Operations & Compliance',
            'display_title' => 'Contractor',
            'description' => 'Waste Management Contractor',
        ],
        'employee' => [
            'rank' => 5,
            'category' => 'Operations & Compliance',
            'display_title' => 'Employee',
            'description' => 'Operations Staff',
        ],
        'driver' => [
            'rank' => 6,
            'category' => 'Logistics & Fleet',
            'display_title' => 'Driver',
            'description' => 'Collection Truck Driver',
        ],
        'vendor' => [
            'rank' => 7,
            'category' => 'Community & Public',
            'display_title' => 'Vendor',
            'description' => 'Registered Market Vendor',
        ],
        'resident' => [
            'rank' => 8,
            'category' => 'Community & Public',
            'display_title' => 'Resident',
            'description' => 'Barangay Resident',
        ],
    ];

    /*
    |--------------------------------------------------------------------------
    | GET ALL ROLES (Ordered and categorized by hierarchy)
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $roles = Role::all()->map(function ($role) {
            $key = strtolower(trim($role->name));
            $config = self::HIERARCHY_CONFIG[$key] ?? [
                'rank' => 99,
                'category' => 'Other Roles',
                'display_title' => ucfirst($role->name),
                'description' => $role->description ?? '',
            ];

            $role->hierarchy_rank = $config['rank'];
            $role->category = $config['category'];
            $role->display_title = $config['display_title'];

            return $role;
        })->sortBy('hierarchy_rank')->values();

        // Distinct hierarchy categories in hierarchical sequence
        $categories = [
            'System & Administration',
            'Operations & Compliance',
            'Logistics & Fleet',
            'Community & Public',
        ];

        return response()->json([
            'success' => true,
            'roles' => $roles,
            'categories' => $categories,
        ]);
    }
}
