<?php

use App\Http\Controllers\Api\AbTestController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\AdminActivityLogController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdvancedAnalyticsController;
use App\Http\Controllers\Api\AiRecommendationController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ServiceCategoryController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NotificationSettingsController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\WearableController;
use App\Http\Controllers\Api\EmailAutomationController;
use App\Http\Controllers\Api\SupportChatController;
use App\Http\Controllers\Api\AdminChatController;
use App\Http\Controllers\Api\TaxReportController;
use App\Http\Controllers\Api\TelegramController;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ici vous pouvez enregistrer les routes de l'API pour votre application.
| Ces routes seront chargées par le RouteServiceProvider et seront
| automatiquement préfixées par "/api".
|
*/

// Rate limiters
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip());
});

RateLimiter::for('contact', function (Request $request) {
    return Limit::perMinute(3)->by($request->ip());
});

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->ip());
});

Route::get('/health', function () {
    return [
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
    ];
});

// Auth routes with rate limiting (10 requests per minute)
Route::prefix('auth')->middleware('throttle:auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('resend-verification', [AuthController::class, 'resendVerification']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::post('switch-role', [AuthController::class, 'switchRole']);
    Route::post('add-role', [AuthController::class, 'addRole']);
    
    // OAuth routes
    Route::post('social', [SocialAuthController::class, 'handleSocialAuth']);
    Route::get('google', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('facebook', [SocialAuthController::class, 'redirectToFacebook']);
});

// Contact form with strict rate limiting (3 requests per minute)
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');

// Service categories (public)
Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
Route::get('/service-categories/{key}', [ServiceCategoryController::class, 'show']);

// Popular services (public)
Route::get('/popular-services', [\App\Http\Controllers\Api\PopularServicesController::class, 'index']);
Route::get('/popular-services/top', [\App\Http\Controllers\Api\PopularServicesController::class, 'getTop']);
Route::get('/popular-services/{slug}', [\App\Http\Controllers\Api\PopularServicesController::class, 'show']);
Route::get('/popular-services/category/{category}', [\App\Http\Controllers\Api\PopularServicesController::class, 'getByCategory']);

// City districts (public)
Route::get('/city-districts', [\App\Http\Controllers\Api\CityDistrictsController::class, 'index']);
Route::get('/city-districts/city/{city}', [\App\Http\Controllers\Api\CityDistrictsController::class, 'getByCity']);
Route::get('/city-districts/{slug}', [\App\Http\Controllers\Api\CityDistrictsController::class, 'show']);

// Local SEO pages (public)
Route::get('/districts', [\App\Http\Controllers\Api\LocalSeoController::class, 'getAllDistricts']);
Route::get('/districts/{slug}', [\App\Http\Controllers\Api\LocalSeoController::class, 'getDistrict']);
Route::get('/local-pages', [\App\Http\Controllers\Api\LocalSeoController::class, 'getAllPages']);
Route::get('/local-pages/{slug}', [\App\Http\Controllers\Api\LocalSeoController::class, 'getPage']);
Route::get('/local-pages/district/{districtSlug}/service/{serviceCategory}', [\App\Http\Controllers\Api\LocalSeoController::class, 'getPageByDistrictAndService']);
Route::get('/local-pages/district/{districtSlug}/service/{serviceCategory}/{serviceSubcategory}', [\App\Http\Controllers\Api\LocalSeoController::class, 'getPageByDistrictAndService']);
Route::post('/local-pages/{slug}/conversion', [\App\Http\Controllers\Api\LocalSeoController::class, 'trackConversion']);

Route::post('/tasks/guest-publish', [TaskController::class, 'guestPublish']);
Route::get('/tasks/insurance-options', [TaskController::class, 'insuranceOptions']);
Route::get('/tasks/counts-by-category', [TaskController::class, 'countsByCategory']);
Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{task}', [TaskController::class, 'show']);
Route::post('/tasks', [TaskController::class, 'store'])->middleware('throttle:tasks');
Route::put('/tasks/{task}', [TaskController::class, 'update'])->middleware('throttle:tasks');
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
Route::post('/tasks/{task}/cancel', [TaskController::class, 'cancel']);
Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
Route::post('/tasks/{task}/images', [TaskController::class, 'uploadImages'])->middleware('throttle:tasks');
Route::delete('/tasks/{task}/images', [TaskController::class, 'deleteImage']);
Route::get('/tasks/{task}/contact', [TaskController::class, 'getContactInfo']);

