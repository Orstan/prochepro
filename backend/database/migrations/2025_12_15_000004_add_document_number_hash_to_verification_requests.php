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
        if (Schema::hasTable('verification_requests') && !Schema::hasColumn('verification_requests', 'document_number_hash')) {
            Schema::table('verification_requests', function (Blueprint $table) {
                $table->string('document_number_hash')->nullable()->after('document_number');
                $table->index('document_number_hash');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('verification_requests', 'document_number_hash')) {
            Schema::table('verification_requests', function (Blueprint $table) {
                $table->dropIndex(['document_number_hash']);
                $table->dropColumn('document_number_hash');
            });
        }
    }
};
