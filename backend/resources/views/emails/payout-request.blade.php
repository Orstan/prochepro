@extends('emails.layout')

@section('title', 'Demande de paiement - ProchePro')

@section('content')
    <h1 class="greeting">💰 Demande de paiement</h1>
    
    <p class="message">
        Une mission a été complétée et nécessite un paiement.
    </p>
    
    <div class="info-box">
        <p class="info-box-title">Mission</p>
        <p class="info-box-content">{{ $task->title }}</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Montant à verser</p>
        <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;">{{ number_format($amount, 2, ',', ' ') }} €</p>
    </div>
    
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #10b981;">
        <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 16px 0;">🏦 Coordonnées bancaires</p>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Prestataire</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">{{ $prestataire->name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Email</td>
                <td style="padding: 8px 0; color: #1e293b;">{{ $prestataire->email }}</td>
            </tr>
            @if($prestataire->iban)
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Titulaire</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">{{ $prestataire->account_holder_name ?? $prestataire->name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">Banque</td>
                <td style="padding: 8px 0; color: #1e293b;">{{ $prestataire->bank_name ?? 'Non renseigné' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">IBAN</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">{{ $prestataire->iban }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase;">BIC/SWIFT</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">{{ $prestataire->bic ?? 'Non renseigné' }}</td>
            </tr>
            @else
            <tr>
                <td colspan="2" style="padding: 16px 0;">
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px;">
                        ⚠️ <strong>Attention :</strong> Le prestataire n'a pas renseigné ses coordonnées bancaires.
                    </div>
                </td>
            </tr>
            @endif
        </table>
    </div>
    
    <p class="message text-small text-muted">
        ID de la mission : #{{ $task->id }}<br>
        Date de complétion : {{ now()->format('d/m/Y à H:i') }}
    </p>
@endsection
