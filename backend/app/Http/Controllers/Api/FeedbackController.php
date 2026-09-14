<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL FEEDBACK
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $user = $request->user();
        $isStaff = $user->roles()->whereIn('name', ['super_admin', 'admin', 'barangay_admin'])->exists();

        $query = Feedback::with('resident:id,name,email')->latest();

        if (!$isStaff) {
            $query->where('resident_id', $user->id);
        }

        $feedbacks = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Feedbacks retrieved successfully.',
            'feedbacks' => $feedbacks,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SUBMIT FEEDBACK
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid feedback content.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $feedback = Feedback::create([
            'resident_id' => $request->user()->id,
            'content' => $request->content,
            'status' => 'new',
        ]);

        $feedback->load('resident:id,name,email');

        ActivityLog::record(
            'feedback.created',
            "Resident {$request->user()->name} submitted feedback.",
            $feedback
        );

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully.',
            'feedback' => $feedback,
        ], 201);
    }
}