// Task status updates and geolocation (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/tasks/{task}/on-the-way', [\App\Http\Controllers\Api\TaskStatusController::class, 'prestataireOnTheWay']);
    Route::post('/tasks/{task}/arrived', [\App\Http\Controllers\Api\TaskStatusController::class, 'prestataireArrived']);
    Route::get('/tasks/{task}/prestataire-status', [\App\Http\Controllers\Api\TaskStatusController::class, 'getStatus']);
    
    Route::post('/location/update', [\App\Http\Controllers\Api\GeolocationController::class, 'updateLocation']);
    Route::post('/location/toggle-sharing', [\App\Http\Controllers\Api\GeolocationController::class, 'toggleLocationSharing']);
    Route::get('/tasks/nearby', [\App\Http\Controllers\Api\GeolocationController::class, 'findNearbyTasks']);
    Route::post('/location/geocode', [\App\Http\Controllers\Api\GeolocationController::class, 'geocodeAddress']);
    Route::post('/route/optimize', [\App\Http\Controllers\Api\GeolocationController::class, 'optimizeRoute']);
});

// Public tracking endpoint (no auth required for client to view)
Route::get('/tasks/{task}/tracking', [\App\Http\Controllers\Api\GeolocationController::class, 'getLocationTracking']);

Route::get('/tasks/{task}/offers', [OfferController::class, 'index']);
Route::post('/tasks/{task}/offers', [OfferController::class, 'store'])->middleware('throttle:offers');
Route::post('/tasks/{task}/offers/{offer}/accept', [OfferController::class, 'accept']);
Route::post('/tasks/{task}/offers/{offer}/withdraw', [OfferController::class, 'withdraw']);

Route::get('/offers', [OfferController::class, 'indexByPrestataire']);

// Direct requests routes
Route::post('/direct-requests', [\App\Http\Controllers\Api\DirectRequestController::class, 'store']);
Route::get('/direct-requests/prestataire', [\App\Http\Controllers\Api\DirectRequestController::class, 'getForPrestataire'])->middleware('auth:sanctum');
Route::get('/direct-requests/client', [\App\Http\Controllers\Api\DirectRequestController::class, 'getForClient'])->middleware('auth:sanctum');
Route::get('/direct-requests/{id}', [\App\Http\Controllers\Api\DirectRequestController::class, 'show'])->middleware('auth:sanctum');
Route::post('/direct-requests/{id}/respond', [\App\Http\Controllers\Api\DirectRequestController::class, 'respond'])->middleware('auth:sanctum');
Route::delete('/direct-requests/{id}', [\App\Http\Controllers\Api\DirectRequestController::class, 'destroy'])->middleware('auth:sanctum');

Route::get('/tasks/{task}/messages', [MessageController::class, 'index'])->middleware('cors.messages');
Route::post('/tasks/{task}/messages', [MessageController::class, 'store'])->middleware(['cors.messages', 'throttle:messages']);
Route::post('/tasks/{task}/typing', [MessageController::class, 'typing'])->middleware('cors.messages');
Route::post('/tasks/{task}/messages/{message}/read', [MessageController::class, 'markAsRead'])->middleware('cors.messages');
Route::get('/messages/unread-count', [MessageController::class, 'getUnreadCount']);

Route::get('/tasks/{task}/reviews', [ReviewController::class, 'showForTask']);
Route::post('/tasks/{task}/reviews', [ReviewController::class, 'store'])->middleware('throttle:reviews');
Route::post('/tasks/{task}/reviews/from-prestataire', [ReviewController::class, 'storeFromPrestataire'])->middleware('throttle:reviews');
Route::post('/reviews/{review}/respond', [ReviewController::class, 'respondToReview'])->middleware('throttle:reviews');
Route::get('/prestataires/{prestataire}/reviews', [ReviewController::class, 'indexForPrestataire']);
Route::get('/clients/{client}/reviews', [ReviewController::class, 'indexForClient']);
Route::post('/reviews/upload-photo', [\App\Http\Controllers\Api\ReviewPhotoController::class, 'upload'])->middleware('throttle:reviews');
Route::delete('/reviews/delete-photo', [\App\Http\Controllers\Api\ReviewPhotoController::class, 'delete'])->middleware('throttle:reviews');

