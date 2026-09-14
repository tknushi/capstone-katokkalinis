<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Get all employees
     */
    public function index()
    {
        $employees = User::whereHas('roles', function ($query) {
            $query->where('name', 'driver');
        })
        ->with('roles')
        ->orderBy('id', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'employees' => $employees
        ]);
    }

    /**
     * Create a new employee
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'joined_at' => 'nullable|date',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'joined_at' => $request->joined_at ?? now()->toDateString(),
            'password' => Hash::make($request->password),
        ]);

        $employeeRole = \App\Models\Role::where('name', 'driver')->first();

        if ($employeeRole) {
            $employee->roles()->attach($employeeRole->id);
        }

        $employee->load('roles');

        ActivityLog::record(
            'employee.created',
            "Added employee {$employee->name} ({$employee->email}).",
            $employee
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully.',
            'employee' => $employee
        ], 201);
    }

    /**
     * Get one employee
     */
    public function show($id)
    {
        $employee = User::whereHas('roles', function ($query) {
            $query->where('name', 'driver');
        })
        ->with('roles')
        ->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'employee' => $employee
        ]);
    }

    /**
     * Update employee
     */
    public function update(Request $request, $id)
    {
        $employee = User::whereHas('roles', function ($query) {
            $query->where('name', 'driver');
        })
        ->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'joined_at' => 'nullable|date',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $employee->name = $request->name;
        }

        if ($request->has('email')) {
            $employee->email = $request->email;
        }

        foreach (['phone', 'address', 'joined_at'] as $field) {
            if ($request->has($field)) {
                $employee->{$field} = $request->{$field};
            }
        }

        if ($request->filled('password')) {
            $employee->password = Hash::make($request->password);
        }

        $employee->save();

        $employee->load('roles');

        ActivityLog::record(
            'employee.updated',
            "Updated employee {$employee->name} ({$employee->email}).",
            $employee
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully.',
            'employee' => $employee
        ]);
    }

    /**
     * Delete employee
     */
    public function destroy($id)
    {
        $employee = User::whereHas('roles', function ($query) {
            $query->where('name', 'employee');
        })
        ->find($id);

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found.'
            ], 404);
        }

        $employee->roles()->detach();

        $name = $employee->name;
        $email = $employee->email;

        $employee->delete();

        ActivityLog::record(
            'employee.deleted',
            "Deleted employee {$name} ({$email})."
        );

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully.'
        ]);
    }
}