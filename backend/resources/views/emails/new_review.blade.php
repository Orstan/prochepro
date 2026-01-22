@extends('emails.layout')

@section('title', 'Nouvel avis - ProchePro')

@section('content')
    <h1 class="greeting">⭐ Nouvel avis reçu !</h1>
    
    <p class="message">
        Bonjour {{ $data['recipient_name'] ?? '' }},
    </p>
    
    <p class="message">
        <strong>{{ $data['reviewer_name'] ?? 'Un utilisateur' }}</strong> vous a laissé un avis !
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Votre note</p>
        <span style="font-size: 36px;">
            @for ($i = 1; $i <= 5; $i++)
                @if ($i <= ($data['rating'] ?? 0))
                    ⭐
                @else
                    ☆
                @endif
            @endfor
        </span>
        <p style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 12px 0 0 0;">{{ $data['rating'] ?? '?' }}/5</p>
    </div>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Voir l'avis complet
        </a>
    </div>
    
    <p class="message text-small text-muted">
        💡 Les bons avis améliorent votre visibilité sur la plateforme !
    </p>
@endsection
