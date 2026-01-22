@extends('emails.layout')

@section('title', 'Nouveau message - ProchePro')

@section('content')
    <h1 class="greeting">💬 Nouveau message !</h1>
    
    <p class="message">
        Vous avez reçu un nouveau message concernant votre tâche.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche concernée</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <p class="message">
        Connectez-vous à votre compte pour lire le message et répondre.
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/messages/{{ $data['task_id'] ?? '' }}" class="button">
            Voir le message
        </a>
    </div>
    
    <p class="message text-small text-muted">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        https://prochepro.fr/messages/{{ $data['task_id'] ?? '' }}
    </p>
@endsection
