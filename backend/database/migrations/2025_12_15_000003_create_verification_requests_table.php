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
        // Add verification fields to users table (only if they don't exist)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('avatar');
            }
            if (!Schema::hasColumn('users', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('is_verified');
            }
            if (!Schema::hasColumn('users', 'verification_status')) {
                $table->string('verification_status')->default('none')->after('verified_at'); // none, pending, approved, rejected
            }
        });

        // Create verification requests table (only if it doesn't exist)
        if (!Schema::hasTable('verification_requests')) {
            Schema::create('verification_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('document_type'); // cni (Carte Nationale d'Identité), permis (Permis de conduire)
                $table->string('document_front_path'); // Front side of document
                $table->string('document_back_path')->nullable(); // Back side of document (optional)
                $table->string('selfie_path')->nullable(); // Selfie with document (optional but recommended)
                $table->string('first_name');
                $table->string('last_name');
                $table->date('date_of_birth')->nullable();
                $table->string('document_number')->nullable(); // Document number (legacy, not used)
                $table->string('document_number_hash')->nullable(); // SHA256 hash of document number for duplicate check
                $table->string('status')->default('pending'); // pending, approved, rejected
                $table->text('rejection_reason')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
                
                $table->index(['user_id', 'status']);
                $table->index('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'verified_at', 'verification_status']);
        });
    }
};
