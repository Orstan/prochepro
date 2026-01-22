@extends('emails.layout')

@section('title', 'Votre compte ProchePro')

@section('content')
    <h1 class="greeting">Bienvenue sur ProchePro ! 🎉</h1>
    
    <p class="message">
        Votre annonce <strong>"{{ $task->title }}"</strong> a été publiée avec succès et un compte a été automatiquement créé pour vous.
    </p>

    <div class="info-box">
        <p class="info-box-title">Vos identifiants de connexion</p>
        <p class="info-box-content" style="margin-bottom: 12px;">
            <strong>Email :</strong> {{ $user->email }}
        </p>
        <p class="info-box-content">
            <strong>Mot de passe :</strong> {{ $password }}
        </p>
    </div>

    <p class="message">
        Conservez ces identifiants en lieu sûr. Vous pouvez vous connecter à tout moment pour :
    </p>

    <ul style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">
        <li>Consulter les offres des prestataires</li>
        <li>Communiquer avec eux via la messagerie</li>
        <li>Gérer vos annonces</li>
        <li>Modifier votre mot de passe dans les paramètres</li>
    </ul>

    <div class="button-wrapper">
        <a href="https://prochepro.fr/auth/login" class="button">
            Se connecter
        </a>
    </div>

    <div style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; margin-top: 24px; border-left: 4px solid #0ea5e9;">
        <p style="font-size: 14px; color: #0369a1; margin: 0;">
            <strong>💡 Conseil :</strong> Changez votre mot de passe dès votre première connexion pour plus de sécurité.
        </p>
    </div>

    <p class="message" style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
        Si vous avez des questions, n'hésitez pas à nous contacter via notre page d'aide.
    </p>
@endsection
