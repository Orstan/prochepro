<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; background: #f0fdf4; padding: 20px; border-radius: 8px; }
        .stat { text-align: center; }
        .stat-number { font-size: 28px; font-weight: bold; color: #10b981; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .task-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Votre résumé de la semaine</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Voici ce qui s'est passé cette semaine sur ProchePro :</p>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">{{ count($newTasks) }}</div>
                    <div class="stat-label">Nouvelles annonces</div>
                </div>
                <div class="stat">
                    <div class="stat-number">{{ $stats['offers_sent'] ?? 0 }}</div>
                    <div class="stat-label">Vos offres</div>
                </div>
                <div class="stat">
                    <div class="stat-number">{{ $stats['profile_views'] ?? 0 }}</div>
                    <div class="stat-label">Vues profil</div>
                </div>
            </div>
            
            @if(count($newTasks) > 0)
                <h3>🔥 Annonces populaires cette semaine :</h3>
                
                @foreach(array_slice($newTasks, 0, 5) as $task)
                    <div class="task-card">
                        <h4>{{ $task['title'] }}</h4>
                        <p>{{ Str::limit($task['description'] ?? '', 100) }}</p>
                        @if(isset($task['city']))
                            <p><small>📍 {{ $task['city'] }}</small></p>
                        @endif
                    </div>
                @endforeach
            @endif
            
            <center>
                <a href="https://prochepro.fr/tasks/browse" class="button">Voir toutes les annonces</a>
            </center>
            
            <p>Bonne semaine !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
            <p><a href="https://prochepro.fr/settings/notifications">Ne plus recevoir ce récapitulatif</a></p>
        </div>
    </div>
</body>
</html>
