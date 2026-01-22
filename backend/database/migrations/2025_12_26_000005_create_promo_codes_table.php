<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // percentage, fixed, credits, free_credits
            $table->decimal('value', 10, 2); // percentage or amount
            $table->integer('credits_amount')->nullable(); // for credits type
            $table->string('applies_to'); // all, client_credits, prestataire_credits, specific_package
            $table->unsignedBigInteger('package_id')->nullable(); // for specific package
            $table->integer('max_uses')->nullable(); // null = unlimited
            $table->integer('uses_count')->default(0);
            $table->integer('max_uses_per_user')->default(1);
            $table->decimal('min_purchase_amount', 10, 2)->nullable();
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index('code');
            $table->index('is_active');
            $table->index(['valid_from', 'valid_until']);
        });

        Schema::create('promo_code_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_code_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('discount_amount', 10, 2)->nullable();
            $table->integer('credits_awarded')->nullable();
            $table->timestamps();

            $table->index(['promo_code_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_code_usages');
        Schema::dropIfExists('promo_codes');
    }
};
