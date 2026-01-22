@extends('emails.layout')

@section('title', 'Bonus de parrainage - ProchePro')

@section('content')
    <h1 class="greeting">🎁 Crédit gratuit !</h1>
    
    <p class="message">
        Bonjour <strong>{{ $data['user_name'] ?? 'cher utilisateur' }}</strong>,
    </p>
    
    @if(isset($data['referred_name']))
        <p class="message">
            Grâce à votre parrainage, <strong>{{ $data['referred_name'] }}</strong> a effectué sa première action sur ProchePro !
        </p>
    @else
        <p class="message">
            Vous avez effectué votre première action sur ProchePro grâce à un parrainage !
        </p>
    @endif
    
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0;">
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Crédit ajouté</p>
        <p style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 0;">+1</p>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0 0;">
            {{ ($data['credit_type'] ?? '') === 'client' ? 'annonce gratuite' : 'offre gratuite' }}
        </p>
    </div>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/dashboard" class="button">
            Voir mon tableau de bord
        </a>
    </div>
    
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 16px; margin-top: 24px; text-align: center;">
        <p style="color: #059669; font-size: 14px; margin: 0;">
            💡 Continuez à inviter vos amis pour gagner encore plus de crédits gratuits !
        </p>
    </div>
@endsection
