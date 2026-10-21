<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | CHECK AUTHENTICATION
        |--------------------------------------------------------------------------
        */

        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK SUPER ADMIN & ADMIN ROLE (CROSS-CONNECTED)
        |--------------------------------------------------------------------------
        */

        $hasAccess = $request->user()
            ->roles()
            ->whereIn('name', ['super_admin', 'admin'])
            ->exists();

        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Administrative access required.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | ALLOW REQUEST
        |--------------------------------------------------------------------------
        */

        return $next($request);
    }
}