Route::get('/tasks/{task}/payment', [PaymentController::class, 'showForTask']);
Route::post('/tasks/{task}/pay', [PaymentController::class, 'payForTask']);
Route::post('/tasks/{task}/checkout', [PaymentController::class, 'createCheckoutSession']);
Route::post('/tasks/{task}/checkout-cash', [PaymentController::class, 'createCashCheckoutSession']);
Route::post('/tasks/{task}/confirm-payment', [PaymentController::class, 'confirmPayment']);
Route::post('/tasks/{task}/release-payment', [PaymentController::class, 'releasePayment']);
Route::post('/tasks/{task}/confirm-cash-received', [PaymentController::class, 'confirmCashReceived']);
Route::post('/tasks/{task}/confirm-cash-completion', [PaymentController::class, 'confirmCashTaskCompletion']);
Route::get('/prestataires/{prestataire}/payout-status', [PaymentController::class, 'checkPrestatairePayoutStatus']);
Route::post('/stripe/webhook', [PaymentController::class, 'handleWebhook']);

// Stripe Connect webhook (no auth required)
Route::post('/stripe/connect/webhook', [StripeConnectController::class, 'handleWebhook']);

// Stripe Connect (for prestataires to receive payments - requires auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stripe/connect/create-account', [StripeConnectController::class, 'createConnectAccount']);
    Route::get('/stripe/connect/status', [StripeConnectController::class, 'getAccountStatus']);
    Route::post('/stripe/connect/onboarding-link', [StripeConnectController::class, 'createOnboardingLink']);
    Route::get('/stripe/connect/dashboard-link', [StripeConnectController::class, 'getDashboardLink']);
});

Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/clear', [NotificationController::class, 'clearForUser']);
Route::post('/notifications/bulk-read', [NotificationController::class, 'bulkMarkAsRead']);
Route::post('/notifications/bulk-delete', [NotificationController::class, 'bulkDelete']);

// Notification settings
Route::get('/notifications/settings', [NotificationController::class, 'getSettings']);
Route::post('/notifications/settings', [NotificationController::class, 'updateSettings']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
Route::get('/notifications', [NotificationController::class, 'index']);

// Messenger settings and notifications
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messenger/settings', [\App\Http\Controllers\Api\MessengerController::class, 'getSettings']);
    Route::post('/messenger/settings', [\App\Http\Controllers\Api\MessengerController::class, 'updateSettings']);
    Route::post('/messenger/whatsapp/verify/start', [\App\Http\Controllers\Api\MessengerController::class, 'startWhatsAppVerification']);
    Route::post('/messenger/whatsapp/verify/complete', [\App\Http\Controllers\Api\MessengerController::class, 'verifyWhatsApp']);
    Route::post('/messenger/telegram/connect', [\App\Http\Controllers\Api\MessengerController::class, 'connectTelegram']);
    Route::post('/messenger/telegram/connect-direct', [\App\Http\Controllers\Api\MessengerController::class, 'connectTelegramDirect']);
    Route::post('/messenger/test', [\App\Http\Controllers\Api\MessengerController::class, 'testNotification']);
});

// Telegram Webhook (no auth - Telegram API will call this)
Route::post('/telegram/webhook', [TelegramController::class, 'webhook']);

// Push notifications
Route::get('/push/vapid-key', [\App\Http\Controllers\Api\PushController::class, 'getVapidKey']);
Route::post('/push/subscribe', [\App\Http\Controllers\Api\PushController::class, 'subscribe']);
Route::post('/push/unsubscribe', [\App\Http\Controllers\Api\PushController::class, 'unsubscribe']);
Route::get('/push/subscriptions', [\App\Http\Controllers\Api\PushController::class, 'getSubscriptions']);
Route::post('/push/test', [\App\Http\Controllers\Api\PushController::class, 'testPush']);

Route::get('/users/{user}', [AuthController::class, 'show']);
Route::put('/users/{user}', [AuthController::class, 'update']);
Route::post('/users/{user}/avatar', [AuthController::class, 'uploadAvatar']);
Route::put('/users/{user}/notification-settings', [AuthController::class, 'updateNotificationSettings']);
Route::get('/users/{user}/subscription', [UserController::class, 'getSubscription']);

// Public prestataire routes
Route::get('/prestataires', [PortfolioController::class, 'getAllPrestataires']);
Route::get('/prestataires/top', [PortfolioController::class, 'getTopPrestataires']);
Route::get('/prestataires/{id}/profile', [PortfolioController::class, 'getPublicProfile']);
Route::get('/prestataires/{id}/stats', [\App\Http\Controllers\Api\PrestataireController::class, 'getStats']);
Route::get('/prestataires/{id}/price-list', [\App\Http\Controllers\PriceListController::class, 'getForPrestataire']);

