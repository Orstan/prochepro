<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle demande de vérification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0284c7;">
                                🔔 Nouvelle demande de vérification
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                                Bonjour,
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                                Un nouveau prestataire a soumis une demande de vérification d'identité sur ProchePro.
                            </p>
                            
                            <!-- User Info Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f9ff; border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; font-size: 14px; color: #64748b;">Informations de l'utilisateur</p>
                                        <p style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">
                                            <strong>Nom :</strong> {{ $userName }}
                                        </p>
                                        <p style="margin: 0; font-size: 16px; color: #0f172a;">
                                            <strong>Email :</strong> {{ $userEmail }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Document Info Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 12px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; font-size: 14px; color: #92400e;">Informations du document</p>
                                        <p style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">
                                            <strong>Type :</strong> @if($documentType === 'cni') Carte Nationale d'Identité @else Permis de conduire @endif
                                        </p>
                                        <p style="margin: 0; font-size: 16px; color: #0f172a;">
                                            <strong>Nom sur le document :</strong> {{ $firstName }} {{ $lastName }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 16px 0;">
                                        <a href="{{ config('app.frontend_url') }}/admin/verifications" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                            Voir la demande
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                                Cet email a été envoyé automatiquement par ProchePro.<br>
                                Demande #{{ $requestId }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
