<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestataire_id',
        'year',
        'month',
        'total_revenue',
        'platform_commission',
        'net_revenue',
        'missions_count',
        'online_payment_missions',
        'cash_payment_missions',
        'pdf_path',
        'generated_at',
    ];

    protected $casts = [
        'total_revenue' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'net_revenue' => 'decimal:2',
        'generated_at' => 'datetime',
    ];

    public function prestataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function isAnnual(): bool
    {
        return $this->month === null;
    }

    public function getPeriodLabel(): string
    {
        if ($this->isAnnual()) {
            return "Année {$this->year}";
        }
        
        $months = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        
        return ($months[$this->month] ?? '') . " {$this->year}";
    }
}
