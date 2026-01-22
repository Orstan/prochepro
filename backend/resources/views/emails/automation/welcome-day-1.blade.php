<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .step { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .step-number { display: inline-block; background: #0ea5e9; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Comment créer votre première annonce</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Créer votre première annonce sur ProchePro est <strong>simple et rapide</strong> ! Voici comment faire en 4 étapes :</p>
            
            <div class="step">
                <span class="step-number">1</span>
                <strong>Décrivez votre besoin</strong><br>
                Soyez précis : "Réparer une fuite sous l'évier" plutôt que "Problème de plomberie"
            </div>
            
            <div class="step">
                <span class="step-number">2</span>
                <strong>Ajoutez les détails</strong><br>
                Choisissez la catégorie, indiquez votre localisation et ajoutez des photos si possible
            </div>
            
            <div class="step">
                <span class="step-number">3</span>
                <strong>Définissez votre budget</strong><br>
                Indiquez un budget approximatif pour recevoir des offres adaptées
            </div>
            
            <div class="step">
                <span class="step-number">4</span>
                <strong>Publiez !</strong><br>
                Recevez des offres de prestataires qualifiés en quelques heures
            </div>
            
            <p><strong>💡 Le saviez-vous ?</strong> Les annonces avec photos reçoivent en moyenne <strong>3x plus d'offres</strong> !</p>
            
            <center>
                <a href="https://prochepro.fr/tasks/new" class="button">Créer mon annonce maintenant</a>
            </center>
            
            <p>Des questions ? Notre équipe est là pour vous aider.</p>
            
            <p>Bonne chance !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
            <p><a href="https://prochepro.fr/settings/notifications">Gérer mes préférences email</a></p>
        </div>
    </div>
</body>
</html>
