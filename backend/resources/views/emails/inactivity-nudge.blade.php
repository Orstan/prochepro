<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>On vous attend sur ProchePro !</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .emoji { font-size: 48px; margin-bottom: 16px; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; font-weight: 600; }
        .message { font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.8; }
        .stat-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .stat-number { font-size: 36px; font-weight: 700; color: #92400e; margin: 0; }
        .stat-label { font-size: 14px; color: #78350f; margin-top: 4px; }
        .benefit-list { background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .benefit-list li { margin: 8px 0; font-size: 14px; color: #0c4a6e; }
        .cta-button { display: inline-block; background: #8b5cf6; color: white; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 24px 0; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
        .cta-button:hover { background: #7c3aed; transform: translateY(-1px); }
        .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer a { color: #8b5cf6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">👋</div>
            <h1>Ça fait {{ $daysInactive }} jours qu'on ne vous a pas vu !</h1>
        </div>

        <div class="content">
            <p class="greeting">Bonjour {{ $userName }},</p>
            
            @if($nudgeType === 'missed_offers')
            <p class="message">
                Vous avez <strong>{{ $missedOpportunities }} offre(s) en attente</strong> de votre part. 
                Des clients potentiels attendent votre réponse ! Ne laissez pas passer ces opportunités. 💼
            </p>
            
            @elseif($nudgeType === 'no_response')
            <p class="message">
                Plusieurs clients ont essayé de vous contacter ces derniers jours. 
                Une réponse rapide augmente considérablement vos chances de décrocher des missions ! 💬
            </p>
            
            @elseif($nudgeType === 'inactive_prestataire')
            <div class="stat-box">
                <p class="stat-number">{{ $missedOpportunities }}</p>
                <p class="stat-label">missions auraient pu vous correspondre</p>
            </div>
            
            <p class="message">
                Pendant votre absence, de nombreuses missions dans votre région ont été publiées. 
                Revenez dès maintenant pour ne plus manquer d'opportunités ! 🚀
            </p>
            
            @else
            <p class="message">
                On espère que tout va bien de votre côté ! Nous avons remarqué que vous n'êtes pas revenu 
                sur ProchePro depuis {{ $daysInactive }} jours. Votre profil nous manque ! 😊
            </p>
            @endif

            <div class="benefit-list">
                <strong style="font-size: 15px; color: #0c4a6e;">En revenant sur ProchePro, vous pourrez :</strong>
                <ul style="margin: 12px 0; padding-left: 20px;">
                    <li>✅ Découvrir les nouvelles missions près de chez vous</li>
                    <li>✅ Répondre aux demandes de vos clients potentiels</li>
                    <li>✅ Améliorer votre visibilité avec nos nouvelles fonctionnalités</li>
                    <li>✅ Gérer vos offres et suivre vos missions en cours</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="https://prochepro.fr/dashboard" class="cta-button">
                    Revenir sur ProchePro
                </a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 32px; font-style: italic;">
                "Les meilleures opportunités sont pour ceux qui restent actifs !" 💪
            </p>
        </div>

        <div class="footer">
            <p>
                <a href="https://prochepro.fr/profile/notifications">Gérer mes notifications</a> •
                <a href="https://prochepro.fr/help">Besoin d'aide ?</a>
            </p>
            <p style="margin-top: 12px; font-size: 11px; color: #94a3b8;">
                Vous recevez cet email pour vous tenir informé de votre activité sur ProchePro.<br>
                <a href="https://prochepro.fr/profile/notifications" style="color: #64748b;">Modifier mes préférences</a>
            </p>
        </div>
    </div>
</body>
</html>
