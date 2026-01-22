<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'ProchePro')</title>
    <style>
        /* Reset */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: #f5f7fa;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        .email-wrapper {
            width: 100%;
            background-color: #f5f7fa;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
            padding: 32px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        
        .logo-icon {
            display: inline-block;
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            margin-right: 12px;
            vertical-align: middle;
        }
        
        /* Content */
        .email-content {
            padding: 40px 32px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 24px 0;
        }
        
        /* Info box */
        .info-box {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            border-left: 4px solid #1E88E5;
        }
        
        .info-box-title {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
        }
        
        .info-box-content {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
        }
        
        /* Button */
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(30, 136, 229, 0.4);
        }
        
        .button:hover {
            background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
        }
        
        /* Footer */
        .email-footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #94a3b8;
            margin: 0 0 8px 0;
        }
        
        .footer-links {
            margin: 16px 0 0 0;
        }
        
        .footer-links a {
            color: #64748b;
            text-decoration: none;
            font-size: 13px;
            margin: 0 12px;
        }
        
        .footer-links a:hover {
            color: #1E88E5;
        }
        
        /* Utilities */
        .text-muted {
            color: #94a3b8;
        }
        
        .text-small {
            font-size: 14px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            .email-content {
                padding: 24px 20px;
            }
            .email-header {
                padding: 24px 20px;
            }
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <table class="email-container" cellpadding="0" cellspacing="0" width="100%">
            <!-- Header -->
            <tr>
                <td class="email-header">
                    <a href="https://prochepro.fr" class="logo">
                        ⚡ ProchePro
                    </a>
                </td>
            </tr>
            
            <!-- Content -->
            <tr>
                <td class="email-content">
                    @yield('content')
                </td>
            </tr>
            
            <!-- Footer -->
            <tr>
                <td class="email-footer">
                    <p class="footer-text">
                        Cet email a été envoyé par ProchePro
                    </p>
                    <p class="footer-text text-small">
                        © {{ date('Y') }} ProchePro. Tous droits réservés.
                    </p>
                    <div class="footer-links">
                        <a href="https://prochepro.fr">Site web</a>
                        <a href="https://prochepro.fr/profile/notifications">Préférences</a>
                        <a href="https://prochepro.fr/help">Aide</a>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