// Authenticated portfolio routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/prestataire/commission-info', [\App\Http\Controllers\Api\PrestataireController::class, 'getCommissionInfo']);
    Route::put('/profile/prestataire', [PortfolioController::class, 'updateProfile']);
    Route::get('/profile/bank-details', [PortfolioController::class, 'getBankDetails']);
    Route::get('/portfolio', [PortfolioController::class, 'getPortfolio']);
    Route::post('/portfolio', [PortfolioController::class, 'addPortfolioItem']);
    Route::put('/portfolio/{id}', [PortfolioController::class, 'updatePortfolioItem']);
    Route::delete('/portfolio/{id}', [PortfolioController::class, 'deletePortfolioItem']);
    Route::post('/portfolio/upload-image', [PortfolioController::class, 'uploadImage']);
    Route::post('/portfolio/reorder', [PortfolioController::class, 'reorderPortfolio']);
    
    // Price list management
    Route::get('/price-list', [\App\Http\Controllers\PriceListController::class, 'getMyPriceList']);
    Route::post('/price-list', [\App\Http\Controllers\PriceListController::class, 'store']);
    Route::put('/price-list/{id}', [\App\Http\Controllers\PriceListController::class, 'update']);
    Route::delete('/price-list/{id}', [\App\Http\Controllers\PriceListController::class, 'destroy']);
    Route::post('/price-list/sort', [\App\Http\Controllers\PriceListController::class, 'updateSortOrder']);
});

// Credits & Packages
Route::get('/credits/packages', [CreditController::class, 'packages']);
Route::get('/credits/balance', [CreditController::class, 'balance']);
Route::get('/credits/can-create-task', [CreditController::class, 'canCreateTask']);
Route::get('/credits/can-send-offer', [CreditController::class, 'canSendOffer']);
Route::post('/credits/purchase', [CreditController::class, 'purchase']);
Route::post('/credits/checkout', [CreditController::class, 'createCheckoutSession']);
Route::get('/credits/transactions', [CreditController::class, 'transactions']);
Route::get('/credits/referral', [CreditController::class, 'referralInfo']);

// Blog routes (public)
Route::get('/blog/posts', [BlogController::class, 'index']);
Route::get('/blog/posts/{slug}', [BlogController::class, 'show']);
Route::get('/blog/categories', [BlogController::class, 'categories']);
Route::get('/blog/category/{slug}', [BlogController::class, 'byCategory']);

// Verification routes
Route::get('/verification/status', [VerificationController::class, 'status']);
Route::post('/verification/submit', [VerificationController::class, 'submit']);

// Document viewing route (outside middleware because img src can't send auth headers)
// Security is handled by admin_id check in controller
Route::get('/admin/verifications/{verificationRequest}/document/{type}', [VerificationController::class, 'getDocument']);

