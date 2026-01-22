<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Fixed prices for services (for instant booking)
        Schema::create('service_fixed_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestataire_id')->constrained('users')->onDelete('cascade');
            $table->string('service_category'); // plomberie, electricite, etc.
            $table->string('service_name'); // "Débouchage", "Remplacement prise", etc.
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2); // Fixed price in EUR
            $table->integer('duration_minutes')->nullable(); // Estimated duration
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['prestataire_id', 'is_active']);
            $table->index('service_category');
        });

        // 2. Prestataire availability calendar
        Schema::create('prestataire_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestataire_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['available', 'booked', 'blocked'])->default('available');
            $table->timestamps();

            $table->unique(['prestataire_id', 'date', 'start_time']);
            $table->index(['prestataire_id', 'date', 'status']);
        });

        // 3. Instant bookings
        Schema::create('instant_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('prestataire_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('service_fixed_price_id')->constrained()->onDelete('cascade');
            
            $table->date('booking_date');
            $table->time('booking_time');
            $table->integer('duration_minutes');
            
            $table->decimal('price', 10, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            
            $table->enum('status', [
                'pending_payment',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled_by_client',
                'cancelled_by_prestataire',
                'no_show'
            ])->default('pending_payment');
            
            $table->text('client_notes')->nullable();
            $table->text('prestataire_notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            $table->string('address');
            $table->string('city');
            $table->string('postal_code', 10);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['prestataire_id', 'status']);
            $table->index(['booking_date', 'status']);
        });

        // 4. Instant booking payments
        Schema::create('instant_booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instant_booking_id')->constrained()->onDelete('cascade');
            $table->string('stripe_payment_intent_id')->unique()->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending');
            $table->enum('refund_status', ['none', 'partial', 'full'])->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->text('refund_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index(['instant_booking_id', 'status']);
        });

        // 5. Prestataire settings for instant booking
        Schema::create('prestataire_instant_booking_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestataire_id')->unique()->constrained('users')->onDelete('cascade');
            
            $table->boolean('instant_booking_enabled')->default(false);
            $table->integer('advance_booking_hours')->default(2); // Minimum hours in advance
            $table->integer('max_bookings_per_day')->default(5);
            $table->boolean('auto_confirm')->default(true); // Auto-confirm or manual?
            
            $table->time('default_start_time')->default('09:00');
            $table->time('default_end_time')->default('18:00');
            $table->json('working_days')->nullable(); // [1,2,3,4,5] = Monday to Friday
            
            $table->decimal('cancellation_fee_percentage', 5, 2)->default(0); // 0-100%
            $table->integer('free_cancellation_hours')->default(2); // Free cancellation X hours before
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instant_booking_payments');
        Schema::dropIfExists('instant_bookings');
        Schema::dropIfExists('prestataire_availability');
        Schema::dropIfExists('service_fixed_prices');
        Schema::dropIfExists('prestataire_instant_booking_settings');
    }
};
