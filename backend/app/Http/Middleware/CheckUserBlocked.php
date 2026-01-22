<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBlocked
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_blocked) {
            return response()->json([
                'message' => 'Votre compte a été bloqué en raison d\'une activité suspecte. Veuillez contacter le support.',
                'blocked' => true,
                'reason' => $request->user()->blocked_reason,
            ], 403);
        }

        return $next($request);
    }
}
