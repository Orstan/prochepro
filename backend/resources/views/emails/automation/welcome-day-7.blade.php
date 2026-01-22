<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat { text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #0ea5e9; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⭐ Vos premiers pas sur ProchePro</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Vous êtes avec nous depuis 7 jours ! Voici un récapitulatif de votre activité :</p>
            
            <div class="stats">
                @if($user->isClientActive())
                    <div class="stat">
                        <div class="stat-number">{{ $stats['tasks_created'] ?? 0 }}</div>
                        <div class="stat-label">Annonces créées</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">{{ $stats['offers_received'] ?? 0 }}</div>
                        <div class="stat-label">Offres reçues</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">{{ $stats['tasks_completed'] ?? 0 }}</div>
                        <div class="stat-label">Terminées</div>
                    </div>
                @else
                    <div class="stat">
                        <div class="stat-number">{{ $stats['offers_sent'] ?? 0 }}</div>
                        <div class="stat-label">Offres envoyées</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">{{ $stats['tasks_completed'] ?? 0 }}</div>
                        <div class="stat-label">Missions réussies</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">{{ number_format($stats['average_rating'] ?? 0, 1) }}</div>
                        <div class="stat-label">Note moyenne</div>
                    </div>
                @endif
            </div>
            
            @if(($stats['tasks_created'] ?? 0) === 0 && $user->isClientActive())
                <p><strong>💡 Astuce :</strong> Vous n'avez pas encore publié d'annonce. C'est gratuit et prend 2 minutes !</p>
            @elseif(($stats['offers_sent'] ?? 0) === 0 && $user->isPrestataireActive())
                <p><strong>💡 Astuce :</strong> Commencez à envoyer des offres pour développer votre activité !</p>
            @endif
            
            <center>
                <a href="https://prochepro.fr/dashboard" class="button">Voir mon tableau de bord</a>
            </center>
            
            <p>Continuez comme ça !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
