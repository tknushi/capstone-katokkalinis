<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;

class RoleController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL ROLES (used to build the permissions checklist)
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $roles = Role::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'roles' => $roles,
        ]);
    }
}
