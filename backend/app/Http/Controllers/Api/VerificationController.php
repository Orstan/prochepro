<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Models\Notification;
use App\Mail\VerificationApprovedMail;
use App\Mail\VerificationRejectedMail;
use App\Mail\NewVerificationRequestMail;
use App\Services\WebPushService;
use App\Services\AdminActivityLogger;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class VerificationController extends Controller
{
    /**
     * Get verification status for a user
     */
    public function status(Request $request): JsonResponse
    {
        $userId = $request->query('user_id') ?? $request->input('user_id');
        
        if (!$userId) {
            return response()->json(['message' => 'user_id is required'], 400);
        }

        $user = User::find($userId);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $latestRequest = $user->latestVerificationRequest;

        return response()->json([
            'is_verified' => $user->is_verified,
            'verification_status' => $user->verification_status,
            'verified_at' => $user->verified_at,
            'latest_request' => $latestRequest ? [
                'id' => $latestRequest->id,
                'status' => $latestRequest->status,
                'document_type' => $latestRequest->document_type,
                'rejection_reason' => $latestRequest->rejection_reason,
                'created_at' => $latestRequest->created_at,
                'reviewed_at' => $latestRequest->reviewed_at,
            ] : null,
            'can_submit_offers' => $user->canSubmitOffers(),
            'needs_verification' => $user->needsVerificationForPrestataire(),
        ]);
    }

    /**
     * Submit a verification request
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'document_type' => ['required', 'string', 'in:cni,permis'],
            'document_front' => ['required', 'file', 'image', 'max:10240'], // 10MB max
            'document_back' => ['nullable', 'file', 'image', 'max:10240'],
            'selfie' => ['nullable', 'file', 'image', 'max:10240'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'document_number' => ['required', 'string', 'min:5', 'max:50'],
        ]);

        $user = User::findOrFail($request->user_id);

        // Check if user already has a pending request
        $pendingRequest = $user->verificationRequests()->where('status', 'pending')->first();
        if ($pendingRequest) {
            return response()->json([
                'message' => 'Vous avez déjà une demande de vérification en cours.',
                'request_id' => $pendingRequest->id,
            ], 400);
        }

        // Check if user is already verified
        if ($user->is_verified) {
            return response()->json([
                'message' => 'Votre compte est déjà vérifié.',
            ], 400);
        }

        // Normalize document number: remove all spaces, dashes, dots and special characters
        // Keep only alphanumeric characters and convert to uppercase
        $normalizedDocNumber = preg_replace('/[^A-Za-z0-9]/', '', $request->document_number);
        $normalizedDocNumber = strtoupper($normalizedDocNumber);
        
        // Hash the normalized document number for privacy and check if it's already used
        $documentNumberHash = hash('sha256', $normalizedDocNumber);
        
        // Check if this document number was already used (approved)
        $existingApproved = VerificationRequest::where('document_number_hash', $documentNumberHash)
            ->where('status', 'approved')
            ->first();
            
        if ($existingApproved) {
            return response()->json([
                'message' => 'Ce numéro de document a déjà été utilisé pour vérifier un autre compte. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter le support.',
            ], 400);
        }
        
        // Also check if there's already a pending request with the same document number
        $existingPending = VerificationRequest::where('document_number_hash', $documentNumberHash)
            ->where('status', 'pending')
            ->where('user_id', '!=', $user->id)
            ->first();
            
        if ($existingPending) {
            return response()->json([
                'message' => 'Ce numéro de document est déjà en cours de vérification pour un autre compte.',
            ], 400);
        }

        // Store documents
        $documentFrontPath = $request->file('document_front')->store('verifications/' . $user->id, 'private');
        
        $documentBackPath = null;
        if ($request->hasFile('document_back')) {
            $documentBackPath = $request->file('document_back')->store('verifications/' . $user->id, 'private');
        }

        $selfiePath = null;
        if ($request->hasFile('selfie')) {
            $selfiePath = $request->file('selfie')->store('verifications/' . $user->id, 'private');
        }

        // Create verification request
        $verificationRequest = VerificationRequest::create([
            'user_id' => $user->id,
            'document_type' => $request->document_type,
            'document_front_path' => $documentFrontPath,
            'document_back_path' => $documentBackPath,
            'selfie_path' => $selfiePath,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'date_of_birth' => $request->date_of_birth,
            'document_number' => $normalizedDocNumber,
            'document_number_hash' => $documentNumberHash,
            'status' => 'pending',
        ]);

        // Update user verification status
        $user->update([
            'verification_status' => 'pending',
        ]);

        // Send email notification to admin
        try {
            $adminEmail = config('app.admin_email', 'vitaliilevenets@gmail.com');
            Mail::to($adminEmail)->queue(new NewVerificationRequestMail(
                $user->name,
                $user->email,
                $request->document_type,
                $request->first_name,
                $request->last_name,
                $verificationRequest->id
            ));
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send admin notification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Votre demande de vérification a été soumise avec succès.',
            'request_id' => $verificationRequest->id,
            'status' => 'pending',
        ], 201);
    }

    /**
     * Get all pending verification requests (admin only)
     */
    public function pending(Request $request): JsonResponse
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $requests = VerificationRequest::with('user:id,name,email,avatar,role')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return response()->json($requests);
    }

    /**
     * Get all verification requests (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $query = VerificationRequest::with('user:id,name,email,avatar,role');
        
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($requests);
    }

    /**
     * Get a specific verification request (admin only)
     */
    public function show(Request $request, VerificationRequest $verificationRequest): JsonResponse
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $verificationRequest->load('user:id,name,email,avatar,role,city,phone');

        // Generate URLs for documents (using our own endpoint since local storage doesn't support temporaryUrl)
        $baseUrl = url('/api/admin/verifications/' . $verificationRequest->id . '/document');
        
        return response()->json([
            'request' => $verificationRequest,
            'document_front_url' => $verificationRequest->document_front_path 
                ? $baseUrl . '/front?admin_id=' . $request->admin_id
                : null,
            'document_back_url' => $verificationRequest->document_back_path 
                ? $baseUrl . '/back?admin_id=' . $request->admin_id
                : null,
            'selfie_url' => $verificationRequest->selfie_path 
                ? $baseUrl . '/selfie?admin_id=' . $request->admin_id
                : null,
        ]);
    }

    /**
     * Approve a verification request (admin only)
     */
    public function approve(Request $request, VerificationRequest $verificationRequest): JsonResponse
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($verificationRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Cette demande a déjà été traitée.',
            ], 400);
        }

        // Update verification request
        $verificationRequest->update([
            'status' => 'approved',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        // Update user
        $user = $verificationRequest->user;
        $user->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verification_status' => 'approved',
        ]);

        // Send notification to user
        Notification::create([
            'user_id' => $user->id,
            'type' => 'verification_approved',
            'data' => [
                'message' => 'Félicitations ! Votre identité a été vérifiée avec succès. Vous pouvez maintenant proposer vos services.',
            ],
        ]);

        // Send email notification
        if ($user->email) {
            try {
                Mail::to($user->email)->queue(new VerificationApprovedMail([
                    'user_name' => $user->name,
                ]));
            } catch (\Exception $e) {
                \Log::error('Failed to send verification approved email: ' . $e->getMessage());
            }
        }

        // Send push notification
        try {
            $webPush = app(WebPushService::class);
            $webPush->sendToUser($user->id, [
                'title' => '✓ Identité vérifiée',
                'body' => 'Félicitations ! Votre identité a été vérifiée. Vous pouvez maintenant proposer vos services.',
                'url' => '/dashboard',
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification approved push: ' . $e->getMessage());
        }

        // Log activity
        AdminActivityLogger::logVerificationApproved($verificationRequest->id, $user->id);

        // Check and award achievements (including "Verified" badge)
        try {
            $gamificationService = app(GamificationService::class);
            $gamificationService->checkAndAwardAchievements($user);
        } catch (\Exception $e) {
            \Log::error('Failed to check achievements after verification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'La demande de vérification a été approuvée.',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Reject a verification request (admin only)
     */
    public function reject(Request $request, VerificationRequest $verificationRequest): JsonResponse
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        if ($verificationRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Cette demande a déjà été traitée.',
            ], 400);
        }

        // Update verification request
        $verificationRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        // Update user
        $user = $verificationRequest->user;
        $user->update([
            'verification_status' => 'rejected',
        ]);

        // Send notification to user
        Notification::create([
            'user_id' => $user->id,
            'type' => 'verification_rejected',
            'data' => [
                'message' => 'Votre demande de vérification a été rejetée. Raison : ' . $request->reason,
                'reason' => $request->reason,
            ],
        ]);

        // Send email notification
        if ($user->email) {
            try {
                Mail::to($user->email)->queue(new VerificationRejectedMail([
                    'user_name' => $user->name,
                    'reason' => $request->reason,
                ]));
            } catch (\Exception $e) {
                \Log::error('Failed to send verification rejected email: ' . $e->getMessage());
            }
        }

        // Send push notification
        try {
            $webPush = app(WebPushService::class);
            $webPush->sendToUser($user->id, [
                'title' => 'Demande de vérification rejetée',
                'body' => 'Votre demande a été rejetée. Consultez votre email pour plus de détails.',
                'url' => '/profile/verification',
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification rejected push: ' . $e->getMessage());
        }

        // Log activity
        AdminActivityLogger::logVerificationRejected($verificationRequest->id, $user->id, $request->reason);

        return response()->json([
            'message' => 'La demande de vérification a été rejetée.',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Get document image (admin only) - returns the actual file
     */
    public function getDocument(Request $request, VerificationRequest $verificationRequest, string $type)
    {
        $request->validate([
            'admin_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $admin = User::findOrFail($request->admin_id);
        if (!$admin->is_admin) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $path = match($type) {
            'front' => $verificationRequest->document_front_path,
            'back' => $verificationRequest->document_back_path,
            'selfie' => $verificationRequest->selfie_path,
            default => null,
        };

        if (!$path || !Storage::disk('private')->exists($path)) {
            return response()->json(['message' => 'Document non trouvé.'], 404);
        }

        // Return the file directly
        $file = Storage::disk('private')->get($path);
        $mimeType = Storage::disk('private')->mimeType($path);
        
        return response($file, 200)->header('Content-Type', $mimeType);
    }
}
