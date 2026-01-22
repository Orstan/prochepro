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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'current_latitude')) {
                $table->decimal('current_latitude', 10, 8)->nullable()->after('service_areas');
            }
            if (!Schema::hasColumn('users', 'current_longitude')) {
                $table->decimal('current_longitude', 11, 8)->nullable()->after('current_latitude');
            }
            if (!Schema::hasColumn('users', 'location_updated_at')) {
                $table->timestamp('location_updated_at')->nullable()->after('current_longitude');
            }
            if (!Schema::hasColumn('users', 'is_location_sharing_enabled')) {
                $table->boolean('is_location_sharing_enabled')->default(false)->after('location_updated_at');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('city');
            }
            if (!Schema::hasColumn('tasks', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
        });

        // Таблиця для збереження історії локацій майстра (для трекування)
        if (!Schema::hasTable('location_tracking')) {
            Schema::create('location_tracking', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('task_id')->nullable()->constrained()->onDelete('cascade');
                $table->decimal('latitude', 10, 8);
                $table->decimal('longitude', 11, 8);
                $table->decimal('speed', 8, 2)->nullable(); // км/год
                $table->decimal('accuracy', 8, 2)->nullable(); // метри
                $table->string('status')->default('moving'); // moving, stopped, arrived
                $table->timestamp('recorded_at');
                $table->timestamps();

                $table->index(['user_id', 'task_id', 'recorded_at']);
                $table->index(['task_id', 'recorded_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['current_latitude', 'current_longitude', 'location_updated_at', 'is_location_sharing_enabled'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('tasks', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });

        Schema::dropIfExists('location_tracking');
    }
};
