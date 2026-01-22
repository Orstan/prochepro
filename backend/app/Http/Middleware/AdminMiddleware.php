<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Try to get user from session first
        $user = auth()->user();
        
        // Fallback to header or parameter
        if (!$user) {
            $userId = $request->header('X-User-Id') ?? $request->input('user_id');
            if ($userId) {
                $user = \App\Models\User::find($userId);
            }
        }
        
        if (!$user) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }
        
        // Перевірка ролі адміна (підтримка обох варіантів)
        $isAdmin = ($user->role === 'admin' || $user->role === 'administrateur') || 
                   (isset($user->is_admin) && $user->is_admin);
        
        if (!$isAdmin) {
            return response()->json([
                'message' => 'Accès refusé. Droits administrateur requis.',
                'user_role' => $user->role ?? 'unknown',
                'user_email' => $user->email
            ], 403);
        }

        return $next($request);
    }
}
