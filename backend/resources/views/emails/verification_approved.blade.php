@extends('emails.layout')

@section('title', 'Identité vérifiée - ProchePro')

@section('content')
    <h1 class="greeting">🎉 Félicitations {{ $data['user_name'] ?? '' }} !</h1>
    
    <p class="message">
        Excellente nouvelle ! Votre identité a été vérifiée avec succès.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">✓ Compte vérifié</p>
        <p class="info-box-content">Vous pouvez maintenant proposer vos services sur ProchePro et recevoir des missions.</p>
    </div>
    
    <p class="message">
        Votre badge de vérification est maintenant visible sur votre profil, ce qui augmente la confiance des clients.
    </p>
    
    <div class="button-wrapper">
        <a href="https://prochepro.fr/tasks" class="button">
            Voir les missions disponibles
        </a>
    </div>
    
    <p class="message text-small text-muted">
        Conseil : Complétez votre profil et ajoutez des photos de vos réalisations pour attirer plus de clients !
    </p>
@endsection
