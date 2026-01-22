<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'action',
        'entity_type',
        'entity_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function scopeByAdmin($query, int $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByEntity($query, string $entityType, ?int $entityId = null)
    {
        $query->where('entity_type', $entityType);
        
        if ($entityId !== null) {
            $query->where('entity_id', $entityId);
        }
        
        return $query;
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'created' => 'Créé',
            'updated' => 'Modifié',
            'deleted' => 'Supprimé',
            'approved' => 'Approuvé',
            'rejected' => 'Rejeté',
            'verified' => 'Vérifié',
            'banned' => 'Banni',
            'unbanned' => 'Débanni',
            'status_changed' => 'Statut changé',
            'assigned' => 'Assigné',
            'unassigned' => 'Désassigné',
            default => ucfirst($this->action),
        };
    }

    public function getEntityLabelAttribute(): string
    {
        return match ($this->entity_type) {
            'User' => 'Utilisateur',
            'Task' => 'Tâche',
            'Payment' => 'Paiement',
            'SupportTicket' => 'Ticket de support',
            'CreditPackage' => 'Package de crédits',
            'Verification' => 'Vérification',
            'Review' => 'Avis',
            'Blog' => 'Article de blog',
            default => $this->entity_type,
        };
    }
}
