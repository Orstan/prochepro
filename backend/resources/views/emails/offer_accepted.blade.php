@extends('emails.layout')

@section('title', 'Offre acceptée - ProchePro')

@section('content')
    <h1 class="greeting">🎉 Félicitations {{ $data['prestataire_name'] ?? '' }} !</h1>
    
    <p class="message">
        Excellente nouvelle ! Votre offre a été acceptée par le client.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Mission</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre mission' }}</p>
    </div>
    
    @if(isset($data['price']))
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Montant accepté</p>
        <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;">{{ $data['price'] }}€</p>
    </div>
    @endif
    
    <p class="message">
        Vous pouvez maintenant contacter le client via la messagerie pour organiser les détails de la mission.
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Voir la mission
        </a>
    </div>
    
    <p class="message text-small text-muted">
        💡 Conseil : Répondez rapidement pour faire bonne impression !
    </p>
@endsection
