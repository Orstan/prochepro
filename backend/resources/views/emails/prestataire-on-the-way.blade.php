<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .eta-box { background: #e3f2fd; border-left: 4px solid #1E88E5; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .button { display: inline-block; background: #1E88E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚗 En route vers vous !</h1>
        </div>
        
        <div class="content">
            <div class="card">
                <h2 style="color: #1E88E5; margin-top: 0;">Bonjour,</h2>
                
                <p><strong>{{ $prestataire->name }}</strong> est en route pour votre mission :</p>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <p style="margin: 0; font-weight: bold; color: #333;">{{ $task->title }}</p>
                    @if($task->city)
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">📍 {{ $task->city }}</p>
                    @endif
                </div>
                
                <div class="eta-box">
                    <p style="margin: 0; font-size: 16px;">
                        <strong>⏱️ Arrivée estimée :</strong> environ {{ $etaMinutes }} minutes
                    </p>
                </div>
                
                <p>Vous pouvez suivre sa position en temps réel sur la carte de suivi.</p>
                
                <div style="text-align: center;">
                    <a href="{{ config('app.frontend_url') }}/tasks/{{ $task->id }}" class="button">
                        Voir le suivi en direct
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Vous recevez cet email car vous avez une mission en cours sur ProchePro.</p>
                <p>© {{ date('Y') }} ProchePro - Tous droits réservés</p>
            </div>
        </div>
    </div>
</body>
</html>
