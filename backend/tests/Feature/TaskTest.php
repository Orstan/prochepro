<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\UserCredit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private User $prestataire;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create(['role' => 'client']);
        $this->prestataire = User::factory()->create(['role' => 'prestataire']);
        
        // Create credits for client
        UserCredit::create([
            'user_id' => $this->client->id,
            'type' => 'client',
            'balance' => 10,
        ]);
    }

    public function test_can_list_tasks(): void
    {
        Task::factory()->count(3)->create([
            'client_id' => $this->client->id,
        ]);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'description', 'status'],
                ],
            ]);
    }

    public function test_client_can_create_task(): void
    {
        $response = $this->actingAs($this->client)
            ->postJson('/api/tasks', [
                'client_id' => $this->client->id,
                'title' => 'Test Task',
                'description' => 'Test description',
                'category' => 'plomberie',
                'budget_min' => 50,
                'budget_max' => 100,
                'city' => 'Paris',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
            ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task',
            'client_id' => $this->client->id,
        ]);
    }

    public function test_can_view_single_task(): void
    {
        $task = Task::factory()->create([
            'client_id' => $this->client->id,
        ]);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
            ]);
    }

    public function test_client_can_update_own_task(): void
    {
        $task = Task::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->client)
            ->putJson("/api/tasks/{$task->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_client_can_delete_own_task(): void
    {
        $task = Task::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->client)
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    public function test_can_filter_tasks_by_client(): void
    {
        Task::factory()->count(2)->create([
            'client_id' => $this->client->id,
        ]);

        $otherClient = User::factory()->create(['role' => 'client']);
        Task::factory()->create([
            'client_id' => $otherClient->id,
        ]);

        $response = $this->getJson("/api/tasks?client_id={$this->client->id}");

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_can_filter_tasks_by_status(): void
    {
        Task::factory()->count(2)->create([
            'client_id' => $this->client->id,
            'status' => 'published',
        ]);

        Task::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'completed',
        ]);

        $response = $this->getJson('/api/tasks?status=published');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }
}
