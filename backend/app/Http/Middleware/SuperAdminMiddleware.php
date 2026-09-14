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
        | CHECK SUPER ADMIN ROLE
        |--------------------------------------------------------------------------
        */

        $isSuperAdmin = $request->user()
            ->roles()
            ->where('name', 'super_admin')
            ->exists();

        if (!$isSuperAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super Admin access required.',
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