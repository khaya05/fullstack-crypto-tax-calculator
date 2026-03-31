<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SARS Crypto Tax Report - {{ $tax_year }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.5; }
        h1, h2, h3 { color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin: 25px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f3f4f6; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .summary { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { height: 80px; margin-bottom: 15px; }
        .tax-highlight {
            background:#d1fae5;
            border-left:6px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            font-size: 1.3em;
            margin: 25px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://cdn.sanity.io/images/b31pgnm7/mfp_production/0e0c524aec181ebe4da31d8602fa71e21c1aa1d3-1200x630.png" alt="TaxTim Logo" class="logo">
        <h1>SARS Cryptocurrency Tax Report — {{ $tax_year }} Tax Year</h1>
        <p>Generated with TaxTim-style FIFO calculations</p>
    </div>

    <div class="summary">
        <p><strong>Net Capital Gain:</strong> R {{ number_format($net_capital_gain, 2) }}</p>
        <p><strong>Annual Exclusion Applied:</strong> R {{ number_format($annual_exclusion, 2) }}</p>
        <p><strong>Taxable Capital Gain:</strong> R {{ number_format($taxable_capital_gain, 2) }}</p>
    </div>

    <div class="tax-highlight">
        <strong>Key Tax Figure: Amount to Include in Your Taxable Income</strong><br>
        R {{ number_format($amount_included_in_income, 2) }}<br><br>
        <small>This 40% of your taxable gain gets added to your normal income and taxed at your personal rate (18–45%).</small>
    </div>

    <div class="tax-highlight">
        <strong>Estimated Additional Tax You Will Pay on These Gains</strong><br>
        R {{ number_format($estimated_additional_tax, 2) }}<br><br>
        <small>Based on your crypto gain being taxed at your marginal rate of {{ $marginal_tax_rate_percent }}% (assuming other income R{{ number_format($estimated_other_income, 0) }}).</small><br>
        <small>{{ $tax_note }}</small>
    </div>

    <h2>Summary of Disposals</h2>
    <table>
        <tr>
            <th>Date</th>
            <th>Asset</th>
            <th>Quantity Sold</th>
            <th>Proceeds (ZAR)</th>
            <th>Cost Base (ZAR)</th>
            <th>Gain/Loss (ZAR)</th>
        </tr>
        @foreach($disposals as $d)
        <tr>
            <td>{{ $d['date'] }}</td>
            <td>{{ $d['asset'] }}</td>
            <td>{{ number_format($d['qty_sold'], 8) }}</td>
            <td>R {{ number_format($d['proceeds'], 2) }}</td>
            <td>R {{ number_format($d['cost_base'], 2) }}</td>
            <td><strong>R {{ number_format($d['gain_loss'], 2) }}</strong></td>
        </tr>
        @endforeach
    </table>

    <h2>Detailed FIFO Breakdown</h2>
    <p>Below is the exact FIFO calculation for each disposal (oldest purchases used first).</p>

    @foreach($disposals as $d)
        <h3>{{ $d['asset'] }} Disposal on {{ $d['date'] }} (Transaction {{ $d['transaction_id'] }})</h3>
        <p><strong>Quantity sold:</strong> {{ number_format($d['qty_sold'], 8) }}<br>
           <strong>Proceeds (after fees):</strong> R {{ number_format($d['proceeds'], 2) }}<br>
           <strong>Cost base:</strong> R {{ number_format($d['cost_base'], 2) }}<br>
           <strong>Gain/Loss:</strong> R {{ number_format($d['gain_loss'], 2) }}</p>

        <p><strong>FIFO Lots Used (oldest first):</strong></p>
        <ul>
            @forelse($d['lots_used'] as $lot)
                <li>{{ number_format($lot['lot_qty'], 8) }} bought on {{ $lot['lot_date'] }} → cost R {{ number_format($lot['lot_cost'], 2) }}</li>
            @empty
                <li>No matching lots found</li>
            @endforelse
        </ul>
    @endforeach

    <p><em>{{ $explanation }}</em></p>
    <p><small>Generated on {{ now()->format('d F Y') }} • SARS-compliant FIFO method • Demo purposes only</small></p>
</body>
</html>
