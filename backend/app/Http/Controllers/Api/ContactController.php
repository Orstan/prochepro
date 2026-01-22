<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Honeypot: if this field is filled, it's a bot
        if ($request->filled('website') || $request->filled('fax')) {
            return response()->json(['message' => 'Message envoyé avec succès.']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Send email to admin
            Mail::raw(
                "Nouveau message de contact:\n\n" .
                "Nom: {$request->name}\n" .
                "Email: {$request->email}\n" .
                "Sujet: {$request->subject}\n\n" .
                "Message:\n{$request->message}",
                function ($mail) use ($request) {
                    $mail->to(config('mail.admin_email', 'info@prochepro.fr'))
                        ->subject("Contact ProchePro: {$request->subject}")
                        ->replyTo($request->email, $request->name);
                }
            );

            return response()->json([
                'message' => 'Message envoyé avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi du message.',
            ], 500);
        }
    }
}
