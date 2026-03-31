# SARS Crypto Tax Calculator API Documentation (Multi-Wallet functionality)

This is a complete guide to the Laravel backend for your demo cryptocurrency tax calculator. It follows South African Revenue Service (SARS) rules: FIFO (First In, First Out) method for capital gains, R40,000 annual exclusion, 40% inclusion rate, and estimated additional tax based on 2025/2026 brackets.

The API is built for a React frontend. All endpoints are under `/api` and return JSON (except PDF export).

## Requirements

- Ensure you run the following commands:

```bash
cd backend;
composer install; // installs the necessary packages
php artisan migrate --path=./database/migrations/2026_02_09_125736_create_wallets_transactions_table.php
--path=./database/migrations/2026_02_09_122800_create_wallets_table.php --seed; // Migrates the two database tables and fills them with fake wallet and transactions data for demonstrating the tax report functionality which is included as well
```

---

## Quick Start

1. **Run the server**

   ```bash
   php artisan serve
   ```

   Default URL: <http://127.0.0.1:8000>

2. **Clear caches if needed**

   ```bash
   php artisan view:clear
   php artisan cache:clear
   php artisan config:clear
   ```

## Key Features

- **Wallets**: Every wallet needs a unique address (required).
- **Demo mode**: If the address contains "demo" (anywhere, case-insensitive), the wallet automatically gets 30–80 random realistic transactions.
- **Multi-wallet support**: Tax reports combine any number of wallets into one aggregated calculation.
- **Tax calculation**: FIFO across all selected wallets, SARS-compliant, with estimated extra tax based on your other income.
- **Outputs**: JSON report or branded PDF (with TaxTim-style logo and highlighted key figures).

## API Endpoints

| Method | Endpoint                          | Description                                      | Required Payload                                      | Example curl Command                                                                                   | Response |
|--------|-----------------------------------|--------------------------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------|----------|
| GET    | `/api/wallets`                    | List all wallets                                 | None                                                  | `curl http://127.0.0.1:8000/api/wallets`                                                                | JSON array of wallets with ID, name, address, transaction count |
| POST   | `/api/wallets`                    | Create a new wallet                              | `name` (string), `address` (string, unique)           | `curl -X POST http://127.0.0.1:8000/api/wallets -H "Content-Type: application/json" -d '{"name":"My Demo Wallet","address":"demo-1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}'` | Created wallet JSON (201) |
| GET    | `/api/wallets/{id}/transactions`  | Get all transactions for a wallet                | None (use wallet ID from list)                        | `curl http://127.0.0.1:8000/api/wallets/1/transactions`                                                 | JSON array of transactions (ordered newest first) |
| POST   | `/api/tax/calculate`              | Calculate tax report (JSON)                      | `wallet_ids` (array), `tax_year` (integer), optional `other_income` (number) | `curl -X POST http://127.0.0.1:8000/api/tax/calculate -H "Content-Type: application/json" -d '{"wallet_ids":[1,2],"tax_year":2025,"other_income":400000}'` | Full JSON tax report |
| POST   | `/api/tax/export-pdf`             | Download PDF tax report                          | Same as calculate                                     | `curl -X POST http://127.0.0.1:8000/api/tax/export-pdf -H "Content-Type: application/json" -d '{"wallet_ids":[1],"tax_year":2025}' --output report.pdf` | PDF file download |
| POST   | `/api/tax/preview`                | View HTML version of report (for debugging)      | Same as calculate                                     | Open in browser or curl to see raw HTML                                                                | HTML page |

## Creating Wallets

- Address is **required** and must be unique.
- If the address contains "demo", random demo transactions are added automatically.

**Demo wallet example** (gets random data):

```json
{
  "name": "Demo Portfolio",
  "address": "demo-bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}
```

**Real/empty wallet example** (no auto-data):

```json
{
  "name": "My Binance Wallet",
  "address": "bc1qrealwalletaddress1234567890"
}
```

## Retrieving Transactions

1. List wallets → get the ID.
2. GET `/api/wallets/{id}/transactions`

Returns full details: date, type (buy/sell), asset, quantity, prices, fees, etc.

## Generating Tax Reports

Use the same payload for JSON, PDF, or preview.

**Payload fields**

- `wallet_ids`: Array of wallet IDs (1 or many → aggregates everything)
- `tax_year`: e.g. 2025 (SARS year runs 1 March previous year to end Feb)
- `other_income`: Optional — your other taxable income (R0 if none). Used to show exact marginal tax rate and extra tax you'll pay on the crypto gain.

**Report includes**

- Net capital gain
- After R40,000 exclusion
- Amount added to taxable income (40%)
- Estimated additional tax you'll actually pay (highlighted)
- Marginal tax rate
- Full disposal list
- Detailed FIFO breakdown for every sale

## Connecting to a React Frontend (Axios Examples)

Install Axios in React:

```bash
npm install axios
```

**Example React hooks**

```javascript
import axios from 'axios';
const API = 'http://127.0.0.1:8000/api';

// List wallets
const { data: wallets } = await axios.get(`${API}/wallets`);

// Create demo wallet
await axios.post(`${API}/wallets`, {
  name: 'Demo Wallet',
  address: 'demo-1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
});

// Get transactions
const { data: transactions } = await axios.get(`${API}/wallets/${walletId}/transactions`);

// Calculate tax (JSON)
const report = await axios.post(`${API}/tax/calculate`, {
  wallet_ids: [1, 3],
  tax_year: 2025,
  other_income: 500000
});

// Download PDF
const response = await axios.post(`${API}/tax/export-pdf`, payload, { responseType: 'blob' });
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'sars-crypto-tax-2025.pdf');
document.body.appendChild(link);
link.click();
```

