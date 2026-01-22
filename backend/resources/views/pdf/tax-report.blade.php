<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attestation de Revenus ProchePro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 20px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 10px;
        }
        
        .document-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 15px;
        }
        
        .info-section {
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .info-label {
            font-weight: bold;
            color: #475569;
        }
        
        .info-value {
            color: #1e293b;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .summary-table th,
        .summary-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .summary-table th {
            background: #0ea5e9;
            color: white;
            font-weight: bold;
        }
        
        .summary-table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .total-row {
            font-weight: bold;
            font-size: 14px;
            background: #f1f5f9 !important;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .positive {
            color: #16a34a;
        }
        
        .commission {
            color: #dc2626;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }
        
        .disclaimer {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 10px;
        }
        
        .signature {
            text-align: right;
            margin-top: 40px;
        }
        
        .signature-text {
            font-style: italic;
            color: #64748b;
        }
        
        .page-number {
            position: fixed;
            bottom: 20px;
            right: 40px;
            color: #94a3b8;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(file_exists(public_path('logo.png')))
        <div style="text-align: center; margin-bottom: 15px;">
            <img src="{{ public_path('logo.png') }}" alt="ProchePro" style="height: 70px; width: auto; margin: 0 auto; display: block;">
        </div>
        @endif
        <div style="text-align: center; margin-bottom: 15px; margin-top: 10px;">
            <span style="color: #0ea5e9; font-size: 36px; font-weight: bold; font-family: Arial, sans-serif;">ProchePro</span>
        </div>
        <div style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 20px;">Plateforme de services de proximité</div>
        <div class="document-title">Récapitulatif Annuel des Revenus</div>
    </div>

    <div class="info-section">
        <h3 style="margin-bottom: 15px; color: #1e293b;">Informations du Prestataire</h3>
        <div class="info-row">
            <span class="info-label">Nom :</span>
            <span class="info-value">{{ $prestataire->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email :</span>
            <span class="info-value">{{ $prestataire->email }}</span>
        </div>
        @if($prestataire->siret)
        <div class="info-row">
            <span class="info-label">SIRET :</span>
            <span class="info-value">{{ $prestataire->siret }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Période :</span>
            <span class="info-value">{{ $period_label }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Date d'émission :</span>
            <span class="info-value">{{ $generated_date }}</span>
        </div>
    </div>

    <h3 style="margin-bottom: 15px; color: #1e293b;">Détail des Revenus</h3>
    
    <table class="summary-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Nombre total de missions réalisées</td>
                <td class="amount">{{ $report->missions_count }}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;• Missions avec paiement en ligne</td>
                <td class="amount">{{ $report->online_payment_missions }}</td>
            </tr>
            <tr>
                <td>&nbsp;&nbsp;• Missions avec paiement en espèces</td>
                <td class="amount">{{ $report->cash_payment_missions }}</td>
            </tr>
            <tr>
                <td><strong>Revenu brut total</strong></td>
                <td class="amount positive">{{ number_format($report->total_revenue, 2, ',', ' ') }} €</td>
            </tr>
            <tr>
                <td><strong>Commission plateforme ProchePro</strong></td>
                <td class="amount commission">- {{ number_format($report->platform_commission, 2, ',', ' ') }} €</td>
            </tr>
            <tr class="total-row">
                <td><strong>Revenu net</strong></td>
                <td class="amount positive" style="font-size: 16px;">{{ number_format($report->net_revenue, 2, ',', ' ') }} €</td>
            </tr>
        </tbody>
    </table>

    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #1e293b;">Grille Tarifaire ProchePro</h4>
        <p style="font-size: 10px; color: #475569; line-height: 1.8;">
            • <strong>3 premières missions en ligne :</strong> 0% de commission<br>
            • <strong>À partir de la 4ème mission en ligne :</strong> 10% de commission<br>
            • <strong>Missions payées en espèces :</strong> 15% de commission dès la 1ère mission
        </p>
    </div>

    <div class="footer">
        <div class="disclaimer">
            <strong>⚠️ Important :</strong> Ce document est fourni à titre informatif uniquement. 
            Il ne constitue pas un document fiscal officiel. ProchePro n'est pas responsable des 
            déclarations fiscales de ses utilisateurs. Pour toute question relative à vos obligations 
            fiscales, nous vous recommandons de consulter un expert-comptable ou l'URSSAF.
        </div>

        <div class="signature">
            <div class="signature-text">Document généré automatiquement par ProchePro</div>
            <div class="signature-text" style="margin-top: 5px;">{{ $generated_date }}</div>
        </div>
    </div>

    <div class="page-number">
        Page 1/1
    </div>
</body>
</html>
