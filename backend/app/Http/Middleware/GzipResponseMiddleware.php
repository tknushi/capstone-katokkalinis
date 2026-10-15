<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GzipResponseMiddleware
{
    /**
     * Handle an incoming request and compress JSON responses when supported by client.
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if (!function_exists('gzencode') || app()->environment('testing')) {
            return $response;
        }

        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (str_contains($acceptEncoding, 'gzip') && !$response->headers->has('Content-Encoding')) {
            $content = $response->getContent();
            // Only compress payloads larger than 1KB to avoid overhead on tiny responses
            if ($content && strlen($content) > 1024) {
                $compressed = gzencode($content, 6);
                if ($compressed !== false) {
                    $response->setContent($compressed);
                    $response->headers->set('Content-Encoding', 'gzip');
                    $response->headers->set('Content-Length', (string) strlen($compressed));
                }
            }
        }

        return $response;
    }
}