// Admin routes (protected by auth:sanctum and admin middleware)
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function (): void {
    // Verification management
    Route::get('/verifications', [VerificationController::class, 'index']);
    Route::get('/verifications/pending', [VerificationController::class, 'pending']);
    Route::get('/verifications/{verificationRequest}', [VerificationController::class, 'show']);
    Route::post('/verifications/{verificationRequest}/approve', [VerificationController::class, 'approve']);
    Route::post('/verifications/{verificationRequest}/reject', [VerificationController::class, 'reject']);
    Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'users']);
    Route::get('/payments', [\App\Http\Controllers\Api\AdminController::class, 'payments']);
    Route::get('/stats', [\App\Http\Controllers\Api\AdminController::class, 'stats']);
    Route::post('/users/{user}/toggle-status', [\App\Http\Controllers\Api\AdminController::class, 'toggleUserStatus']);
    Route::delete('/users/{user}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
    
    // Bulk user operations
    Route::post('/users/bulk-delete', [\App\Http\Controllers\Api\AdminController::class, 'bulkDeleteUsers']);
    Route::post('/users/bulk-block', [\App\Http\Controllers\Api\AdminController::class, 'bulkBlockUsers']);
    
    // User credits management
    Route::get('/users/{user}/credits', [\App\Http\Controllers\Api\AdminController::class, 'getUserCredits']);
    Route::post('/users/{user}/credits', [\App\Http\Controllers\Api\AdminController::class, 'addCreditsToUser']);
    
    // Tasks management
    Route::get('/tasks', [\App\Http\Controllers\Api\AdminController::class, 'tasks']);
    Route::delete('/tasks/{task}', [\App\Http\Controllers\Api\AdminController::class, 'deleteTask']);
    Route::post('/tasks/bulk-delete', [\App\Http\Controllers\Api\AdminController::class, 'bulkDeleteTasks']);
    
    // Credit packages management
    Route::get('/credit-packages', [\App\Http\Controllers\Api\AdminController::class, 'creditPackages']);
    Route::post('/credit-packages', [\App\Http\Controllers\Api\AdminController::class, 'createCreditPackage']);
    Route::put('/credit-packages/{package}', [\App\Http\Controllers\Api\AdminController::class, 'updateCreditPackage']);
    Route::delete('/credit-packages/{package}', [\App\Http\Controllers\Api\AdminController::class, 'deleteCreditPackage']);
    
    // Blog management
    Route::get('/blog/posts', [BlogController::class, 'adminIndex']);
    Route::get('/blog/posts/{id}', [BlogController::class, 'adminShow']);
    Route::post('/blog/posts', [BlogController::class, 'store']);
    Route::put('/blog/posts/{id}', [BlogController::class, 'update']);
    Route::delete('/blog/posts/{id}', [BlogController::class, 'destroy']);
    Route::post('/blog/posts/{id}/toggle-publish', [BlogController::class, 'togglePublish']);
    
    // Blog categories management
    Route::get('/blog/categories', [BlogController::class, 'adminCategories']);
    Route::post('/blog/categories', [BlogController::class, 'storeCategory']);
    Route::put('/blog/categories/{id}', [BlogController::class, 'updateCategory']);
    Route::delete('/blog/categories/{id}', [BlogController::class, 'destroyCategory']);
    
    // Local SEO pages management
    Route::get('/local-pages/statistics', [\App\Http\Controllers\Api\LocalSeoController::class, 'getStatistics']);
    Route::post('/local-pages', [\App\Http\Controllers\Api\LocalSeoController::class, 'store']);
    Route::put('/local-pages/{id}', [\App\Http\Controllers\Api\LocalSeoController::class, 'update']);
    Route::delete('/local-pages/{id}', [\App\Http\Controllers\Api\LocalSeoController::class, 'destroy']);
});

// Gamification routes (achievements, badges, levels)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/gamification/stats', [AchievementController::class, 'getStats']);
    Route::get('/gamification/achievements', [AchievementController::class, 'getAchievements']);
    Route::post('/gamification/achievements/mark-notified', [AchievementController::class, 'markAsNotified']);
    Route::post('/gamification/check-achievements', [AchievementController::class, 'checkAchievements']);
});

// Analytics routes
Route::post('/analytics/track-event', [AnalyticsController::class, 'trackEvent']);
Route::post('/analytics/track-profile-view/{profileUserId}', [AnalyticsController::class, 'trackProfileView']);
Route::get('/analytics/business', [AnalyticsController::class, 'getBusinessAnalytics'])->middleware('auth:sanctum');
Route::get('/analytics/demand-forecast', [AnalyticsController::class, 'getDemandForecast']);
Route::get('/analytics/campaigns', [AnalyticsController::class, 'getCampaignAnalytics'])->middleware('auth:sanctum');
Route::get('/analytics/live-stats', [AnalyticsController::class, 'liveStats'])->middleware('auth:sanctum');
Route::get('/analytics/debug-prestataire', [AnalyticsController::class, 'debugPrestataireData'])->middleware('auth:sanctum');

// Provider Insights routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/insights/provider', [\App\Http\Controllers\Api\InsightsController::class, 'getProviderInsights']);
});

// A/B Testing routes
Route::get('/ab-test/{testKey}/variant', [AbTestController::class, 'getVariant']);
Route::post('/ab-test/{testKey}/conversion', [AbTestController::class, 'trackConversion']);

// Admin A/B Testing routes
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function (): void {
    Route::get('/ab-tests', [AbTestController::class, 'getAllTests']);
    Route::post('/ab-tests', [AbTestController::class, 'createTest']);
    Route::get('/ab-tests/{testId}/results', [AbTestController::class, 'getTestResults']);
    Route::post('/ab-tests/{testId}/end', [AbTestController::class, 'endTest']);
});

