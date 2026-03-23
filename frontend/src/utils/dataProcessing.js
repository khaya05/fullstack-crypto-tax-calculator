const TRANSACTION_TYPES = ['Buy', 'Sell', 'Trade', 'Transfer'];

// Enhanced column name mapping
const COLUMN_MAPPINGS = {
  'Date': ['date', 'transaction date', 'transaction_date', 'time', 'datetime', 'timestamp'],
  'Transaction Type': ['type', 'transaction type', 'transaction_type', 'transactiontype', 'action'],
  'Asset': ['asset', 'coin', 'symbol', 'cryptocurrency', 'crypto', 'currency', 'token'],
  'Quantity': ['quantity', 'amount', 'qty', 'volume', 'size'],
  'Price per Unit (ZAR)': ['price per unit', 'price', 'priceperunit', 'price_per_unit', 'unit price', 'rate', 'value'],
  'Total Value (ZAR)': ['total value', 'total', 'totalvalue', 'total_value', 'gross', 'subtotal'],
  'Fees (ZAR)': ['fees', 'fee', 'commission', 'cost', 'charges'],
  'Exchange / Wallet': ['exchange', 'wallet', 'exchange / wallet', 'exchange/wallet', 'platform', 'source'],
  'Transaction ID': ['transaction id', 'transactionid', 'transaction_id', 'id', 'txid', 'tx id', 'hash'],
  'Notes': ['notes', 'note', 'description', 'memo', 'comment', 'remarks']
};

const normalizeHeader = (header) => {
  return header.toLowerCase().trim().replace(/\s+/g, ' ');
};

const findMatchingHeader = (header, possibleMatches) => {
  const normalized = normalizeHeader(header);
  return possibleMatches.some(match =>
    normalized === normalizeHeader(match) ||
    normalized.includes(normalizeHeader(match)) ||
    normalizeHeader(match).includes(normalized)
  );
};

export const parseCSVData = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim());

  // Map headers to expected format
  const headerMap = {};
  Object.entries(COLUMN_MAPPINGS).forEach(([expectedHeader, possibleMatches]) => {
    const found = headers.find(h => findMatchingHeader(h, possibleMatches));
    if (found) {
      headerMap[expectedHeader] = found;
    }
  });

  // Check for required headers
  const requiredHeaders = ['Date', 'Transaction Type', 'Asset', 'Quantity'];
  const missingHeaders = requiredHeaders.filter(h => !headerMap[h]);
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}. Found columns: ${headers.join(', ')}`);
  }

  const data = lines.slice(1).map((line, index) => {
    if (!line.trim()) return null;

    const values = line.split(delimiter).map(v => v.trim());

    const getValueByHeader = (expectedHeader) => {
      const mappedHeader = headerMap[expectedHeader];
      if (!mappedHeader) return '';
      const headerIndex = headers.indexOf(mappedHeader);
      return headerIndex >= 0 ? values[headerIndex] || '' : '';
    };

    const quantity = getValueByHeader('Quantity');
    const pricePerUnit = getValueByHeader('Price per Unit (ZAR)');
    const totalValue = getValueByHeader('Total Value (ZAR)');

    // Calculate total value if not provided
    let calculatedTotal = totalValue;
    if (!totalValue && quantity && pricePerUnit) {
      calculatedTotal = (parseFloat(quantity) * parseFloat(pricePerUnit)).toString();
    }

    // Calculate price per unit if not provided
    let calculatedPrice = pricePerUnit;
    if (!pricePerUnit && quantity && totalValue) {
      calculatedPrice = (parseFloat(totalValue) / parseFloat(quantity)).toString();
    }

    const row = {
      Date: getValueByHeader('Date'),
      TransactionType: getValueByHeader('Transaction Type'),
      Asset: getValueByHeader('Asset'),
      Quantity: quantity,
      PricePerUnit: calculatedPrice || '0',
      TotalValue: calculatedTotal || '0',
      Fees: getValueByHeader('Fees (ZAR)') || '0',
      ExchangeWallet: getValueByHeader('Exchange / Wallet') || 'Unknown',
      TransactionID: getValueByHeader('Transaction ID') || '',
      Notes: getValueByHeader('Notes') || '',
      rowIndex: index + 2
    };

    return row;
  }).filter(row => row !== null);

  return data;
};

const getValueByHeader = (values, headers, headerName) => {
  if (!headerName) return '';
  const index = headers.indexOf(headerName);
  return index >= 0 ? values[index] || '' : '';
};

export const validateTransactionData = (data) => {
  const errors = [];

  data.forEach((transaction, index) => {
    const rowNum = transaction.rowIndex || index + 1;

    if (!transaction.Date || isNaN(Date.parse(transaction.Date))) {
      errors.push(`Row ${rowNum}: Invalid or missing date`);
    }

    if (!TRANSACTION_TYPES.includes(transaction.TransactionType)) {
      errors.push(`Row ${rowNum}: Invalid transaction type '${transaction.TransactionType}'. Must be: ${TRANSACTION_TYPES.join(', ')}`);
    }

    if (!transaction.Asset || transaction.Asset.length < 2) {
      errors.push(`Row ${rowNum}: Invalid or missing asset symbol`);
    }

    const quantity = parseFloat(transaction.Quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Row ${rowNum}: Invalid quantity '${transaction.Quantity}'. Must be a positive number`);
    }

    const pricePerUnit = parseFloat(transaction.PricePerUnit);
    if (transaction.TransactionType !== 'Transfer' && (isNaN(pricePerUnit) || pricePerUnit <= 0)) {
      errors.push(`Row ${rowNum}: Invalid price per unit '${transaction.PricePerUnit}'. Must be a positive number`);
    }

    const totalValue = parseFloat(transaction.TotalValue);
    const calculatedTotal = quantity * pricePerUnit;
    if (transaction.TransactionType !== 'Transfer' && totalValue > 0 && Math.abs(totalValue - calculatedTotal) > 1) {
      errors.push(`Row ${rowNum}: Total value (${totalValue}) doesn't match Quantity × Price (${calculatedTotal.toFixed(2)})`);
    }

    const fees = parseFloat(transaction.Fees);
    if (isNaN(fees) || fees < 0) {
      errors.push(`Row ${rowNum}: Invalid fees '${transaction.Fees}'. Must be 0 or positive number`);
    }
  });

  return errors;
};

export const convertToFIFOFormat = (transactions) => {
  return transactions.map(t => ({
    date: t.Date,
    type: t.TransactionType.toUpperCase(),
    coin: t.Asset,
    quantity: parseFloat(t.Quantity),
    price: parseFloat(t.PricePerUnit),
    totalValue: parseFloat(t.TotalValue),
    fee: parseFloat(t.Fees || 0),
    wallet: t.ExchangeWallet,
    transactionId: t.TransactionID,
    notes: t.Notes,
    taxYear: getTaxYear(t.Date)
  }));
};