<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL USER PROFILES
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = User::with('roles');

        if (!$this->isSuperAdmin($request->user())) {
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super_admin');
            });
        }

        if ($request->filled('role')) {
            $role = $request->role;

            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully.',
            'count' => $users->count(),
            'users' => $users,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE USER PROFILE
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE USER PROFILE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($this->isSuperAdmin($user) && !$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Only the Super Admin can edit a Super Admin account.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',

            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }

        $user->save();
        $user->load('roles');

        ActivityLog::record(
            'user.updated',
            "Updated profile for {$user->name} ({$user->email}).",
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE USER ROLES (PERMISSIONS)
    |--------------------------------------------------------------------------
    */

    public function updateRoles(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($this->isSuperAdmin($user) && !$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Only the Super Admin can edit Super Admin permissions.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'role_ids' => 'present|array',
            'role_ids.*' => 'integer|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid list of role IDs.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $superAdminRole = Role::where('name', 'super_admin')->first();
        if (!$this->isSuperAdmin($request->user())
            && $superAdminRole
            && in_array($superAdminRole->id, $request->role_ids, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Only the Super Admin can assign the Super Admin role.',
            ], 403);
        }

        $user->roles()->sync($request->role_ids);
        $user->load('roles');

        ActivityLog::record(
            'user.permissions_updated',
            "Updated roles/permissions for {$user->name} ({$user->email}).",
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'User permissions updated successfully.',
            'user' => $user,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE USER
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        if ($this->isSuperAdmin($user) && !$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Only the Super Admin can delete a Super Admin account.',
            ], 403);
        }

        $name = $user->name;
        $email = $user->email;

        $user->roles()->detach();
        $user->delete();

        ActivityLog::record(
            'user.deleted',
            "Deleted user {$name} ({$email})."
        );

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    private function isSuperAdmin(?User $user): bool
    {
        return $user !== null && $user->roles()->where('name', 'super_admin')->exists();
    }
}
