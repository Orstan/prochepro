<?php

use App\Models\Offer;
use App\Models\Task;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private channel for task chat - only client and accepted prestataire can listen
Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    $task = Task::find($taskId);
    
    if (!$task) {
        return false;
    }

    // Client can always access their task channel
    if ($user->id === $task->client_id) {
        return true;
    }

    // Prestataire can access if their offer was accepted
    $acceptedOffer = Offer::where('task_id', $taskId)
        ->where('prestataire_id', $user->id)
        ->where('status', 'accepted')
        ->first();

    return $acceptedOffer !== null;
});
