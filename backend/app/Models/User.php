<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'roles',
        'active_role',
        'subscription_plan_id',
        'subscription_expires_at',
        'is_admin',
        'is_blocked',
        'email_verified_at',
        'email_verification_token',
        'referral_code',
        'referred_by',
        'city',
        'avatar',
        'bio',
        'phone',
        'website',
        'skills',
        'experience_years',
        'service_areas',
        'certifications',
        'is_verified',
        'verified_at',
        'verification_status',
        'hourly_rate',
        'company_name',
        'siret',
        'iban',
        'bic',
        'bank_name',
        'account_holder_name',
        'email_notifications',
        'push_notifications',
        'notification_preferences',
        'service_categories',
        'service_subcategories',
        'stripe_account_id',
        'stripe_account_status',
        'stripe_onboarding_completed_at',
        'provider',
        'provider_id',
        'avatar_url',
        'is_location_sharing_enabled',
        'current_latitude',
        'current_longitude',
        'location_updated_at',
        'last_login_at',
        'level',
        'xp',
        'total_tasks_completed',
        'total_reviews_received',
        'average_rating',
        'earned_badges',
        'completed_orders_count',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'iban',
        'bic',
        'bank_name',
        'account_holder_name',
        'stripe_account_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_blocked' => 'boolean',
            'is_verified' => 'boolean',
            'roles' => 'array',
            'skills' => 'array',
            'service_areas' => 'array',
            'certifications' => 'array',
            'hourly_rate' => 'decimal:2',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'notification_preferences' => 'array',
            'service_categories' => 'array',
            'service_subcategories' => 'array',
            'earned_badges' => 'array',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return in_array($role, $this->roles ?? [$this->role]);
    }

    /**
     * Add a role to user
     */
    public function addRole(string $role): void
    {
        $roles = $this->roles ?? [$this->role];
        if (!in_array($role, $roles)) {
            $roles[] = $role;
            $this->update(['roles' => $roles]);
        }
    }

    /**
     * Get current active role (fallback to role field)
     */
    public function getCurrentRole(): string
    {
        return $this->active_role ?? $this->role ?? 'client';
    }

    /**
     * Get reviews received by this user (as prestataire) - only from clients
     */
    public function reviewsAsPrestataire()
    {
        return $this->hasMany(Review::class, 'prestataire_id')
            ->where('direction', 'client_to_prestataire');
    }

    /**
     * Get reviews received by this user (as client)
     */
    public function reviewsAsClient()
    {
        return $this->hasMany(Review::class, 'client_id')->whereNotNull('rating_for_client');
    }

    /**
     * Get average rating as prestataire
     */
    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->reviewsAsPrestataire()->where('direction', 'client_to_prestataire')->avg('rating');
        return $avg ? round($avg, 1) : null;
    }

    /**
     * Get total reviews count as prestataire
     */
    public function getReviewsCountAttribute(): int
    {
        return $this->reviewsAsPrestataire()->where('direction', 'client_to_prestataire')->count();
    }

    /**
     * Get completed tasks count
     */
    public function getCompletedTasksCountAttribute(): int
    {
        try {
            if ($this->role === 'prestataire') {
                // Count tasks where this prestataire has an accepted offer
                return Task::where('status', 'completed')
                    ->whereHas('offers', function ($q) {
                        $q->where('prestataire_id', $this->id)
                          ->where('status', 'accepted');
                    })
                    ->count();
            }
            return Task::where('client_id', $this->id)
                ->where('status', 'completed')
                ->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get user credits
     */
    public function credits()
    {
        return $this->hasMany(UserCredit::class);
    }

    /**
     * Get client credits
     */
    public function clientCredits()
    {
        return $this->hasOne(UserCredit::class)->where('type', 'client');
    }

    /**
     * Get prestataire credits
     */
    public function prestataireCredits()
    {
        return $this->hasOne(UserCredit::class)->where('type', 'prestataire');
    }

    /**
     * Get credit transactions
     */
    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }

    /**
     * Get referrals made by this user
     */
    public function referralsMade()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /**
     * Get completed referrals count
     */
    public function getCompletedReferralsCountAttribute(): int
    {
        return $this->referralsMade()->where('status', 'completed')->count();
    }

    /**
     * Check if user has "Active Client" badge (3+ referrals)
     */
    public function getHasActiveClientBadgeAttribute(): bool
    {
        return $this->role === 'client' && $this->completed_referrals_count >= 3;
    }

    /**
     * Get referral (who referred this user)
     */
    public function referredBy()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Generate unique referral code
     */
    public static function generateReferralCode(): string
    {
        do {
            $code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        } while (self::where('referral_code', $code)->exists());
        
        return $code;
    }

    /**
     * Get user's achievements
     */
    public function achievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    /**
     * Get earned achievement details
     */
    public function earnedAchievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('earned_at', 'is_notified')
            ->orderByPivot('earned_at', 'desc');
    }

    /**
     * Award achievement to user
     */
    public function awardAchievement(Achievement $achievement): void
    {
        if (!$this->achievements()->where('achievement_id', $achievement->id)->exists()) {
            $this->achievements()->create([
                'achievement_id' => $achievement->id,
                'earned_at' => now(),
            ]);
            
            // Add XP
            $this->increment('xp', $achievement->xp_reward);
            
            // Check level up
            $this->checkLevelUp();
        }
    }

    /**
     * Check and update level based on XP
     */
    public function checkLevelUp(): void
    {
        $newLevel = $this->calculateLevel($this->xp);
        if ($newLevel > $this->level) {
            $this->update(['level' => $newLevel]);
        }
    }

    /**
     * Calculate level from XP
     */
    public function calculateLevel(int $xp): int
    {
        // Level formula: level = floor(xp / 100) + 1
        // Level 1: 0-99 XP
        // Level 2: 100-199 XP
        // Level 3: 200-299 XP, etc.
        return min(50, floor($xp / 100) + 1);
    }

    /**
     * Get XP needed for next level
     */
    public function getXpForNextLevelAttribute(): int
    {
        return $this->level * 100;
    }

    /**
     * Get XP progress percentage to next level
     */
    public function getXpProgressPercentageAttribute(): float
    {
        $currentLevelXp = ($this->level - 1) * 100;
        $xpInCurrentLevel = $this->xp - $currentLevelXp;
        return min(100, ($xpInCurrentLevel / 100) * 100);
    }

    /**
     * Get portfolio items
     */
    public function portfolioItems()
    {
        return $this->hasMany(PortfolioItem::class)->orderBy('sort_order')->orderByDesc('created_at');
    }

    /**
     * Get featured portfolio items
     */
    public function featuredPortfolioItems()
    {
        return $this->hasMany(PortfolioItem::class)->where('is_featured', true)->orderBy('sort_order');
    }

    /**
     * Get verification requests
     */
    public function verificationRequests()
    {
        return $this->hasMany(VerificationRequest::class)->orderByDesc('created_at');
    }

    /**
     * Get latest verification request
     */
    public function latestVerificationRequest()
    {
        return $this->hasOne(VerificationRequest::class)->latestOfMany();
    }

    /**
     * Check if user needs verification to act as prestataire
     */
    public function needsVerificationForPrestataire(): bool
    {
        // If already verified, no need
        if ($this->is_verified) {
            return false;
        }
        
        // If verification is pending, they need to wait
        if ($this->verification_status === 'pending') {
            return true;
        }
        
        // Not verified and not pending = needs to submit
        return true;
    }

    /**
     * Check if user can submit offers (as prestataire)
     */
    public function canSubmitOffers(): bool
    {
        return $this->is_verified === true;
    }

    /**
     * Get verification badge info
     */
    public function getVerificationBadgeAttribute(): ?array
    {
        if ($this->is_verified) {
            return [
                'type' => 'verified',
                'label' => 'Vérifié',
                'icon' => '✓',
                'color' => 'emerald',
            ];
        }
        
        if ($this->verification_status === 'pending') {
            return [
                'type' => 'pending',
                'label' => 'En cours de vérification',
                'icon' => '⏳',
                'color' => 'amber',
            ];
        }
        
        return null;
    }

    /**
     * Get notification settings
     */
    public function notificationSettings()
    {
        return $this->hasOne(UserNotificationSettings::class);
    }

    /**
     * Get messenger settings (Telegram, WhatsApp)
     */
    public function messengerSettings()
    {
        return $this->hasOne(MessengerSettings::class);
    }

    /**
     * Get interested categories
     */
    public function interestedCategories()
    {
        return $this->hasMany(UserInterestedCategory::class);
    }

    /**
     * Check if user has active subscription
     */
    public function hasActiveSubscription(): bool
    {
        if (!$this->subscription_plan_id) {
            return false;
        }

        if (!$this->subscription_expires_at) {
            return false;
        }

        return $this->subscription_expires_at->isFuture();
    }

    /**
     * Check if user should receive notifications for a specific category
     */
    public function shouldReceiveNotificationForCategory(string $categoryKey, ?string $subcategoryKey = null): bool
    {
        // Check if notifications are enabled
        $settings = $this->notificationSettings;
        if (!$settings || !$settings->enabled) {
            return false;
        }

        // Auto mode: check against service_categories/service_subcategories
        if ($settings->notification_mode === 'auto_skills') {
            $categories = $this->service_categories ?? [];
            $subcategories = $this->service_subcategories ?? [];

            if ($subcategoryKey) {
                return in_array($subcategoryKey, $subcategories);
            }
            return in_array($categoryKey, $categories);
        }

        // Manual mode: check against interested_categories
        if ($settings->notification_mode === 'manual_selection') {
            $interested = $this->interestedCategories()
                ->where('category_key', $categoryKey)
                ->where(function ($q) use ($subcategoryKey) {
                    if ($subcategoryKey) {
                        $q->where('subcategory_key', $subcategoryKey)
                          ->orWhereNull('subcategory_key');
                    } else {
                        $q->whereNull('subcategory_key');
                    }
                })
                ->exists();

            return $interested;
        }

        return false;
    }

    /**
     * Email automation logs
     */
    public function emailAutomationLogs()
    {
        return $this->hasMany(EmailAutomationLog::class);
    }

    /**
     * Check if user is active as prestataire
     */
    public function isPrestataireActive(): bool
    {
        return $this->hasRole('prestataire');
    }

    /**
     * Check if user is active as client
     */
    public function isClientActive(): bool
    {
        return $this->hasRole('client') || $this->role === 'client';
    }

    /**
     * Get completed tasks (for prestataire)
     */
    public function completedTasks()
    {
        return Task::where('status', 'completed')
            ->whereHas('offers', function ($q) {
                $q->where('prestataire_id', $this->id)
                  ->where('status', 'accepted');
            });
    }

    /**
     * Get tasks created by this user (for client)
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'client_id');
    }

    /**
     * Get offers sent by this user (for prestataire)
     */
    public function offers()
    {
        return $this->hasMany(Offer::class, 'prestataire_id');
    }
    
    /**
     * Get price list items for this user (as prestataire)
     */
    public function priceListItems()
    {
        return $this->hasMany(PriceListItem::class)->orderBy('sort_order')->orderBy('service_name');
    }
    
    /**
     * Get featured price list items for this user
     */
    public function featuredPriceListItems()
    {
        return $this->hasMany(PriceListItem::class)->where('is_featured', true)->orderBy('sort_order');
    }
}
