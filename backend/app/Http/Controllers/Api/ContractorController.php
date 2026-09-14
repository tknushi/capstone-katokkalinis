<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Contractor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContractorController extends Controller
{
    /**
     * Display a listing of contractors.
     */
    public function index()
    {
        $contractors = Contractor::with('contracts')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Contractors retrieved successfully.',
            'data' => $contractors,
        ]);
    }

    /**
     * Store a newly created contractor.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contractor_code' => 'required|string|max:50|unique:contractors,contractor_code',
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,suspended',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contractor = Contractor::create([
            'contractor_code' => $request->contractor_code,
            'company_name' => $request->company_name,
            'contact_person' => $request->contact_person,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'address' => $request->address,
            'status' => $request->status,
            'description' => $request->description,
        ]);

        ActivityLog::record(
            'contractor.created',
            "Added contractor {$contractor->company_name} ({$contractor->contractor_code}).",
            $contractor
        );

        return response()->json([
            'success' => true,
            'message' => 'Contractor created successfully.',
            'data' => $contractor->load('contracts'),
        ], 201);
    }

    /**
     * Display the specified contractor.
     */
    public function show($id)
    {
        $contractor = Contractor::with('contracts')->find($id);

        if (!$contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contractor retrieved successfully.',
            'data' => $contractor,
        ]);
    }

    /**
     * Update the specified contractor.
     */
    public function update(Request $request, $id)
    {
        $contractor = Contractor::find($id);

        if (!$contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'contractor_code' => 'required|string|max:50|unique:contractors,contractor_code,' . $id,
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,suspended',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contractor->update([
            'contractor_code' => $request->contractor_code,
            'company_name' => $request->company_name,
            'contact_person' => $request->contact_person,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'address' => $request->address,
            'status' => $request->status,
            'description' => $request->description,
        ]);

        ActivityLog::record(
            'contractor.updated',
            "Updated contractor {$contractor->company_name} ({$contractor->contractor_code}).",
            $contractor
        );

        return response()->json([
            'success' => true,
            'message' => 'Contractor updated successfully.',
            'data' => $contractor->fresh()->load('contracts'),
        ]);
    }

    /**
     * Remove the specified contractor.
     */
    public function destroy($id)
    {
        $contractor = Contractor::find($id);

        if (!$contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found.',
            ], 404);
        }

        $name = $contractor->company_name;
        $contractor->delete();

        ActivityLog::record(
            'contractor.deleted',
            "Deleted contractor {$name}."
        );

        return response()->json([
            'success' => true,
            'message' => 'Contractor deleted successfully.',
        ]);
    }
}
