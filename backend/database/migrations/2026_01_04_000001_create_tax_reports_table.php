<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestataire_id')->constrained('users')->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month')->nullable(); // null = annual report
            $table->decimal('total_revenue', 10, 2)->default(0); // Revenu brut
            $table->decimal('platform_commission', 10, 2)->default(0); // Commission ProchePro
            $table->decimal('net_revenue', 10, 2)->default(0); // Revenu net
            $table->integer('missions_count')->default(0); // Nombre de missions
            $table->integer('online_payment_missions')->default(0); // Paiements en ligne
            $table->integer('cash_payment_missions')->default(0); // Paiements en espèces
            $table->string('pdf_path')->nullable(); // Chemin vers le PDF généré
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            // Index pour recherches rapides
            $table->index(['prestataire_id', 'year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_reports');
    }
};
