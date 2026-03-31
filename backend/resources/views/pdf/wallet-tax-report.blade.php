{{-- resources/views/pdf/wallet-tax-report.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Tax Report - {{ $wallet['name'] }} - {{ $year }}</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; background-color: #e9ecef; }
        .alert { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .alert-success { background-color: #d4edda; color: #155724; }
        .alert-danger { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $year }}Cryptocurrency Tax Report</h1>
        <h2>{{ $wallet['name'] }} ({{ $wallet['crypto_type'] }})</h2>
        <h3>Tax Year: {{ $year }}</h3>
        <p>Generated on: {{ date('F j, Y, g:i a') }}</p>
    </div>

    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Wallet Address:</strong> {{ $wallet['address'] }}</p>
        <p><strong>Total Profit:</strong> "ZAR" . {{ number_format($total_profit, 2, ".", " ") }}</p>
        <p><strong>Tax Rate:</strong> {{ $tax_rate }}</p>
        <p><strong>Tax Threshold:</strong> ${{ $tax_threshold }}</p>

        <div class="alert {{ $tax_eligible ? 'alert-danger' : 'alert-success' }}">
            <h4>{{ $tax_eligible ? 'TAX DUE' : 'NO TAX REQUIRED' }}</h4>
            <p><strong>Tax Amount:</strong> ${{ number_format($tax_amount, 2) }}</p>
        </div>
    </div>

    <div class="footer">
        <p><em>This report is for informational purposes only. Consult a tax professional for advice.</em></p>
        <p>Report ID: TAX-{{ $wallet['id'] }}-{{ $year }}-{{ time() }}</p>
    </div>
</body>
</html>
