<?php

namespace Tests\Feature;

use App\Models\Offer;
use App\Models\Task;
use App\Models\User;
use App\Models\UserCredit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OfferTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private User $prestataire;
    private Task $task;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create(['role' => 'client']);
        $this->prestataire = User::factory()->create(['role' => 'prestataire']);
        
        // Create credits for prestataire
        UserCredit::create([
            'user_id' => $this->prestataire->id,
            'type' => 'prestataire',
            'balance' => 10,
        ]);

        $this->task = Task::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'open',
        ]);
    }

    public function test_prestataire_can_create_offer(): void
    {
        $response = $this->actingAs($this->prestataire)
            ->postJson("/api/tasks/{$this->task->id}/offers", [
                'prestataire_id' => $this->prestataire->id,
                'price' => 150,
                'message' => 'I can do this job',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'price',
                'message',
                'status',
            ]);

        $this->assertDatabaseHas('offers', [
            'task_id' => $this->task->id,
            'prestataire_id' => $this->prestataire->id,
        ]);
    }

    public function test_prestataire_cannot_create_offer_without_credits(): void
    {
        // Set credits to 0 and mark free credit as used
        UserCredit::where('user_id', $this->prestataire->id)->update([
            'balance' => 0,
            'used_free_credit' => true,
        ]);

        $response = $this->actingAs($this->prestataire)
            ->postJson("/api/tasks/{$this->task->id}/offers", [
                'prestataire_id' => $this->prestataire->id,
                'price' => 150,
                'message' => 'I can do this job',
            ]);

        // API returns 402 Payment Required when no credits
        $response->assertStatus(402);
    }

    public function test_client_can_view_offers_on_own_task(): void
    {
        Offer::factory()->count(3)->create([
            'task_id' => $this->task->id,
            'prestataire_id' => $this->prestataire->id,
        ]);

        $response = $this->actingAs($this->client)
            ->getJson("/api/tasks/{$this->task->id}/offers");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json());
    }

    public function test_client_can_accept_offer(): void
    {
        $offer = Offer::factory()->create([
            'task_id' => $this->task->id,
            'prestataire_id' => $this->prestataire->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->client)
            ->postJson("/api/tasks/{$this->task->id}/offers/{$offer->id}/accept");

        $response->assertStatus(200);

        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'status' => 'accepted',
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $this->task->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_prestataire_can_withdraw_own_offer(): void
    {
        $offer = Offer::factory()->create([
            'task_id' => $this->task->id,
            'prestataire_id' => $this->prestataire->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->prestataire)
            ->postJson("/api/tasks/{$this->task->id}/offers/{$offer->id}/withdraw");

        $response->assertStatus(200);

        $this->assertDatabaseHas('offers', [
            'id' => $offer->id,
            'status' => 'withdrawn',
        ]);
    }

    public function test_cannot_create_duplicate_offer(): void
    {
        Offer::factory()->create([
            'task_id' => $this->task->id,
            'prestataire_id' => $this->prestataire->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->prestataire)
            ->postJson("/api/tasks/{$this->task->id}/offers", [
                'price' => 200,
                'message' => 'Another offer',
            ]);

        $response->assertStatus(422);
    }
}
