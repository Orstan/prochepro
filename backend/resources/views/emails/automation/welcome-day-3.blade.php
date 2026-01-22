<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .tip-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Maximisez vos chances de succès</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Découvrez les <strong>10 services les plus demandés</strong> sur ProchePro :</p>
            
            @if($user->isClientActive())
                <h3>🔥 Top 10 des services populaires :</h3>
                <div class="tip-box">
                    <strong>1. Plomberie</strong> - Réparations, installations, dépannages
                </div>
                <div class="tip-box">
                    <strong>2. Ménage à domicile</strong> - Nettoyage régulier ou ponctuel
                </div>
                <div class="tip-box">
                    <strong>3. Électricité</strong> - Installation, réparation, mise aux normes
                </div>
                <div class="tip-box">
                    <strong>4. Peinture</strong> - Intérieur, extérieur, rénovation
                </div>
                <div class="tip-box">
                    <strong>5. Montage de meubles</strong> - IKEA et autres
                </div>
                <div class="tip-box">
                    <strong>6. Jardinage</strong> - Entretien, taille, plantations
                </div>
                <div class="tip-box">
                    <strong>7. Déménagement</strong> - Transport, manutention
                </div>
                <div class="tip-box">
                    <strong>8. Bricolage</strong> - Petits travaux, réparations
                </div>
                <div class="tip-box">
                    <strong>9. Garde d'enfants</strong> - Baby-sitting
                </div>
                <div class="tip-box">
                    <strong>10. Cours particuliers</strong> - Soutien scolaire
                </div>
            @else
                <div class="tip-box">
                    <strong>💡 Conseil #1 :</strong> Complétez votre profil à 100% pour augmenter votre visibilité.
                </div>
                
                <div class="tip-box">
                    <strong>💡 Conseil #2 :</strong> Répondez rapidement aux annonces (< 1h = +60% de succès).
                </div>
                
                <div class="tip-box">
                    <strong>💡 Conseil #3 :</strong> Personnalisez vos offres pour chaque client.
                </div>
            @endif
            
            <center>
                <a href="https://prochepro.fr/{{ $user->isClientActive() ? 'tasks/new' : 'profile/edit' }}" class="button">
                    {{ $user->isClientActive() ? 'Créer une annonce' : 'Compléter mon profil' }}
                </a>
            </center>
            
            <p>Bonne chance !<br><strong>L'équipe ProchePro</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 ProchePro. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
