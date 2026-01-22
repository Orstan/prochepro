@extends('emails.layout')

@section('title', 'Nouvelle offre - ProchePro')

@section('content')
    <h1 class="greeting">🎯 Nouvelle offre reçue !</h1>
    
    <p class="message">
        Bonjour {{ $data['client_name'] ?? 'cher client' }},
    </p>
    
    <p class="message">
        Bonne nouvelle ! <strong>{{ $data['prestataire_name'] ?? 'Un prestataire' }}</strong> a fait une offre pour votre tâche.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Prix proposé</p>
        <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;">{{ $data['price'] ?? '?' }}€</p>
    </div>
    
    @if(!empty($data['message']))
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">💬 Message du prestataire :</p>
        <p style="color: #334155; font-size: 16px; margin: 0; font-style: italic;">"{{ $data['message'] }}"</p>
    </div>
    @endif
    
    <p class="message">
        Connectez-vous pour voir les détails et accepter l'offre :
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Voir l'offre
        </a>
    </div>
    
    <p class="message text-small text-muted">
        💡 Conseil : Consultez le profil du prestataire et ses avis avant de prendre votre décision.
    </p>
@endsection
