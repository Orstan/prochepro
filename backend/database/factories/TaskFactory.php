<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $categories = ['plomberie', 'electricite', 'menage', 'jardinage', 'demenagement', 'bricolage'];
        
        return [
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'client_id' => User::factory(),
            'category' => $this->faker->randomElement($categories),
            'budget_min' => $this->faker->numberBetween(30, 100),
            'budget_max' => $this->faker->numberBetween(100, 500),
            'city' => $this->faker->city(),
            'status' => 'open',
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open',
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
