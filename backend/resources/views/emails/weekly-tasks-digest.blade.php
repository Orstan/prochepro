<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelles missions - ProchePro</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 8px 0 0 0; opacity: 0.95; font-size: 14px; }
        .content { padding: 24px; }
        .greeting { font-size: 16px; color: #1e293b; margin-bottom: 16px; }
        .intro { font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
        .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; transition: transform 0.2s; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .task-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 8px 0; }
        .task-meta { font-size: 13px; color: #64748b; margin-bottom: 8px; }
        .task-meta span { display: inline-block; margin-right: 12px; }
        .task-budget { display: inline-block; background: #dbeafe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 8px; }
        .cta-button { display: inline-block; background: #0ea5e9; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
        .cta-button:hover { background: #0284c7; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer a { color: #0ea5e9; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nouvelles missions près de chez vous !</h1>
            <p>{{ $taskCount }} mission(s) à {{ $location }}</p>
        </div>

        <div class="content">
            <p class="greeting">Bonjour {{ $userName }},</p>
            
            <p class="intro">
                De nouvelles missions correspondant à vos compétences sont disponibles dans votre région. 
                Ne les laissez pas passer ! 🚀
            </p>

            @foreach($tasks as $task)
            <div class="task-card">
                <h3 class="task-title">{{ $task['title'] }}</h3>
                <div class="task-meta">
                    <span>📍 {{ $task['city'] ?? $location }}</span>
                    <span>📅 {{ $task['created_ago'] }}</span>
                </div>
                @if($task['description'])
                <p style="font-size: 13px; color: #475569; margin: 8px 0;">
                    {{ Str::limit($task['description'], 120) }}
                </p>
                @endif
                @if($task['budget'])
                <span class="task-budget">💰 {{ $task['budget'] }}</span>
                @endif
            </div>
            @endforeach

            <div style="text-align: center; margin: 32px 0;">
                <a href="https://prochepro.fr/tasks/browse" class="cta-button">
                    Voir toutes les missions
                </a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                💡 <strong>Astuce :</strong> Répondez rapidement aux missions pour augmenter vos chances d'être sélectionné !
            </p>
        </div>

        <div class="footer">
            <p>
                <a href="https://prochepro.fr/profile/notifications">Gérer mes préférences de notification</a> •
                <a href="https://prochepro.fr">ProchePro.fr</a>
            </p>
            <p style="margin-top: 12px; font-size: 11px; color: #94a3b8;">
                Vous recevez cet email car vous êtes inscrit sur ProchePro.<br>
                Pour ne plus recevoir ces notifications, 
                <a href="https://prochepro.fr/profile/notifications" style="color: #64748b;">modifiez vos préférences</a>.
            </p>
        </div>
    </div>
</body>
</html>
