<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DirectRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_id',
        'prestataire_id',
        'title',
        'description',
        'category',
        'subcategory',
        'budget_min',
        'budget_max',
        'city',
        'district_code',
        'district_name',
        'address',
        'latitude',
        'longitude',
        'preferred_date',
        'preferred_time',
        'images',
        'status',
        'viewed_at',
        'responded_at',
        'response_message',
        'response_price',
        'client_phone',
        'client_email',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'budget_min' => 'float',
        'budget_max' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'images' => 'array',
        'preferred_date' => 'date',
        'viewed_at' => 'datetime',
        'responded_at' => 'datetime',
        'response_price' => 'float',
    ];

    /**
     * Get the client that owns the direct request.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the prestataire that owns the direct request.
     */
    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    /**
     * Convert to a task if accepted.
     */
    public function convertToTask()
    {
        // Only convert if status is 'accepted'
        if ($this->status !== 'accepted') {
            return null;
        }

        // Create a new task
        $task = Task::create([
            'client_id' => $this->client_id,
            'title' => $this->title,
            'description' => $this->description,
            'images' => $this->images,
            'budget_min' => $this->response_price,
            'budget_max' => $this->response_price,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'city' => $this->city,
            'district_code' => $this->district_code,
            'district_name' => $this->district_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => 'open',
        ]);

        // Create an offer from the prestataire
        if ($task) {
            $offer = Offer::create([
                'task_id' => $task->id,
                'prestataire_id' => $this->prestataire_id,
                'price' => $this->response_price,
                'message' => $this->response_message,
                'status' => 'pending',
            ]);

            return [
                'task' => $task,
                'offer' => $offer,
            ];
        }

        return null;
    }
}
