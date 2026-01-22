<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .offer-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center; }
        .offer-code { background: white; display: inline-block; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px; margin: 15px 0; border: 2px dashed #10b981; }
        .benefit { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎁 Offre spéciale pour vous !</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Merci d'avoir choisi ProchePro ! Pour célébrer vos 2 semaines avec nous, nous avons une <strong>offre exclusive</strong> rien que pour vous :</p>
            
            <div class="offer-box">
                <h2 style="margin-top: 0; color: #059669;">🌟 OFFRE DE BIENVENUE 🌟</h2>
                
                @if($user->isClientActive())
                    <p style="font-size: 18px; margin: 20px 0;"><strong>-15% sur votre première mission</strong></p>
                    <p>Utilisez ce code lors du paiement :</p>
                    <div class="offer-code">WELCOME15</div>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">Valable jusqu'au {{ now()->addDays(7)->format('d/m/Y') }}</p>
                @else
                    <p style="font-size: 18px; margin: 20px 0;"><strong>+20% de visibilité gratuite</strong></p>
                    <p>Votre profil sera mis en avant pendant 7 jours !</p>
                    <div class="offer-code">BOOST7J</div>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">Activez avant le {{ now()->addDays(7)->format('d/m/Y') }}</p>
                @endif
            </div>
            
            <h3>✨ En plus, profitez de :</h3>
            <div class="benefit">✓ Support prioritaire par email et chat</div>
            <div class="benefit">✓ Accès à nos guides et tutoriels exclusifs</div>
            <div class="benefit">✓ Conseils personnalisés pour réussir</div>
            <div class="benefit" style="border-bottom: none;">✓ Alertes pour les nouvelles opportunités</div>
            
            <center>
                <a href="https://prochepro.fr/{{ $user->isClientActive() ? 'tasks/new' : 'dashboard' }}" class="button">
                    {{ $user->isClientActive() ? 'Publier une annonce' : 'Activer mon boost' }}
                </a>
            </center>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
                Cette offre est réservée aux membres actifs comme vous.<br>
                Ne la manquez pas !
            </p>
            
            <p>À très bientôt,<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
            <p><a href="https://prochepro.fr/settings/notifications">Gérer mes préférences email</a></p>
        </div>
    </div>
</body>
</html>
