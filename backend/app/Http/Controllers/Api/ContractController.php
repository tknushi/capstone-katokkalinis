<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Contractor;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * Display all contracts.
     */
    public function index()
    {
        $contracts = Contract::with('contractor')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Contracts retrieved successfully.',
            'data' => $contracts,
        ]);
    }

    /**
     * Create a new contract.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contractor_id' => [
                'required',
                'integer',
                'exists:contractors,id',
            ],

            'contract_value' => [
                'required',
                'numeric',
                'min:0',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],

            'performance' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'status' => [
                'required',
                'in:active,completed,expired,suspended',
            ],
        ]);

        // Make sure contractor exists and is active.
        $contractor = Contractor::find($validated['contractor_id']);

        if (!$contractor) {
            return response()->json([
                'success' => false,
                'message' => 'Contractor not found.',
            ], 422);
        }

        if ($contractor->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'The selected contractor is not active.',
            ], 422);
        }

        $contract = Contract::create($validated);

        $contract->load('contractor');

        return response()->json([
            'success' => true,
            'message' => 'Contract created successfully.',
            'data' => $contract,
        ], 201);
    }

    /**
     * Display one contract.
     */
    public function show($id)
    {
        $contract = Contract::with('contractor')->find($id);

        if (!$contract) {
            return response()->json([
                'success' => false,
                'message' => 'Contract not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contract retrieved successfully.',
            'data' => $contract,
        ]);
    }

    /**
     * Update a contract.
     */
    public function update(Request $request, $id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json([
                'success' => false,
                'message' => 'Contract not found.',
            ], 404);
        }

        $validated = $request->validate([
            'contractor_id' => [
                'sometimes',
                'integer',
                'exists:contractors,id',
            ],

            'contract_value' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'start_date' => [
                'sometimes',
                'date',
            ],

            'end_date' => [
                'sometimes',
                'date',
                'after_or_equal:start_date',
            ],

            'performance' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:100',
            ],

            'status' => [
                'sometimes',
                'in:active,completed,expired,suspended',
            ],
        ]);

        // If contractor is being changed,
        // make sure the contractor exists and is active.
        if (isset($validated['contractor_id'])) {
            $contractor = Contractor::find($validated['contractor_id']);

            if (!$contractor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contractor not found.',
                ], 422);
            }

            if ($contractor->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected contractor is not active.',
                ], 422);
            }
        }

        $contract->update($validated);

        $contract->load('contractor');

        return response()->json([
            'success' => true,
            'message' => 'Contract updated successfully.',
            'data' => $contract,
        ]);
    }

    /**
     * Delete a contract.
     */
    public function destroy($id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json([
                'success' => false,
                'message' => 'Contract not found.',
            ], 404);
        }

        $contract->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contract deleted successfully.',
        ]);
    }
}
