@extends('emails.layout')

@section('title', 'Demande de vérification rejetée - ProchePro')

@section('content')
    <h1 class="greeting">Bonjour {{ $data['user_name'] ?? '' }},</h1>
    
    <p class="message">
        Nous avons examiné votre demande de vérification d'identité et malheureusement, nous n'avons pas pu l'approuver.
    </p>
    
    <div class="info-box" style="background-color: #fef2f2; border-color: #fecaca;">
        <p class="info-box-title" style="color: #dc2626;">Raison du rejet</p>
        <p class="info-box-content">{{ $data['reason'] ?? 'Non spécifiée' }}</p>
    </div>
    
    <p class="message">
        Vous pouvez soumettre une nouvelle demande de vérification en corrigeant les problèmes mentionnés ci-dessus.
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/profile/verification" class="button">
            Soumettre une nouvelle demande
        </a>
    </div>
    
    <p class="message text-small text-muted">
        Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter via le formulaire de contact.
    </p>
@endsection
