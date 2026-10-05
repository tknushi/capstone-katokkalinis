<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid email and password.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::with('roles')
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $token = $user
            ->createToken('katokkalinis-web')
            ->plainTextToken;

        ActivityLog::record(
            'auth.login',
            "{$user->name} ({$user->email}) logged in.",
            $user,
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'barangay_id' => $user->barangay_id,

                'roles' => $user->roles->map(function ($role) {
                    return [
                        'name' => $role->name,
                    ];
                })->values(),
            ],
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | REGISTER
    |--------------------------------------------------------------------------
    */

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',

            'email' => [
                'required',
                'email',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'role' => 'required|in:resident,vendor',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check your registration information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $barangayId = $request->barangay_id;
        if (!$barangayId && $request->filled('barangay')) {
            $b = \App\Models\Barangay::where('name', 'like', "%{$request->barangay}%")->first();
            if ($b) $barangayId = $b->id;
        } elseif (!$barangayId && $request->filled('address')) {
            $b = \App\Models\Barangay::where('name', 'like', "%{$request->address}%")->first();
            if ($b) $barangayId = $b->id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone ?? $request->contact_number,
            'address' => $request->address ?? $request->barangay,
            'barangay_id' => $barangayId,
            'joined_at' => now(),
        ]);

        $role = Role::where('name', $request->role)->first();

        if (!$role) {
            $user->delete();

            return response()->json([
                'success' => false,
                'message' => 'Selected role does not exist.',
            ], 400);
        }

        $user->roles()->attach($role->id);

        $token = $user
            ->createToken('katokkalinis-mobile')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'token' => $token,

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'barangay_id' => $user->barangay_id,

                'roles' => [
                    [
                        'name' => $role->name,
                    ],
                ],
            ],
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | FORGOT PASSWORD
    |--------------------------------------------------------------------------
    */

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid email address.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where(
            'email',
            $request->email
        )->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account was found with this email address.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset request received. Your email account was found.',
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    public function me(Request $request)
    {
        $user = $request->user()->load(['roles', 'vendor']);

        if (!$this->canManageOwnAccount($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to access your profile.',
            ], 403);
        }

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'contact_number' => $user->phone,
            'address' => $user->address,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
            'barangay_id' => $user->barangay_id,
            'barangay' => $user->barangay,
            'roles' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            })->values(),
        ];

        if ($user->vendor) {
            $userData['vendor'] = $user->vendor;
        }

        return response()->json([
            'success' => true,
            'user' => $userData,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE PROFILE
    |--------------------------------------------------------------------------
    */

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$this->canManageOwnAccount($user)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this profile.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check your profile information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('phone') || $request->filled('contact_number')) {
            $user->phone = $request->phone ?? $request->contact_number;
        }
        if ($request->filled('address')) {
            $user->address = $request->address;
            $b = \App\Models\Barangay::where('name', 'like', "%{$request->address}%")->first();
            if ($b) {
                $user->barangay_id = $b->id;
            }
        }
        if ($request->filled('barangay_id')) {
            $user->barangay_id = $request->barangay_id;
        }

        // Handle profile photo upload (File or Base64)
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $fileName = 'avatar_' . $user->id . '_' . time() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
            $file->storeAs('avatars', $fileName, 'public');
            $user->avatar = '/storage/avatars/' . $fileName;
        } elseif ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileName = 'avatar_' . $user->id . '_' . time() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
            $file->storeAs('avatars', $fileName, 'public');
            $user->avatar = '/storage/avatars/' . $fileName;
        } elseif ($request->filled('avatar')) {
            $rawAvatar = $request->avatar;
            if (preg_match('/^data:image\/(\w+);base64,/', $rawAvatar, $type)) {
                $base64Data = substr($rawAvatar, strpos($rawAvatar, ',') + 1);
                $ext = strtolower($type[1]);
                if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $ext = 'jpg';
                }
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->put('avatars/' . $fileName, $decoded);
                    $user->avatar = '/storage/avatars/' . $fileName;
                }
            } elseif (filter_var($rawAvatar, FILTER_VALIDATE_URL) || str_starts_with($rawAvatar, '/storage/')) {
                $user->avatar = $rawAvatar;
            }
        }

        $user->save();

        $user->load(['roles', 'vendor', 'barangay']);

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'contact_number' => $user->phone,
            'address' => $user->address,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
            'barangay_id' => $user->barangay_id,
            'barangay' => $user->barangay,
            'roles' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            })->values(),
        ];

        if ($user->vendor) {
            $userData['vendor'] = $user->vendor;
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $userData,
        ]);
    }



    /*
    |--------------------------------------------------------------------------
    | CHANGE PASSWORD
    |--------------------------------------------------------------------------
    */

   public function changePassword(Request $request)
{
    $user = $request->user();

    if (!$this->canManageOwnAccount($user)) {
        return response()->json([
            'success' => false,
            'message' => 'You are not authorized to change this password.',
        ], 403);
    }

    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',

        'new_password' => [
            'required',
            'string',
            'min:8',
            'confirmed',
        ],
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Please check your password information.',
            'errors' => $validator->errors(),
        ], 422);
    }

    // Check the current password
    if (!Hash::check(
        $request->current_password,
        $user->password
    )) {
        return response()->json([
            'success' => false,
            'message' => 'Current password is incorrect.',
        ], 422);
    }

    // Make sure the new password is different
    if (Hash::check(
        $request->new_password,
        $user->password
    )) {
        return response()->json([
            'success' => false,
            'message' => 'Your new password must be different from your current password.',
        ], 422);
    }

    // Hash the new password before saving it
    $user->password = Hash::make($request->new_password);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Password changed successfully.',
    ]);
}
    /*
    |--------------------------------------------------------------------------
    | ADMIN CHECK
    |--------------------------------------------------------------------------
    */

    private function isAdminUser(User $user): bool
    {
        return $user->roles()
            ->whereIn('name', [
                'admin',
                'super_admin',
            ])
            ->exists();
    }

    private function canManageOwnAccount(User $user): bool
    {
        return $user->roles()
            ->whereIn('name', [
                'admin',
                'super_admin',
                'driver',
                'inspector',
                'resident',
                'vendor',
                'barangay_admin',
                'employee',
                'contractor',
            ])
            ->exists();
    }
}