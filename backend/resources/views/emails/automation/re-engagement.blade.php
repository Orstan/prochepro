<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .task-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💡 Ça vous manque ?</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Nous avons remarqué que vous n'êtes pas venu sur ProchePro depuis un moment. Vous nous manquez ! 😊</p>
            
            <h3>🌟 Nouvelles opportunités pour vous :</h3>
            
            @foreach($suggestedTasks as $task)
                <div class="task-card">
                    <h4>{{ $task['title'] }}</h4>
                    <p>{{ Str::limit($task['description'] ?? '', 100) }}</p>
                    @if(isset($task['city']))
                        <p><small>📍 {{ $task['city'] }}</small></p>
                    @endif
                </div>
            @endforeach
            
            <center>
                <a href="https://prochepro.fr/{{ $user->isPrestataireActive() ? 'tasks/browse' : 'tasks/new' }}" class="button">
                    {{ $user->isPrestataireActive() ? 'Voir toutes les annonces' : 'Créer une annonce' }}
                </a>
            </center>
            
            <p>On espère vous revoir bientôt !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
