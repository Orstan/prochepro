<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create notification settings for all existing users who don't have them
        DB::statement("
            INSERT INTO user_notification_settings (user_id, enabled, notification_mode, channels, created_at, updated_at)
            SELECT 
                u.id,
                1 as enabled,
                'auto_skills' as notification_mode,
                '{\"email\": true, \"push\": true}' as channels,
                NOW() as created_at,
                NOW() as updated_at
            FROM users u
            LEFT JOIN user_notification_settings uns ON u.id = uns.user_id
            WHERE uns.id IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed - we don't want to delete settings
    }
};
