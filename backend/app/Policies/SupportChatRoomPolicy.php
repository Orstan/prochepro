<?php

namespace App\Policies;

use App\Models\SupportChatRoom;
use App\Models\User;

class SupportChatRoomPolicy
{
    /**
     * Determine if the user can view the chat room
     */
    public function view(User $user, SupportChatRoom $room): bool
    {
        return $user->is_admin || $user->id === $room->user_id;
    }

    /**
     * Determine if the user can send messages in the chat room
     */
    public function sendMessage(User $user, SupportChatRoom $room): bool
    {
        return $user->is_admin || $user->id === $room->user_id;
    }

    /**
     * Determine if the user can close the chat room
     */
    public function close(User $user, SupportChatRoom $room): bool
    {
        return $user->is_admin || $user->id === $room->user_id;
    }

    /**
     * Determine if the user can reopen the chat room
     */
    public function reopen(User $user, SupportChatRoom $room): bool
    {
        return $user->is_admin || $user->id === $room->user_id;
    }
}
