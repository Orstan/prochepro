<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Basic, Pro, Business, Unlimited
            $table->string('slug')->unique();
            $table->enum('type', ['client', 'prestataire']); // для кого пакет
            $table->integer('credits')->nullable(); // кількість кредитів (null = unlimited)
            $table->decimal('price', 8, 2); // ціна в EUR
            $table->integer('validity_days')->nullable(); // термін дії (для unlimited)
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // додаткові переваги
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default packages
        DB::table('credit_packages')->insert([
            // Client packages
            [
                'name' => 'Basic',
                'slug' => 'client-basic',
                'type' => 'client',
                'credits' => 5,
                'price' => 9.00,
                'validity_days' => null,
                'description' => '5 annonces pour publier vos tâches',
                'features' => json_encode(['5 annonces', 'Support par email']),
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pro',
                'slug' => 'client-pro',
                'type' => 'client',
                'credits' => 15,
                'price' => 19.00,
                'validity_days' => null,
                'description' => '15 annonces avec économies',
                'features' => json_encode(['15 annonces', 'Support prioritaire', 'Économisez 27%']),
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Business',
                'slug' => 'client-business',
                'type' => 'client',
                'credits' => 50,
                'price' => 49.00,
                'validity_days' => null,
                'description' => '50 annonces pour les professionnels',
                'features' => json_encode(['50 annonces', 'Support dédié', 'Économisez 45%', 'Badge Pro']),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Prestataire packages
            [
                'name' => 'Basic',
                'slug' => 'prestataire-basic',
                'type' => 'prestataire',
                'credits' => 10,
                'price' => 7.00,
                'validity_days' => null,
                'description' => '10 offres pour répondre aux tâches',
                'features' => json_encode(['10 offres', 'Support par email']),
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pro',
                'slug' => 'prestataire-pro',
                'type' => 'prestataire',
                'credits' => 30,
                'price' => 15.00,
                'validity_days' => null,
                'description' => '30 offres avec économies',
                'features' => json_encode(['30 offres', 'Support prioritaire', 'Économisez 29%']),
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Unlimited',
                'slug' => 'prestataire-unlimited',
                'type' => 'prestataire',
                'credits' => null, // unlimited
                'price' => 29.00,
                'validity_days' => 30, // 1 mois
                'description' => 'Offres illimitées pendant 1 mois',
                'features' => json_encode(['Offres illimitées', 'Support dédié', 'Badge Pro', 'Visibilité prioritaire']),
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_packages');
    }
};
