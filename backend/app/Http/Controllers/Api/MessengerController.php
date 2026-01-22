<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MessengerSettings;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MessengerController extends Controller
{
    /**
     * Get messenger settings for the authenticated user
     */
    public function getSettings(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $settings = MessengerSettings::firstOrCreate(['user_id' => $user->id]);
        
        return response()->json($settings);
    }

    /**
     * Update messenger settings for the authenticated user
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'telegram_enabled' => 'boolean',
            'whatsapp_enabled' => 'boolean',
            'notification_types' => 'array',
            'notification_types.*' => 'string|in:new_task,new_offer,offer_accepted,message,task_status,payment',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $settings = MessengerSettings::firstOrCreate(['user_id' => $user->id]);
        
        if ($request->has('telegram_enabled')) {
            $settings->telegram_enabled = $request->telegram_enabled;
        }
        
        if ($request->has('whatsapp_enabled')) {
            $settings->whatsapp_enabled = $request->whatsapp_enabled;
        }
        
        if ($request->has('notification_types')) {
            $settings->notification_types = $request->notification_types;
        }
        
        $settings->save();
        
        return response()->json($settings);
    }

    /**
     * Start WhatsApp verification process
     */
    public function startWhatsAppVerification(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'whatsapp_number' => 'required|string|min:10|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        // Normalize phone number
        $whatsappNumber = preg_replace('/[^0-9+]/', '', $request->whatsapp_number);
        
        // Generate a 6-digit verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Save to settings
        $settings = MessengerSettings::firstOrCreate(['user_id' => $user->id]);
        $settings->whatsapp_number = $whatsappNumber;
        $settings->whatsapp_verification_code = $verificationCode;
        $settings->whatsapp_verification_attempts = 0;
        $settings->save();
        
        // WhatsApp API integration
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.whatsapp.api_key', 'YOUR_WHATSAPP_API_KEY'),
            ])->post(config('services.whatsapp.api_url', 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages'), [
                'messaging_product' => 'whatsapp',
                'to' => $whatsappNumber,
                'type' => 'text',
                'text' => [
                    'body' => "Votre code de vérification ProchePro est: {$verificationCode}"
                ]
            ]);
            
            Log::info("WhatsApp API response: " . $response->body());
        } catch (\Exception $e) {
            Log::error("WhatsApp API error: " . $e->getMessage());
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your WhatsApp number'
        ]);
    }

    /**
     * Verify WhatsApp number with code
     */
    public function verifyWhatsApp(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'verification_code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $settings = MessengerSettings::where('user_id', $user->id)->first();
        
        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'No verification process in progress'
            ], 400);
        }
        
        // Increment attempts
        $settings->whatsapp_verification_attempts = ($settings->whatsapp_verification_attempts ?? 0) + 1;
        
        // Check if too many attempts
        if ($settings->whatsapp_verification_attempts >= 5) {
            $settings->whatsapp_verification_code = null;
            $settings->save();
            
            return response()->json([
                'success' => false,
                'message' => 'Too many verification attempts. Please request a new code.'
            ], 400);
        }
        
        // Check if code matches
        if ($settings->whatsapp_verification_code === $request->verification_code) {
            $settings->whatsapp_verified = true;
            $settings->whatsapp_verification_code = null;
            $settings->whatsapp_enabled = true;
            $settings->save();
            
            return response()->json([
                'success' => true,
                'message' => 'WhatsApp number verified successfully'
            ]);
        }
        
        $settings->save();
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid verification code'
        ], 400);
    }

    /**
     * Connect Telegram account
     */
    public function connectTelegram(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'telegram_username' => 'required|string|min:5|max:32',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        // Save to settings
        $settings = MessengerSettings::firstOrCreate(['user_id' => $user->id]);
        $settings->telegram_username = $request->telegram_username;
        $settings->save();
        
        // Generate a deep link to the Telegram bot
        $botUsername = config('services.telegram.bot_username', 'your_telegram_bot_username');
        $startParameter = base64_encode("connect_{$user->id}");
        $deepLink = "https://t.me/{$botUsername}?start={$startParameter}";
        
        // Telegram bot integration
        try {
            // Create a record in the database for further processing by the Telegram bot
            // The bot should check this record when receiving the /start command with a parameter
            $botToken = config('services.telegram.bot_token', '8588208047:AAG_jNI15Z92WLFU-5myDvJsuBSlQ_QyfLE');
            $botUsername = config('services.telegram.bot_username', 'ProchePro_bot');
            
            // Log information for debugging
            Log::info("Telegram bot info: {$botUsername} / {$botToken}");
        } catch (\Exception $e) {
            Log::error("Telegram bot error: " . $e->getMessage());
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Please open Telegram and start a conversation with our bot',
            'deep_link' => $deepLink
        ]);
    }

    /**
     * Connect Telegram directly without username
     */
    public function connectTelegramDirect(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        // Generate a random username to use as identifier
        $randomUsername = 'user_' . $user->id . '_' . substr(md5(uniqid(mt_rand(), true)), 0, 8);
        
        // Save to settings
        $settings = MessengerSettings::firstOrCreate(['user_id' => $user->id]);
        $settings->telegram_username = $randomUsername;
        $settings->save();
        
        // Generate a deep link to the Telegram bot
        $botUsername = config('services.telegram.bot_username', 'ProchePro_bot');
        $startParameter = base64_encode("connect_{$user->id}");
        $deepLink = "https://t.me/{$botUsername}?start={$startParameter}";
        
        return response()->json([
            'success' => true,
            'message' => 'Veuillez ouvrir Telegram et démarrer une conversation avec notre bot',
            'deep_link' => $deepLink
        ]);
    }

    /**
     * Test notification
     */
    public function testNotification(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $settings = MessengerSettings::where('user_id', $user->id)->first();
        
        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'No messenger settings found'
            ], 404);
        }
        
        $results = [
            'telegram' => ['success' => false, 'message' => 'Telegram notifications not enabled'],
            'whatsapp' => ['success' => false, 'message' => 'WhatsApp notifications not enabled'],
        ];
        
        // Test Telegram notification
        if ($settings->telegram_enabled && $settings->telegram_chat_id) {
            // Telegram API integration
            try {
                $response = Http::post("https://api.telegram.org/bot" . config('services.telegram.bot_token', '8588208047:AAG_jNI15Z92WLFU-5myDvJsuBSlQ_QyfLE') . "/sendMessage", [
                    'chat_id' => $settings->telegram_chat_id,
                    'text' => "Ceci est un message de test de ProchePro.fr"
                ]);
                
                Log::info("Telegram API response: " . $response->body());
            } catch (\Exception $e) {
                Log::error("Telegram API error: " . $e->getMessage());
                $results['telegram']['success'] = false;
                $results['telegram']['message'] = "Erreur lors de l'envoi du message Telegram";
            }
            
            $results['telegram'] = [
                'success' => true,
                'message' => 'Test notification sent to Telegram'
            ];
        }
        
        // Test WhatsApp notification
        if ($settings->whatsapp_enabled && $settings->whatsapp_verified && $settings->whatsapp_number) {
            // WhatsApp API integration
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('services.whatsapp.api_key', 'YOUR_WHATSAPP_API_KEY'),
                ])->post(config('services.whatsapp.api_url', 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages'), [
                    'messaging_product' => 'whatsapp',
                    'to' => $settings->whatsapp_number,
                    'type' => 'text',
                    'text' => [
                        'body' => "Ceci est un message de test de ProchePro.fr"
                    ]
                ]);
                
                Log::info("WhatsApp API response: " . $response->body());
            } catch (\Exception $e) {
                Log::error("WhatsApp API error: " . $e->getMessage());
                $results['whatsapp']['success'] = false;
                $results['whatsapp']['message'] = "Erreur lors de l'envoi du message WhatsApp";
            }
            
            $results['whatsapp'] = [
                'success' => true,
                'message' => 'Test notification sent to WhatsApp'
            ];
        }
        
        return response()->json([
            'success' => $results['telegram']['success'] || $results['whatsapp']['success'],
            'results' => $results
        ]);
    }
}