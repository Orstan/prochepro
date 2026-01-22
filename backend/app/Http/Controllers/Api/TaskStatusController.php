<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use App\Models\Notification;
use App\Services\SmsService;
use App\Services\WebPushService;
use App\Services\GeolocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskStatusController extends Controller
{
    /**
     * Майстер повідомляє що виїхав (в дорозі)
     */
    public function prestataireOnTheWay(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'eta_minutes' => 'nullable|integer|min:1|max:180',
        ]);

        // Перевіряємо що це виконавець цієї задачі
        $offer = $task->offers()->where('status', 'accepted')->first();
        if (!$offer || $offer->prestataire_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Геокодуємо адресу завдання якщо координат немає
        if (!$task->latitude || !$task->longitude) {
            $geoService = new GeolocationService();
            $address = trim($task->city);
            if ($address) {
                $coords = $geoService->geocodeAddress($address);
                if ($coords) {
                    $task->update([
                        'latitude' => $coords['latitude'],
                        'longitude' => $coords['longitude'],
                    ]);
                    \Log::info('TaskStatusController: Geocoded task address', [
                        'task_id' => $task->id,
                        'address' => $address,
                        'latitude' => $coords['latitude'],
                        'longitude' => $coords['longitude'],
                    ]);
                }
            }
        }

        // Оновлюємо статус
        \Log::info('TaskStatusController: Updating task status', [
            'task_id' => $task->id,
            'old_status' => $task->prestataire_status,
            'new_status' => 'on_the_way',
            'eta_minutes' => $validated['eta_minutes'] ?? 30,
        ]);
        
        $task->update([
            'prestataire_status' => 'on_the_way',
            'eta_minutes' => $validated['eta_minutes'] ?? 30,
        ]);
        
        $task->refresh();
        
        \Log::info('TaskStatusController: Task updated', [
            'task_id' => $task->id,
            'current_status' => $task->prestataire_status,
            'current_eta' => $task->eta_minutes,
        ]);

        // Сповіщаємо клієнта
        $client = User::find($task->client_id);
        $prestataire = auth()->user();
        
        if ($client) {
            $etaText = $validated['eta_minutes'] ?? 30;
            
            // Notification
            Notification::create([
                'user_id' => $client->id,
                'type' => 'prestataire_on_the_way',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'prestataire_name' => $prestataire->name,
                    'eta_minutes' => $etaText,
                ],
            ]);

            // Push notification
            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Votre prestataire est en route ! 🚗',
                    "{$prestataire->name} arrive dans environ {$etaText} minutes",
                    '/tasks/' . $task->id,
                    'on-the-way-' . $task->id
                );
            }

            // SMS notification
            if ($client->phone && $client->sms_notifications_enabled) {
                $smsService = new SmsService();
                $smsService->sendPrestataireOnTheWaySms($client->phone, $prestataire->name, "{$etaText} minutes");
            }

            // Email notification
            if ($client->email && $client->email_notifications !== false) {
                try {
                    \Mail::to($client->email)->queue(new \App\Mail\PrestataireOnTheWay($task, $prestataire, $etaText));
                } catch (\Exception $e) {
                    \Log::error('Failed to send on-the-way email: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => 'Client notifié de votre arrivée',
            'status' => 'on_the_way',
        ]);
    }

    /**
     * Майстер повідомляє що прибув на місце
     */
    public function prestataireArrived(Task $task): JsonResponse
    {
        // Перевіряємо що це виконавець цієї задачі
        $offer = $task->offers()->where('status', 'accepted')->first();
        if (!$offer || $offer->prestataire_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Оновлюємо статус
        $task->update([
            'prestataire_status' => 'arrived',
            'arrived_at' => now(),
        ]);

        // Сповіщаємо клієнта
        $client = User::find($task->client_id);
        $prestataire = auth()->user();
        
        if ($client) {
            // Notification
            Notification::create([
                'user_id' => $client->id,
                'type' => 'prestataire_arrived',
                'data' => [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'prestataire_name' => $prestataire->name,
                ],
            ]);

            // Push notification
            if ($client->push_notifications !== false) {
                $webPush = new WebPushService();
                $webPush->sendToUser(
                    $client,
                    'Votre prestataire est arrivé ! 🎯',
                    "{$prestataire->name} est sur place et prêt à commencer",
                    '/tasks/' . $task->id,
                    'arrived-' . $task->id
                );
            }

            // SMS notification
            if ($client->phone && $client->sms_notifications_enabled) {
                $smsService = new SmsService();
                $smsService->sendPrestataireArrivedSms($client->phone, $prestataire->name);
            }

            // Email notification
            if ($client->email && $client->email_notifications !== false) {
                try {
                    \Mail::to($client->email)->queue(new \App\Mail\PrestataireArrived($task, $prestataire));
                } catch (\Exception $e) {
                    \Log::error('Failed to send arrived email: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => 'Client notifié de votre arrivée',
            'status' => 'arrived',
        ]);
    }

    /**
     * Отримати поточний статус майстра
     */
    public function getStatus(Task $task): JsonResponse
    {
        return response()->json([
            'prestataire_status' => $task->prestataire_status,
            'eta_minutes' => $task->eta_minutes,
            'arrived_at' => $task->arrived_at,
        ]);
    }
}
