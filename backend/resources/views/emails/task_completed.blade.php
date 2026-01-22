@extends('emails.layout')

@section('title', 'Tâche terminée - ProchePro')

@section('content')
    <h1 class="greeting">✅ Mission accomplie !</h1>
    
    <p class="message">
        Bonjour {{ $data['recipient_name'] ?? '' }},
    </p>
    
    <p class="message">
        La tâche a été marquée comme terminée avec succès.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <span style="font-size: 48px;">🎊</span>
        <p style="color: #047857; font-size: 18px; font-weight: 600; margin: 12px 0 0 0;">
            Merci d'avoir utilisé ProchePro !
        </p>
    </div>
    
    <p class="message">
        @if($data['is_prestataire'] ?? false)
            N'oubliez pas de laisser un avis sur le client !
        @else
            N'oubliez pas de laisser un avis sur le prestataire !
        @endif
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Laisser un avis ⭐
        </a>
    </div>
    
    <p class="message text-small text-muted">
        💡 Les avis aident la communauté à trouver les meilleurs prestataires et clients.
    </p>
@endsection