## Technical Terms Explained Simply

- **FIFO (First In, First Out)**: When you sell crypto, the system matches the sale to your oldest purchases first to calculate gain/loss accurately.
- **Annual Exclusion**: SARS lets you ignore the first R40,000 of capital gains each year.
- **Inclusion Rate**: 40% of your taxable crypto gain is added to your normal income and taxed at your personal rate (18–45%).
- **Marginal Rate**: The tax percentage on your highest income bracket — this is what the crypto gain gets taxed at.

---

# Crypto Tax Calculator - Backend Documentation

## Installation

### 1. Requirements

- PHP 8.2+
- Composer
- SQLite

### 2. Install Dependencies

```bash
cd backend
composer install
```

### 3. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Database

Edit `.env`:

```
DB_CONNECTION=sqlite
```

Create database:

```bash
touch database/database.sqlite
php artisan migrate
```

### 5. Start Server

```bash
php artisan serve
```

Server runs at: `http://localhost:8000`

---

## API Endpoints

Base URL: `http://localhost:8000/api`

### Import Transactions

#### Upload File (CSV/Excel)

```
POST /api/transactions/upload
Content-Type: multipart/form-data
```

**Request:**

- `file`: CSV or Excel file (.csv, .txt, .xlsx, .xls)

**Example:**

```bash
curl -X POST http://localhost:8000/api/transactions/upload \
  -F "file=@transactions.csv"
```

**CSV Format:**

```csv
date,type,coin,quantity,price_zar,fee
2023-03-15,BUY,BTC,0.5,400000,50
2023-06-15,SELL,BTC,0.3,450000,25
```

**Response:**

```json
{
  "status": "success",
  "message": "Imported 8 transactions successfully",
  "data": {
    "session_id": "calc-abc123",
    "count": 8,
    "errors": []
  }
}
```

---

#### Paste Transactions

```
POST /api/transactions/paste
Content-Type: application/json
```

**Request:**

```json
{
  "text": "date,type,coin,quantity,price_zar,fee\n2023-03-15,BUY,BTC,0.5,400000,50"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Imported 3 transactions successfully",
  "data": {
    "session_id": "calc-def456",
    "count": 3,
    "errors": []
  }
}
```

---

### Calculate Tax

#### Get Tax Calculation (By Tax Year)

```
POST /api/calculate
Content-Type: application/json
```

**Request:**

```json
{
  "session_id": "calc-abc123"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "session_id": "calc-abc123",
    "overall_summary": {
      "total_years": 2,
      "total_transactions": 15,
      "total_capital_gain_all_years": 99700,
      "total_taxable_all_years": 3940
    },
    "tax_years": [
      {
        "tax_year": 2024,
        "period": "2024-03-01 to 2025-02-28",
        "status": "current",
        "total_gain": 49850,
        "fifo_calculation": {
          "total_capital_gain": 49850,
          "annual_exclusion_applied": 40000,
          "net_capital_gain": 9850,
          "taxable_capital_gain": 3940
        },
        "coins": [...]
      }
    ]
  }
}
```

---

#### Download PDF Report

```
POST /api/calculate/download-pdf
Content-Type: application/json
```

**Request:**

```json
{
  "session_id": "calc-abc123"
}
```

**Response:** PDF file download

**Example:**

```bash
curl -X POST http://localhost:8000/api/calculate/download-pdf \
  -H "Content-Type: application/json" \
  -d '{"session_id":"calc-abc123"}' \
  --output report.pdf
```

---

### View Transactions

#### Get All Transactions

```
GET /api/transactions?session_id=calc-abc123
```

**Response:**

```json
{
  "status": "success",
  "data": [...],
  "count": 8
}
```

---

#### Get Transactions by Tax Year

```
GET /api/transactions/by-tax-year?session_id=calc-abc123
```

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "tax_year": 2024,
      "period": "2024-03-01 to 2025-02-28",
      "transactions": [...],
      "count": 5
    }
  ],
  "total_tax_years": 2
}
```

---

#### Get Session Transactions

```
GET /api/transactions/session/{sessionId}
```

**Example:**

```
GET /api/transactions/session/calc-abc123
```

---

### Delete Transactions

#### Delete Session

```
DELETE /api/transactions/session/{sessionId}
```

**Example:**

```bash
curl -X DELETE http://localhost:8000/api/transactions/session/calc-abc123
```

**Response:**

```json
{
  "status": "success",
  "message": "Deleted 8 transactions"
}
```

---

## Tax Calculation Details

### South African Tax Rules

- **Tax Year:** March 1 - February 28/29
- **Annual Exclusion:** R40,000 per tax year
- **Inclusion Rate:** 40% (only 40% of net gain is taxable)
- **Method:** FIFO (First-In-First-Out)

### Calculation Steps

1. Group transactions by tax year
2. Calculate capital gains using FIFO method
3. Apply R40,000 annual exclusion per year
4. Apply 40% inclusion rate
5. Result = taxable amount to add to income

## Column Name Variations

The importer recognizes these column names:

| Field | Accepted Names |
|-------|---------------|
| date | date, transaction_date, Date, DATE |
| type | type, transaction_type, Type, TYPE |
| coin | coin, asset, cryptocurrency, Asset, symbol |
| quantity | quantity, amount, qty, Volume |
| price_zar | price_zar, price, Price, rate |
| fee | fee, fees, commission, Fee |

---
