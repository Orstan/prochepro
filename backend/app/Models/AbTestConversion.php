<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbTestConversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'ab_test_id',
        'assignment_id',
        'conversion_type',
        'conversion_data',
    ];

    protected $casts = [
        'conversion_data' => 'array',
    ];

    public function abTest(): BelongsTo
    {
        return $this->belongsTo(AbTest::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(AbTestAssignment::class, 'assignment_id');
    }
}
