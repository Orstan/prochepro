<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade'); // хто запросив
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade'); // кого запросили
            $table->enum('status', ['pending', 'completed'])->default('pending'); // pending = зареєструвався, completed = виконав дію
            $table->boolean('referrer_rewarded')->default(false); // чи отримав бонус той хто запросив
            $table->boolean('referred_rewarded')->default(false); // чи отримав бонус реферал
            $table->timestamp('completed_at')->nullable(); // коли виконав дію
            $table->timestamps();

            $table->unique('referred_id'); // один користувач може бути запрошений тільки раз
        });

        // Додаємо поле referral_code до users
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 10)->unique()->nullable()->after('role');
            $table->foreignId('referred_by')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn(['referral_code', 'referred_by']);
        });
        
        Schema::dropIfExists('referrals');
    }
};
