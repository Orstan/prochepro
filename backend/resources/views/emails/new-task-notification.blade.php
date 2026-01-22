<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            position: relative;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 16px;
            display: inline-block;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        h1 {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
        }
        .subtitle {
            color: #64748b;
            font-size: 16px;
            margin: 0;
        }
        .task-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .task-title {
            font-size: 20px;
            font-weight: 700;
            color: #0c4a6e;
            margin: 0 0 16px 0;
            line-height: 1.4;
        }
        .task-detail {
            display: flex;
            align-items: flex-start;
            margin: 12px 0;
            color: #475569;
            font-size: 15px;
        }
        .task-detail strong {
            color: #0c4a6e;
            margin-right: 8px;
            min-width: 120px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
        }
        .footer {
            text-align: center;
            color: #94a3b8;
            font-size: 13px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #e2e8f0;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #0ea5e9;
            text-decoration: none;
            font-weight: 600;
        }
        .warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #92400e;
        }
        .warning strong {
            color: #78350f;
        }
        .intro-text {
            font-size: 15px;
            color: #475569;
            margin: 20px 0;
        }
        .logo {
            font-size: 20px;
            font-weight: 700;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="icon">🔔</div>
                <h1>Nouvelle mission disponible !</h1>
                <p style="color: #64748b; margin: 0;">Une mission correspond à votre profil</p>
            </div>

            <p style="font-size: 16px; color: #334155; margin: 20px 0;">
                <strong>Bonjour {{ $userName }},</strong>
            </p>
            
            <p class="intro-text">
                🎯 Une nouvelle mission vient d'être publiée dans votre domaine d'expertise. Soyez parmi les premiers à proposer vos services et augmentez vos chances d'être sélectionné !
            </p>

            <div class="task-info">
                <div class="task-title">📋 {{ $taskTitle }}</div>
                
                @if($categoryName)
                <div class="task-detail">
                    <strong>🏷️ Catégorie:</strong> <span>{{ $categoryName }}</span>
                </div>
                @endif

                @if($budgetText)
                <div class="task-detail">
                    <strong>💰 Budget:</strong> <span>{{ $budgetText }}</span>
                </div>
                @endif

                @if($locationText)
                <div class="task-detail">
                    <strong>📍 Localisation:</strong> <span>{{ $locationText }}</span>
                </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ $taskUrl }}" class="cta-button">
                    🚀 Voir la mission et proposer mes services
                </a>
            </div>

            <div class="warning">
                ⚡ <strong>Conseil Pro:</strong> Les clients choisissent souvent parmi les premières offres reçues. Répondez rapidement pour maximiser vos chances de décrocher cette mission !
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 24px; text-align: center;">
                💡 Vous recevez cet email car vous avez activé les notifications pour les nouvelles missions correspondant à votre profil sur ProchePro.
            </p>
        </div>

        <div class="footer">
            <p class="logo">ProchePro</p>
            <p>© {{ date('Y') }} ProchePro - Plateforme de mise en relation professionnelle</p>
            <p>
                <a href="{{ config('app.frontend_url') }}/settings/notifications">
                    ⚙️ Gérer mes préférences de notification
                </a>
            </p>
        </div>
    </div>
</body>
</html>
