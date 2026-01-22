<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AdminActivityLogger
{
    /**
     * Log an admin action
     */
    public static function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): ?AdminActivityLog {
        $user = Auth::user();
        
        // Only log if user is admin
        if (!$user || !$user->is_admin) {
            return null;
        }

        $request = $request ?? request();

        return AdminActivityLog::create([
            'admin_id' => $user->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Log user creation
     */
    public static function logUserCreated(int $userId, array $userData): void
    {
        self::log(
            action: 'created',
            entityType: 'User',
            entityId: $userId,
            description: "Utilisateur créé: {$userData['email']}",
            newValues: $userData
        );
    }

    /**
     * Log user update
     */
    public static function logUserUpdated(int $userId, array $oldData, array $newData): void
    {
        self::log(
            action: 'updated',
            entityType: 'User',
            entityId: $userId,
            description: "Utilisateur modifié",
            oldValues: $oldData,
            newValues: $newData
        );
    }

    /**
     * Log user deletion
     */
    public static function logUserDeleted(int $userId, string $userEmail): void
    {
        self::log(
            action: 'deleted',
            entityType: 'User',
            entityId: $userId,
            description: "Utilisateur supprimé: {$userEmail}"
        );
    }

    /**
     * Log user ban
     */
    public static function logUserBanned(int $userId, string $reason): void
    {
        self::log(
            action: 'banned',
            entityType: 'User',
            entityId: $userId,
            description: "Utilisateur banni: {$reason}"
        );
    }

    /**
     * Log user unban
     */
    public static function logUserUnbanned(int $userId): void
    {
        self::log(
            action: 'unbanned',
            entityType: 'User',
            entityId: $userId,
            description: "Utilisateur débanni"
        );
    }

    /**
     * Log verification approval
     */
    public static function logVerificationApproved(int $verificationId, int $userId): void
    {
        self::log(
            action: 'approved',
            entityType: 'Verification',
            entityId: $verificationId,
            description: "Vérification approuvée pour l'utilisateur #{$userId}"
        );
    }

    /**
     * Log verification rejection
     */
    public static function logVerificationRejected(int $verificationId, int $userId, string $reason): void
    {
        self::log(
            action: 'rejected',
            entityType: 'Verification',
            entityId: $verificationId,
            description: "Vérification rejetée pour l'utilisateur #{$userId}: {$reason}"
        );
    }

    /**
     * Log task status change
     */
    public static function logTaskStatusChanged(int $taskId, string $oldStatus, string $newStatus): void
    {
        self::log(
            action: 'status_changed',
            entityType: 'Task',
            entityId: $taskId,
            description: "Statut de la tâche changé de {$oldStatus} à {$newStatus}",
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus]
        );
    }

    /**
     * Log task deletion
     */
    public static function logTaskDeleted(int $taskId, string $taskTitle): void
    {
        self::log(
            action: 'deleted',
            entityType: 'Task',
            entityId: $taskId,
            description: "Tâche supprimée: {$taskTitle}"
        );
    }

    /**
     * Log payment update
     */
    public static function logPaymentUpdated(int $paymentId, array $oldData, array $newData): void
    {
        self::log(
            action: 'updated',
            entityType: 'Payment',
            entityId: $paymentId,
            description: "Paiement modifié",
            oldValues: $oldData,
            newValues: $newData
        );
    }

    /**
     * Log credits added
     */
    public static function logCreditsAdded(int $userId, int $amount, string $reason): void
    {
        self::log(
            action: 'created',
            entityType: 'Credits',
            entityId: $userId,
            description: "Crédits ajoutés: {$amount} pour l'utilisateur #{$userId} - {$reason}",
            newValues: ['amount' => $amount, 'reason' => $reason]
        );
    }

    /**
     * Log support ticket assignment
     */
    public static function logTicketAssigned(int $ticketId, int $assignedToId): void
    {
        self::log(
            action: 'assigned',
            entityType: 'SupportTicket',
            entityId: $ticketId,
            description: "Ticket assigné à l'admin #{$assignedToId}"
        );
    }

    /**
     * Log support ticket status change
     */
    public static function logTicketStatusChanged(int $ticketId, string $oldStatus, string $newStatus): void
    {
        self::log(
            action: 'status_changed',
            entityType: 'SupportTicket',
            entityId: $ticketId,
            description: "Statut du ticket changé de {$oldStatus} à {$newStatus}",
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus]
        );
    }

    /**
     * Log credit package creation
     */
    public static function logCreditPackageCreated(int $packageId, array $packageData): void
    {
        self::log(
            action: 'created',
            entityType: 'CreditPackage',
            entityId: $packageId,
            description: "Package de crédits créé: {$packageData['name']}",
            newValues: $packageData
        );
    }

    /**
     * Log credit package update
     */
    public static function logCreditPackageUpdated(int $packageId, array $oldData, array $newData): void
    {
        self::log(
            action: 'updated',
            entityType: 'CreditPackage',
            entityId: $packageId,
            description: "Package de crédits modifié",
            oldValues: $oldData,
            newValues: $newData
        );
    }

    /**
     * Log credit package deletion
     */
    public static function logCreditPackageDeleted(int $packageId, string $packageName): void
    {
        self::log(
            action: 'deleted',
            entityType: 'CreditPackage',
            entityId: $packageId,
            description: "Package de crédits supprimé: {$packageName}"
        );
    }

    /**
     * Log blog post creation
     */
    public static function logBlogCreated(int $blogId, string $title): void
    {
        self::log(
            action: 'created',
            entityType: 'Blog',
            entityId: $blogId,
            description: "Article de blog créé: {$title}"
        );
    }

    /**
     * Log blog post update
     */
    public static function logBlogUpdated(int $blogId, array $oldData, array $newData): void
    {
        self::log(
            action: 'updated',
            entityType: 'Blog',
            entityId: $blogId,
            description: "Article de blog modifié",
            oldValues: $oldData,
            newValues: $newData
        );
    }

    /**
     * Log blog post deletion
     */
    public static function logBlogDeleted(int $blogId, string $title): void
    {
        self::log(
            action: 'deleted',
            entityType: 'Blog',
            entityId: $blogId,
            description: "Article de blog supprimé: {$title}"
        );
    }
}
