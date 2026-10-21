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

        if ($request->has('status')) {
            $status = strtolower($request->status);
            if ($status === 'active') {
                $query->where('is_archived', false);
            } elseif ($status === 'archived') {
                $query->where('is_archived', true);
            }
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
                'message' => 'Access Denied: Super Administrator accounts cannot be modified by lower hierarchy roles.',
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
                'message' => 'Access Denied: Only Super Administrators can modify Super Admin permissions.',
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
                'message' => 'Access Denied: Only Super Administrators can grant Super Admin privileges.',
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
        $user = User::with('roles')->find($id);

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

        if ($this->isSuperAdmin($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Access Denied: Super Administrator accounts are system protected and cannot be permanently removed or deleted.',
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

    /*
    |--------------------------------------------------------------------------
    | BULK DELETE USERS
    |--------------------------------------------------------------------------
    */

    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid array of user IDs to delete.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currentUserId = $request->user()?->id;
        $isSuperAdmin = $this->isSuperAdmin($request->user());

        $users = User::with('roles')->whereIn('id', $request->ids)->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching users found to delete.',
            ], 404);
        }

        foreach ($users as $user) {
            if ($this->isSuperAdmin($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Super Administrator accounts are system protected and cannot be deleted or permanently removed.',
                    'errors' => ['ids' => ["Cannot delete protected Super Admin user '{$user->name}'."]],
                ], 403);
            }
        }

        $deletedCount = 0;
        $deletedNames = [];

        foreach ($users as $user) {
            // Cannot delete own account
            if ($currentUserId && $user->id === $currentUserId) {
                continue;
            }

            // Super Admin accounts can never be deleted
            if ($this->isSuperAdmin($user)) {
                continue;
            }

            $name = $user->name;
            $email = $user->email;

            $user->roles()->detach();
            $user->delete();

            $deletedNames[] = "{$name} ({$email})";
            $deletedCount++;
        }

        if ($deletedCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'None of the selected users could be deleted (they may be protected or your own account).',
            ], 403);
        }

        ActivityLog::record(
            'user.bulk_deleted',
            "Bulk deleted {$deletedCount} user(s): " . implode(', ', array_slice($deletedNames, 0, 5)) . ($deletedCount > 5 ? ' and more.' : '.')
        );

        return response()->json([
            'success' => true,
            'message' => "{$deletedCount} " . ($deletedCount === 1 ? 'user' : 'users') . " deleted successfully.",
            'deleted_count' => $deletedCount,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ARCHIVE USER (SOFT-DELETE)
    |--------------------------------------------------------------------------
    */

    public function archive(Request $request, $id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($request->user() && $request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot archive your own account.',
            ], 422);
        }

        if ($this->isSuperAdmin($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Super Administrator accounts are system protected and cannot be archived or removed.',
            ], 403);
        }

        $user->is_archived = true;
        $user->archived_at = now();
        $user->save();
        $user->load('roles');

        ActivityLog::record(
            'user.archived',
            "Archived user {$user->name} ({$user->email}).",
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'User archived successfully.',
            'user' => $user,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | RESTORE USER (UNARCHIVE)
    |--------------------------------------------------------------------------
    */

    public function restore(Request $request, $id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        if ($this->isSuperAdmin($user) && !$this->isSuperAdmin($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Access Denied: Super Administrator accounts cannot be restored by lower hierarchy roles.',
            ], 403);
        }

        $user->is_archived = false;
        $user->archived_at = null;
        $user->save();
        $user->load('roles');

        ActivityLog::record(
            'user.restored',
            "Restored user {$user->name} ({$user->email}).",
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'User restored successfully.',
            'user' => $user,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BULK ARCHIVE USERS (SOFT-DELETE)
    |--------------------------------------------------------------------------
    */

    public function bulkArchive(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid array of user IDs to archive.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currentUserId = $request->user()?->id;
        $isSuperAdmin = $this->isSuperAdmin($request->user());

        $users = User::with('roles')->whereIn('id', $request->ids)->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching users found to archive.',
            ], 404);
        }

        foreach ($users as $user) {
            if ($this->isSuperAdmin($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Super Administrator accounts are system protected and cannot be archived or removed.',
                    'errors' => ['ids' => ["Cannot archive protected Super Admin user '{$user->name}'."]],
                ], 403);
            }
        }

        $archivedCount = 0;
        $archivedNames = [];

        foreach ($users as $user) {
            // Cannot archive own account
            if ($currentUserId && $user->id === $currentUserId) {
                continue;
            }

            // Never archive Super Admin accounts
            if ($this->isSuperAdmin($user)) {
                continue;
            }

            $user->is_archived = true;
            $user->archived_at = now();
            $user->save();

            $archivedNames[] = "{$user->name} ({$user->email})";
            $archivedCount++;
        }

        if ($archivedCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'None of the selected users could be archived (they may be protected or your own account).',
                'errors' => ['ids' => ['None of the selected users could be archived.']],
            ], 403);
        }

        ActivityLog::record(
            'user.bulk_archived',
            "Bulk archived {$archivedCount} user(s): " . implode(', ', array_slice($archivedNames, 0, 5)) . ($archivedCount > 5 ? ' and more.' : '.')
        );

        return response()->json([
            'success' => true,
            'message' => "{$archivedCount} " . ($archivedCount === 1 ? 'user' : 'users') . " archived successfully.",
            'archived_count' => $archivedCount,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | BULK RESTORE USERS
    |--------------------------------------------------------------------------
    */

    public function bulkRestore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid array of user IDs to restore.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $isSuperAdmin = $this->isSuperAdmin($request->user());

        $users = User::with('roles')->whereIn('id', $request->ids)->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching users found to restore.',
            ], 404);
        }

        if (!$isSuperAdmin) {
            foreach ($users as $user) {
                if ($this->isSuperAdmin($user)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access Denied: Lower hierarchy roles cannot restore Super Administrator accounts.',
                        'errors' => ['ids' => ["Cannot restore protected Super Admin user '{$user->name}'."]],
                    ], 403);
                }
            }
        }

        $restoredCount = 0;
        $restoredNames = [];

        foreach ($users as $user) {
            // Only Super Admin can restore a Super Admin account
            if ($this->isSuperAdmin($user) && !$isSuperAdmin) {
                continue;
            }

            $user->is_archived = false;
            $user->archived_at = null;
            $user->save();

            $restoredNames[] = "{$user->name} ({$user->email})";
            $restoredCount++;
        }

        if ($restoredCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'None of the selected users could be restored (they may be protected accounts).',
                'errors' => ['ids' => ['None of the selected users could be restored.']],
            ], 403);
        }

        ActivityLog::record(
            'user.bulk_restored',
            "Bulk restored {$restoredCount} user(s): " . implode(', ', array_slice($restoredNames, 0, 5)) . ($restoredCount > 5 ? ' and more.' : '.')
        );

        return response()->json([
            'success' => true,
            'message' => "{$restoredCount} " . ($restoredCount === 1 ? 'user' : 'users') . " restored successfully.",
            'restored_count' => $restoredCount,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | BULK REASSIGN ROLE
    |--------------------------------------------------------------------------
    */

    public function bulkUpdateRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
            'role' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid user IDs and a target role.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetRoleName = strtolower(trim($request->role));
        $targetRole = Role::where('name', $targetRoleName)->first();

        if (!$targetRole) {
            return response()->json([
                'success' => false,
                'message' => "Role '{$request->role}' does not exist.",
            ], 404);
        }

        $isSuperAdmin = $this->isSuperAdmin($request->user());

        // Only super admin can assign the super_admin role
        if ($targetRoleName === 'super_admin' && !$isSuperAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Access Denied: Only Super Administrators can assign the Super Admin role.',
            ], 403);
        }

        $users = User::with('roles')->whereIn('id', $request->ids)->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No matching users found to reassign.',
            ], 404);
        }

        if (!$isSuperAdmin) {
            foreach ($users as $user) {
                if ($this->isSuperAdmin($user)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Access Denied: Lower hierarchy roles cannot reassign Super Administrator accounts.',
                        'errors' => ['ids' => ["Cannot modify protected Super Admin user '{$user->name}'."]],
                    ], 403);
                }
            }
        }

        $updatedCount = 0;
        $updatedNames = [];

        foreach ($users as $user) {
            // Non-super-admins cannot alter super_admin accounts
            if ($this->isSuperAdmin($user) && !$isSuperAdmin) {
                continue;
            }

            // Sync with the target role
            $user->roles()->sync([$targetRole->id]);
            $updatedNames[] = $user->name;
            $updatedCount++;
        }

        if ($updatedCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'None of the selected users could be reassigned (protected accounts).',
            ], 403);
        }

        $roleLabel = ucfirst($targetRole->name);
        ActivityLog::record(
            'user.bulk_role_updated',
            "Reassigned {$updatedCount} user(s) to role '{$roleLabel}': " . implode(', ', array_slice($updatedNames, 0, 5)) . ($updatedCount > 5 ? ' and more.' : '.')
        );

        return response()->json([
            'success' => true,
            'message' => "{$updatedCount} " . ($updatedCount === 1 ? 'user' : 'users') . " reassigned to {$roleLabel} successfully.",
            'updated_count' => $updatedCount,
            'role' => $targetRole->name,
        ]);
    }

    private function isSuperAdmin(?User $user): bool
    {
        return $user !== null && $user->roles()->where('name', 'super_admin')->exists();
    }
}
