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
            // Insurance level: null (none), basic, standard, premium
            $table->string('insurance_level')->nullable()->after('status');
            // Insurance fee paid by client
            $table->decimal('insurance_fee', 8, 2)->nullable()->after('insurance_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['insurance_level', 'insurance_fee']);
        });
    }
};
