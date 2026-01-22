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
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('prestataire_status')->nullable()->after('status');
            $table->integer('eta_minutes')->nullable()->after('prestataire_status');
            $table->timestamp('arrived_at')->nullable()->after('eta_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['prestataire_status', 'eta_minutes', 'arrived_at']);
        });
    }
};
