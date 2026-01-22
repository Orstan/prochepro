<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👋 Bienvenue sur ProchePro !</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Nous sommes ravis de vous accueillir sur <strong>ProchePro</strong>, la plateforme qui connecte clients et prestataires de services à domicile !</p>
            
            <h3>🎯 Pour commencer :</h3>
            <ul>
                @if($user->isClientActive())
                    <li>Publiez votre première annonce en 2 minutes</li>
                    <li>Recevez des offres de prestataires qualifiés</li>
                    <li>Comparez les prix et les profils</li>
                    <li>Choisissez le meilleur prestataire pour vous</li>
                @else
                    <li>Complétez votre profil professionnel</li>
                    <li>Parcourez les annonces disponibles</li>
                    <li>Envoyez vos premières offres</li>
                    <li>Développez votre activité</li>
                @endif
            </ul>
            
            <center>
                <a href="https://prochepro.fr/{{ $user->isClientActive() ? 'tasks/new' : 'tasks/browse' }}" class="button">
                    {{ $user->isClientActive() ? 'Publier une annonce' : 'Voir les annonces' }}
                </a>
            </center>
            
            <p>Besoin d'aide ? Notre équipe est là pour vous : <a href="https://prochepro.fr/help">Centre d'aide</a></p>
            
            <p>À très bientôt,<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
            <p><a href="https://prochepro.fr/settings/notifications">Gérer mes préférences email</a></p>
        </div>
    </div>
</body>
</html>
