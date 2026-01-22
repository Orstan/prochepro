<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .task-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Votre annonce attend des offres</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Votre annonce "<strong>{{ $task->title }}</strong>" a été publiée il y a {{ $hoursElapsed }} heures, mais n'a pas encore reçu d'offres.</p>
            
            <div class="task-box">
                <h3>{{ $task->title }}</h3>
                <p>{{ Str::limit($task->description ?? '', 150) }}</p>
                @if($task->budget_min && $task->budget_max)
                    <p><strong>Budget :</strong> {{ $task->budget_min }}€ - {{ $task->budget_max }}€</p>
                @endif
            </div>
            
            <h3>💡 Comment augmenter vos chances ?</h3>
            <ul>
                <li>Ajoutez des photos de qualité (+40% d'offres)</li>
                <li>Précisez votre budget si possible</li>
                <li>Détaillez bien votre besoin</li>
                <li>Vérifiez que votre localisation est correcte</li>
            </ul>
            
            <center>
                <a href="https://prochepro.fr/tasks/{{ $task->id }}/edit" class="button">Améliorer mon annonce</a>
            </center>
            
            <p>Bonne chance !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
