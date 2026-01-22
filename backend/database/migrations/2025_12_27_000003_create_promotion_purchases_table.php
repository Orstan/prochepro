<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotion_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('package_id')->nullable()->constrained('promotion_packages')->onDelete('set null');
            $table->integer('days'); // Кількість днів (копія з пакета)
            $table->decimal('price', 10, 2)->default(0); // Ціна (0 якщо безкоштовно)
            $table->boolean('is_free')->default(false); // Чи безкоштовно (від адміна)
            $table->string('payment_intent_id')->nullable(); // Stripe payment ID
            $table->string('status')->default('pending'); // pending, completed, cancelled
            $table->timestamp('starts_at')->nullable(); // Коли починається ТОП
            $table->timestamp('expires_at')->nullable(); // Коли закінчується ТОП
            $table->foreignId('granted_by_admin_id')->nullable()->constrained('users')->onDelete('set null'); // Якщо надав адмін
            $table->timestamps();
            
            $table->index(['user_id', 'task_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_purchases');
    }
};