// AI Recommendations and Price Estimation routes
Route::get('/tasks/{task}/recommended-prestataires', [AiRecommendationController::class, 'getRecommendedPrestataires']);
Route::get('/tasks/{task}/price-estimation', [AiRecommendationController::class, 'estimatePrice']);
Route::get('/tasks/{task}/price-breakdown', [AiRecommendationController::class, 'getPriceBreakdown']);
Route::post('/tasks/{task}/validate-offer-price', [AiRecommendationController::class, 'validateOfferPrice']);
Route::post('/ai/estimate-price', [AiRecommendationController::class, 'estimatePriceByParams']);
Route::post('/ai/find-prestataires', [AiRecommendationController::class, 'findPrestatairesByParams']);

// Wearable (Apple Watch / Android Wear) routes
Route::middleware('auth:sanctum')->prefix('wearable')->group(function () {
    Route::get('/dashboard', [WearableController::class, 'getDashboard']);
    Route::get('/tasks', [WearableController::class, 'getActiveTasks']);
    Route::get('/tasks/{task}', [WearableController::class, 'getTaskDetails']);
    Route::get('/notifications', [WearableController::class, 'getNotifications']);
    Route::post('/notifications/{notification}/read', [WearableController::class, 'markNotificationRead']);
    Route::post('/location', [WearableController::class, 'updateLocation']);
    Route::post('/tasks/{task}/on-the-way', [WearableController::class, 'markOnTheWay']);
    Route::post('/tasks/{task}/arrived', [WearableController::class, 'markArrived']);
    Route::post('/tasks/{task}/completed', [WearableController::class, 'markCompleted']);
});

// Support Tickets routes
Route::middleware('auth:sanctum')->prefix('support')->group(function () {
    Route::get('/tickets', [SupportTicketController::class, 'index']);
    Route::post('/tickets', [SupportTicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [SupportTicketController::class, 'show']);
    Route::post('/tickets/{ticket}/messages', [SupportTicketController::class, 'addMessage']);
    Route::put('/tickets/{ticket}', [SupportTicketController::class, 'update']);
    Route::delete('/tickets/{ticket}', [SupportTicketController::class, 'destroy']);
    Route::get('/stats', [SupportTicketController::class, 'stats']);
});

// Admin Activity Logs routes (admin only)
Route::middleware('auth:sanctum')->prefix('admin/activity-logs')->group(function () {
    Route::get('/', [AdminActivityLogController::class, 'index']);
    Route::get('/stats', [AdminActivityLogController::class, 'stats']);
    Route::get('/filters', [AdminActivityLogController::class, 'filters']);
    Route::get('/export', [AdminActivityLogController::class, 'export']);
    Route::get('/entity', [AdminActivityLogController::class, 'getEntityLogs']);
    Route::get('/{log}', [AdminActivityLogController::class, 'show']);
});

// Moderation routes (admin only)
Route::middleware('auth:sanctum')->prefix('admin/moderation')->group(function () {
    Route::get('/', [ModerationController::class, 'index']);
    Route::get('/stats', [ModerationController::class, 'stats']);
    Route::post('/flag', [ModerationController::class, 'flag']);
    Route::post('/approve', [ModerationController::class, 'approve']);
    Route::post('/reject', [ModerationController::class, 'reject']);
});

// Promo Codes routes
Route::middleware('auth:sanctum')->prefix('promo-codes')->group(function () {
    Route::post('/validate', [PromoCodeController::class, 'validate']);
    Route::post('/apply', [PromoCodeController::class, 'apply']);
});

// Admin Promo Codes routes
Route::middleware('auth:sanctum')->prefix('admin/promo-codes')->group(function () {
    Route::get('/', [PromoCodeController::class, 'index']);
    Route::post('/', [PromoCodeController::class, 'store']);
    Route::put('/{promoCode}', [PromoCodeController::class, 'update']);
    Route::delete('/{promoCode}', [PromoCodeController::class, 'destroy']);
    Route::get('/stats', [PromoCodeController::class, 'stats']);
    Route::post('/generate', [PromoCodeController::class, 'generate']);
});

// Advanced Analytics routes (admin only)
Route::middleware('auth:sanctum')->prefix('admin/analytics')->group(function () {
    Route::get('/dashboard', [AdvancedAnalyticsController::class, 'dashboard']);
    Route::get('/revenue', [AdvancedAnalyticsController::class, 'revenue']);
    Route::get('/user-growth', [AdvancedAnalyticsController::class, 'userGrowth']);
    Route::get('/tasks', [AdvancedAnalyticsController::class, 'tasks']);
    Route::get('/engagement', [AdvancedAnalyticsController::class, 'engagement']);
    Route::get('/credits', [AdvancedAnalyticsController::class, 'credits']);
    Route::get('/support', [AdvancedAnalyticsController::class, 'support']);
    Route::get('/export', [AdvancedAnalyticsController::class, 'export']);
});

// Campaigns routes (admin only)
Route::middleware('auth:sanctum')->prefix('admin/campaigns')->group(function () {
    Route::get('/', [CampaignController::class, 'index']);
    Route::post('/', [CampaignController::class, 'store']);
    Route::put('/{campaign}', [CampaignController::class, 'update']);
    Route::delete('/{campaign}', [CampaignController::class, 'destroy']);
    Route::post('/{campaign}/send', [CampaignController::class, 'send']);
    Route::get('/stats', [CampaignController::class, 'stats']);
});

// Promotion packages (public)
Route::get('/promotions/packages', [\App\Http\Controllers\Api\PromotionController::class, 'packages']);

// Video testimonials (public - only approved)
Route::get('/testimonials', [\App\Http\Controllers\Api\VideoTestimonialController::class, 'index']);
Route::get('/testimonials/{testimonial}', [\App\Http\Controllers\Api\VideoTestimonialController::class, 'show']);

// User testimonial submission (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/my-testimonials', [\App\Http\Controllers\Api\UserTestimonialController::class, 'store']);
    Route::get('/my-testimonials', [\App\Http\Controllers\Api\UserTestimonialController::class, 'myTestimonials']);
    Route::delete('/my-testimonials/{testimonial}', [\App\Http\Controllers\Api\UserTestimonialController::class, 'destroy']);
});

