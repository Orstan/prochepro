<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add roles as JSON array (can have multiple roles)
            $table->json('roles')->nullable()->after('role');
            // Active role - which role is currently selected
            $table->string('active_role')->nullable()->after('roles');
        });

        // Migrate existing role data to new system
        DB::table('users')->whereNotNull('role')->update([
            'roles' => DB::raw("JSON_ARRAY(role)"),
            'active_role' => DB::raw('role'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['roles', 'active_role']);
        });
    }
};
