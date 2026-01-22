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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        }
        .icon {
            font-size: 64px;
            margin-bottom: 16px;
            animation: bounce 1s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .success-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            text-align: center;
        }
        .success-box p {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .info-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        .info-section h3 {
            color: #1e293b;
            font-size: 16px;
            margin: 0 0 12px 0;
            font-weight: 600;
        }
        .info-section ul {
            margin: 0;
            padding-left: 20px;
            color: #475569;
        }
        .info-section li {
            margin: 8px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #e2e8f0;
        }
        .footer p {
            color: #94a3b8;
            font-size: 14px;
            margin: 8px 0;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                <h1>Test de Notification</h1>
                <p class="subtitle">Vos notifications sont correctement configurées</p>
            </div>

            <div class="success-box">
                <p>✅ Félicitations ! Votre système de notification fonctionne parfaitement</p>
            </div>

            <div class="info-section">
                <h3>📬 Ce qui fonctionne :</h3>
                <ul>
                    <li>✉️ Notifications par email activées</li>
                    <li>🔔 Système de notifications en temps réel</li>
                    <li>🎯 Filtrage par catégories de services</li>
                    <li>⚡ Alertes instantanées pour nouvelles missions</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="{{ $frontendUrl }}/dashboard" class="button">
                    Accéder au Dashboard
                </a>
            </div>

            <div class="info-section">
                <h3>💡 Astuce</h3>
                <p style="margin: 0; color: #475569;">
                    Vous recevrez maintenant des notifications chaque fois qu'une nouvelle mission correspondant à vos compétences sera publiée. Soyez le premier à répondre !
                </p>
            </div>

            <div class="footer">
                <p class="logo">ProchePro</p>
                <p>Votre plateforme de mise en relation professionnelle</p>
                <p>
                    <a href="{{ $frontendUrl }}/settings/notifications" style="color: #667eea; text-decoration: none;">
                        Gérer mes notifications
                    </a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