// Promotion purchases (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/promotions/my-purchases', [\App\Http\Controllers\Api\PromotionController::class, 'myPurchases']);
    Route::post('/promotions/checkout', [\App\Http\Controllers\Api\PromotionController::class, 'createCheckout']);
});

// Promotion Stripe webhook (no auth)
Route::post('/promotions/webhook', [\App\Http\Controllers\Api\PromotionController::class, 'stripeWebhook']);

// Admin promotion management
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function (): void {
    // Promotion packages CRUD
    Route::get('/promotion-packages', [\App\Http\Controllers\Api\Admin\PromotionPackageController::class, 'index']);
    Route::post('/promotion-packages', [\App\Http\Controllers\Api\Admin\PromotionPackageController::class, 'store']);
    Route::get('/promotion-packages/{package}', [\App\Http\Controllers\Api\Admin\PromotionPackageController::class, 'show']);
    Route::put('/promotion-packages/{package}', [\App\Http\Controllers\Api\Admin\PromotionPackageController::class, 'update']);
    Route::delete('/promotion-packages/{package}', [\App\Http\Controllers\Api\Admin\PromotionPackageController::class, 'destroy']);
    
    // Grant free promotions and view purchases
    Route::post('/promotions/grant-free', [\App\Http\Controllers\Api\Admin\PromotionGrantController::class, 'grantFreePromotion']);
    Route::get('/promotions/purchases', [\App\Http\Controllers\Api\Admin\PromotionGrantController::class, 'index']);
    Route::post('/promotions/purchases/{purchase}/cancel', [\App\Http\Controllers\Api\Admin\PromotionGrantController::class, 'cancel']);
    
    // Video testimonials management
    Route::get('/video-testimonials', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'index']);
    Route::post('/video-testimonials', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'store']);
    Route::put('/video-testimonials/{testimonial}', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'update']);
    Route::delete('/video-testimonials/{testimonial}', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'destroy']);
    Route::post('/video-testimonials/{testimonial}/toggle', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'toggleActive']);
    Route::post('/video-testimonials/{testimonial}/approve', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'approve']);
    Route::post('/video-testimonials/{testimonial}/reject', [\App\Http\Controllers\Api\Admin\VideoTestimonialController::class, 'reject']);
    
    // Promotional push notifications
    Route::post('/push/promotions/send', [\App\Http\Controllers\Api\PromotionPushController::class, 'send']);
    Route::post('/push/promotions/test', [\App\Http\Controllers\Api\PromotionPushController::class, 'sendTest']);
});

// Forum routes (public read, auth write)
Route::get('/forum/categories', [ForumController::class, 'getCategories']);
Route::get('/forum/categories/{slug}/topics', [ForumController::class, 'getCategoryTopics']);
Route::get('/forum/topics/{slug}', [ForumController::class, 'getTopic']);

