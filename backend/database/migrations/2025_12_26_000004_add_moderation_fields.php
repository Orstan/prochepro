<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add moderation fields to tasks
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'is_flagged')) {
                $table->boolean('is_flagged')->default(false)->after('status');
                $table->string('flag_reason')->nullable()->after('is_flagged');
                $table->timestamp('flagged_at')->nullable()->after('flag_reason');
                $table->foreignId('flagged_by')->nullable()->constrained('users')->after('flagged_at');
                $table->boolean('is_approved')->default(true)->after('flagged_by');
                $table->timestamp('moderated_at')->nullable()->after('is_approved');
                $table->foreignId('moderated_by')->nullable()->constrained('users')->after('moderated_at');
            }
        });

        // Add moderation fields to reviews
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'is_flagged')) {
                $table->boolean('is_flagged')->default(false)->after('comment');
                $table->string('flag_reason')->nullable()->after('is_flagged');
                $table->timestamp('flagged_at')->nullable()->after('flag_reason');
                $table->foreignId('flagged_by')->nullable()->constrained('users')->after('flagged_at');
                $table->boolean('is_approved')->default(true)->after('flagged_by');
                $table->timestamp('moderated_at')->nullable()->after('is_approved');
                $table->foreignId('moderated_by')->nullable()->constrained('users')->after('moderated_at');
            }
        });

        // Add moderation fields to messages
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'is_flagged')) {
                $table->boolean('is_flagged')->default(false)->after('body');
                $table->string('flag_reason')->nullable()->after('is_flagged');
                $table->timestamp('flagged_at')->nullable()->after('flag_reason');
                $table->foreignId('flagged_by')->nullable()->constrained('users')->after('flagged_at');
                $table->boolean('is_approved')->default(true)->after('flagged_by');
                $table->timestamp('moderated_at')->nullable()->after('is_approved');
                $table->foreignId('moderated_by')->nullable()->constrained('users')->after('moderated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['flagged_by']);
            $table->dropForeign(['moderated_by']);
            $table->dropColumn(['is_flagged', 'flag_reason', 'flagged_at', 'flagged_by', 'is_approved', 'moderated_at', 'moderated_by']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['flagged_by']);
            $table->dropForeign(['moderated_by']);
            $table->dropColumn(['is_flagged', 'flag_reason', 'flagged_at', 'flagged_by', 'is_approved', 'moderated_at', 'moderated_by']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['flagged_by']);
            $table->dropForeign(['moderated_by']);
            $table->dropColumn(['is_flagged', 'flag_reason', 'flagged_at', 'flagged_by', 'is_approved', 'moderated_at', 'moderated_by']);
        });
    }
};
