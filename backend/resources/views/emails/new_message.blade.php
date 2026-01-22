@extends('emails.layout')

@section('title', 'Nouveau message - ProchePro')

@section('content')
    <h1 class="greeting">💬 Nouveau message</h1>
    
    <p class="message">
        Bonjour {{ $data['recipient_name'] ?? 'cher utilisateur' }},
    </p>
    
    <p class="message">
        <strong>{{ $data['sender_name'] ?? 'Un utilisateur' }}</strong> vous a envoyé un message concernant votre tâche.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche concernée</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <p class="message">
        Connectez-vous pour lire le message et répondre :
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Voir le message
        </a>
    </div>
    
    <p class="message text-small text-muted">
        💡 Répondez rapidement pour maintenir une bonne communication !
    </p>
@endsection