// Protected forum routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/forum/topics', [ForumController::class, 'createTopic']);
    Route::post('/forum/topics/{topicId}/posts', [ForumController::class, 'createPost']);
    Route::post('/forum/posts/{postId}/like', [ForumController::class, 'toggleLike']);
    Route::post('/forum/topics/{topicId}/posts/{postId}/solution', [ForumController::class, 'markAsSolution']);
    Route::delete('/forum/posts/{postId}', [ForumController::class, 'deletePost']);
    Route::delete('/forum/topics/{topicId}', [ForumController::class, 'deleteTopic']);
});

// Notification Settings routes (for prestataires with subscription)
Route::middleware('auth:sanctum')->prefix('notification-settings')->group(function () {
    Route::get('/', [NotificationSettingsController::class, 'show']);
    Route::put('/', [NotificationSettingsController::class, 'update']);
    Route::post('/categories', [NotificationSettingsController::class, 'addCategory']);
    Route::delete('/categories', [NotificationSettingsController::class, 'removeCategory']);
    Route::post('/test', [NotificationSettingsController::class, 'test']);
});

// Email Automation routes (Admin only)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/email-automation')->group(function () {
    Route::get('/stats', [EmailAutomationController::class, 'stats']);
    Route::get('/logs', [EmailAutomationController::class, 'index']);
    Route::get('/logs/{log}', [EmailAutomationController::class, 'show']);
    Route::delete('/logs/{log}', [EmailAutomationController::class, 'destroy']);
    Route::post('/logs/{log}/send', [EmailAutomationController::class, 'forceSend']);
    Route::get('/campaigns', [EmailAutomationController::class, 'campaigns']);
    Route::post('/schedule-welcome/{user_id}', [EmailAutomationController::class, 'scheduleWelcomeSeries']);
    Route::post('/schedule-reengagement/{user_id}', [EmailAutomationController::class, 'scheduleReEngagement']);
});

// Live Chat routes (authenticated users)
Route::middleware('auth:sanctum')->prefix('chat')->group(function () {
    Route::get('/room', [SupportChatController::class, 'getOrCreateRoom']);
    Route::get('/rooms', [SupportChatController::class, 'getRooms']);
    Route::get('/room/{room}/messages', [SupportChatController::class, 'getMessages']);
    Route::post('/room/{room}/messages', [SupportChatController::class, 'sendMessage']);
    Route::post('/room/{room}/read', [SupportChatController::class, 'markAsRead']);
    Route::post('/room/{room}/typing', [SupportChatController::class, 'typing']);
    Route::post('/room/{room}/close', [SupportChatController::class, 'closeRoom']);
    Route::post('/room/{room}/reopen', [SupportChatController::class, 'reopenRoom']);
});

// Admin Chat Management routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/chat')->group(function () {
    Route::get('/rooms', [AdminChatController::class, 'index']);
    Route::get('/rooms/{room}', [AdminChatController::class, 'show']);
    Route::post('/rooms/{room}/assign', [AdminChatController::class, 'assign']);
    Route::post('/rooms/{room}/status', [AdminChatController::class, 'updateStatus']);
    Route::post('/rooms/{room}/resolve', [AdminChatController::class, 'resolve']);
    Route::post('/rooms/{room}/close', [AdminChatController::class, 'close']);
    Route::post('/rooms/{room}/reopen', [AdminChatController::class, 'reopen']);
    Route::post('/rooms/{room}/priority', [AdminChatController::class, 'updatePriority']);
    Route::post('/rooms/{room}/category', [AdminChatController::class, 'updateCategory']);
    Route::get('/stats', [AdminChatController::class, 'stats']);
});

// Tax Reports routes (for prestataires - URSSAF compliance)
Route::middleware('auth:sanctum')->prefix('tax-reports')->group(function () {
    Route::get('/summary', [TaxReportController::class, 'getCurrentYearSummary']);
    Route::get('/years', [TaxReportController::class, 'getAvailableYears']);
    Route::get('/history', [TaxReportController::class, 'getHistory']);
    Route::post('/generate/annual', [TaxReportController::class, 'generateAnnual']);
    Route::post('/generate/monthly', [TaxReportController::class, 'generateMonthly']);
    Route::get('/{report}/download', [TaxReportController::class, 'downloadPdf']);
    Route::get('/export/csv', [TaxReportController::class, 'exportCsv']);
});
