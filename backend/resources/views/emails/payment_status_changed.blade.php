@extends('emails.layout')

@section('title', 'Paiement mis à jour - ProchePro')

@section('content')
    <h1 class="greeting">💳 Mise à jour du paiement</h1>
    
    <p class="message">
        Le statut de votre paiement a été mis à jour.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Tâche</p>
        <p class="info-box-content">{{ $data['task_title'] ?? 'Votre tâche' }}</p>
    </div>
    
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #059669; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Statut</p>
        <p style="color: #047857; font-size: 24px; font-weight: 700; margin: 0;">
            @if(($data['status'] ?? '') === 'captured')
                ✅ Paiement confirmé
            @elseif(($data['status'] ?? '') === 'refunded')
                ↩️ Remboursé
            @else
                {{ $data['status'] ?? 'Mis à jour' }}
            @endif
        </p>
        @if(isset($data['amount']))
        <p style="color: #059669; font-size: 18px; margin: 12px 0 0 0;">{{ $data['amount'] }} €</p>
        @endif
    </div>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks/{{ $data['task_id'] ?? '' }}" class="button">
            Voir les détails
        </a>
    </div>
@endsection
