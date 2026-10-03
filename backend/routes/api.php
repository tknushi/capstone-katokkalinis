<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ContractorController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\BarangayController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\TruckController;
use App\Http\Controllers\Api\TruckLocationController;
use App\Http\Controllers\Api\CollectionRouteController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ClenroPileupReportController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ViolationController;
use App\Http\Controllers\Api\OverviewController;

use App\Http\Middleware\SuperAdminMiddleware;


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});


/*
|--------------------------------------------------------------------------
| SUPER ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    SuperAdminMiddleware::class
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEES
    |--------------------------------------------------------------------------
    */

    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | CONTRACTORS
    |--------------------------------------------------------------------------
    */

    Route::get('/contractors', [ContractorController::class, 'index']);
    Route::post('/contractors', [ContractorController::class, 'store']);
    Route::get('/contractors/{id}', [ContractorController::class, 'show']);
    Route::put('/contractors/{id}', [ContractorController::class, 'update']);
    Route::delete('/contractors/{id}', [ContractorController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | CONTRACTS
    |--------------------------------------------------------------------------
    */

    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{id}', [ContractController::class, 'show']);
    Route::put('/contracts/{id}', [ContractController::class, 'update']);
    Route::delete('/contracts/{id}', [ContractController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | HISTORY LOGS FOR ACTIVITIES (Super Admin only)
    |--------------------------------------------------------------------------
    */

    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Deleting a user account is Super Admin only. Viewing users and editing
    | their permissions/roles is shared with Admin/Barangay Admin below.
    |--------------------------------------------------------------------------
    */

    Route::delete('/users/bulk', [UserController::class, 'bulkDestroy']);
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDestroy']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

});


/*
|--------------------------------------------------------------------------
| ALL USER PROFILES + EDIT PERMISSIONS
|--------------------------------------------------------------------------
|
| Shared by Admin (Barangay Admin) and Super Admin: both roles need to see
| resident/vendor/staff profiles and customize user permissions.
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/users/bulk', [UserController::class, 'bulkDestroy']);
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDestroy']);
    Route::patch('/users/bulk-archive', [UserController::class, 'bulkArchive']);
    Route::post('/users/bulk-archive', [UserController::class, 'bulkArchive']);
    Route::patch('/users/bulk-restore', [UserController::class, 'bulkRestore']);
    Route::post('/users/bulk-restore', [UserController::class, 'bulkRestore']);
    Route::patch('/users/bulk-role', [UserController::class, 'bulkUpdateRole']);
    Route::post('/users/bulk-role', [UserController::class, 'bulkUpdateRole']);

    Route::patch('/users/{id}/archive', [UserController::class, 'archive']);
    Route::post('/users/{id}/archive', [UserController::class, 'archive']);
    Route::patch('/users/{id}/restore', [UserController::class, 'restore']);
    Route::post('/users/{id}/restore', [UserController::class, 'restore']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::put('/users/{id}/roles', [UserController::class, 'updateRoles']);

    Route::get('/roles', [RoleController::class, 'index']);
});


/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::put('/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| VENDORS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/vendors', [VendorController::class, 'index']);
    Route::post('/vendors', [VendorController::class, 'store']);
    Route::get('/vendors/{id}', [VendorController::class, 'show']);
    Route::put('/vendors/{id}', [VendorController::class, 'update']);
    Route::put('/vendors/{id}/status', [VendorController::class, 'updateStatus']);
    Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| ATTENDANCE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);

    Route::patch('/attendance/bulk-archive', [AttendanceController::class, 'bulkArchive']);
    Route::post('/attendance/bulk-archive', [AttendanceController::class, 'bulkArchive']);
    Route::patch('/attendance/bulk-restore', [AttendanceController::class, 'bulkRestore']);
    Route::post('/attendance/bulk-restore', [AttendanceController::class, 'bulkRestore']);

    Route::patch('/attendance/{id}/archive', [AttendanceController::class, 'archive']);
    Route::post('/attendance/{id}/archive', [AttendanceController::class, 'archive']);
    Route::patch('/attendance/{id}/restore', [AttendanceController::class, 'restore']);
    Route::post('/attendance/{id}/restore', [AttendanceController::class, 'restore']);

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::get('/attendance/{id}', [AttendanceController::class, 'show']);
    Route::put('/attendance/{id}', [AttendanceController::class, 'update']);
    Route::put('/attendance/{id}/status', [AttendanceController::class, 'updateStatus']);
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| COLLECTION SCHEDULES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::get('/schedules/next', [ScheduleController::class, 'next']);
    Route::get('/schedules/{id}', [ScheduleController::class, 'show']);
    Route::put('/schedules/{id}', [ScheduleController::class, 'update']);
    Route::post('/schedules/{id}/complete', [ScheduleController::class, 'complete']);
    Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| FEEDBACK, NOTIFICATIONS, & VIOLATIONS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feedback', [FeedbackController::class, 'index']);
    Route::post('/feedback', [FeedbackController::class, 'store']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/violations', [ViolationController::class, 'index']);
});


/*
|--------------------------------------------------------------------------
| BARANGAYS (read-only, used for dropdowns)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/barangays', [BarangayController::class, 'index']);
});


/*
|--------------------------------------------------------------------------
| MARKET COMPLIANCE (INSPECTIONS)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/inspections', [InspectionController::class, 'index']);
    Route::post('/inspections', [InspectionController::class, 'store']);
    Route::get('/inspections/{id}', [InspectionController::class, 'show']);
    Route::put('/inspections/{id}', [InspectionController::class, 'update']);
    Route::put('/inspections/{id}/decision', [InspectionController::class, 'decision'])
        ->middleware(SuperAdminMiddleware::class);
    Route::delete('/inspections/{id}', [InspectionController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| TRUCK LOCATION ANALYTICS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/trucks', [TruckController::class, 'index']);
    Route::post('/trucks', [TruckController::class, 'store']);
    Route::get('/trucks/{id}', [TruckController::class, 'show']);
    Route::put('/trucks/{id}', [TruckController::class, 'update']);
    Route::put('/trucks/{id}/status', [TruckController::class, 'updateStatus']);
    Route::delete('/trucks/{id}', [TruckController::class, 'destroy']);

    Route::get('/trucks/{id}/locations', [TruckLocationController::class, 'index']);
    Route::post('/trucks/{id}/locations', [TruckLocationController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| COLLECTION ROUTES (trash collection runs / Records & Archives)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/collection-routes', [CollectionRouteController::class, 'index']);
    Route::post('/collection-routes', [CollectionRouteController::class, 'store']);
    Route::get('/collection-routes/{id}', [CollectionRouteController::class, 'show']);
    Route::put('/collection-routes/{id}', [CollectionRouteController::class, 'update']);
    Route::delete('/collection-routes/{id}', [CollectionRouteController::class, 'destroy']);
});


/*
|--------------------------------------------------------------------------
| DASHBOARD ANALYTICS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/barangay-stats', [AnalyticsController::class, 'barangayAnalytics']);

    /*
    |--------------------------------------------------------------------------
    | BARANGAY OVERVIEW DASHBOARD SUMMARY & ACTIVITY LOGS
    |--------------------------------------------------------------------------
    */
    Route::get('/overview/summary', [OverviewController::class, 'summary']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});

// Demo / Local preview access without Sanctum token
Route::get('/public/overview/summary', [OverviewController::class, 'summary']);


/*
|--------------------------------------------------------------------------
| CLENRO HISTORICAL GARBAGE PILE-UP DECISION SUPPORT
| (Barangay 1 to 40, Cogon Market, Carmen Market - Cagayan de Oro City)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/clenro/pileup-reports', [ClenroPileupReportController::class, 'index']);
    Route::get('/clenro/pileup-reports/{id}', [ClenroPileupReportController::class, 'show']);
    Route::get('/clenro/pileup-reports-analytics', [ClenroPileupReportController::class, 'analytics']);
    Route::get('/clenro/pileup-reports-export', [ClenroPileupReportController::class, 'exportCsv']);
});

// Demo / Local preview access without Sanctum token
Route::get('/public/clenro/pileup-reports', [ClenroPileupReportController::class, 'index']);
Route::get('/public/clenro/pileup-reports-analytics', [ClenroPileupReportController::class, 'analytics']);
Route::get('/public/clenro/pileup-reports-export', [ClenroPileupReportController::class, 'exportCsv']);


/*
|--------------------------------------------------------------------------
| ADMIN + SUPER ADMIN SETTINGS
|--------------------------------------------------------------------------
|
| These routes intentionally use only auth:sanctum.
| AuthController checks that the authenticated user has either:
|
| admin
| super_admin
|
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::put(
        '/profile',
        [AuthController::class, 'updateProfile']
    );

    Route::put(
        '/change-password',
        [AuthController::class, 'changePassword']
    );

});