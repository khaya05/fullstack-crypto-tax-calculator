const TRANSACTION_TYPES = ['Buy', 'Sell', 'Trade', 'Transfer'];

export const parseCSVData = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim());
  
  const expectedHeaders = [
    'Date', 'Transaction Type', 'Asset', 'Quantity', 
    'Price per Unit (ZAR)', 'Total Value (ZAR)', 'Fees (ZAR)', 
    'Exchange / Wallet', 'Transaction ID', 'Notes'
  ];
  
  const headerMap = {};
  expectedHeaders.forEach(expected => {
    const found = headers.find(h => 
      h.toLowerCase().includes(expected.toLowerCase().split(' ')[0]) ||
      (expected === 'Transaction Type' && h.toLowerCase().includes('type')) ||
      (expected === 'Asset' && (h.toLowerCase().includes('asset') || h.toLowerCase().includes('coin'))) ||
      (expected === 'Price per Unit (ZAR)' && h.toLowerCase().includes('price')) ||
      (expected === 'Total Value (ZAR)' && h.toLowerCase().includes('total')) ||
      (expected === 'Fees (ZAR)' && h.toLowerCase().includes('fee')) ||
      (expected === 'Exchange / Wallet' && (h.toLowerCase().includes('exchange') || h.toLowerCase().includes('wallet')))
    );
    if (found) headerMap[expected] = found;
  });

  const requiredHeaders = ['Date', 'Transaction Type', 'Asset', 'Quantity'];
  const missingHeaders = requiredHeaders.filter(h => !headerMap[h]);
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const data = lines.slice(1).map((line, index) => {
    if (!line.trim()) return null;
    
    const values = line.split(delimiter).map(v => v.trim());
    const row = {
      Date: getValueByHeader(values, headers, headerMap['Date']) || '',
      TransactionType: getValueByHeader(values, headers, headerMap['Transaction Type']) || '',
      Asset: getValueByHeader(values, headers, headerMap['Asset']) || '',
      Quantity: getValueByHeader(values, headers, headerMap['Quantity']) || '',
      PricePerUnit: getValueByHeader(values, headers, headerMap['Price per Unit (ZAR)']) || '0',
      TotalValue: getValueByHeader(values, headers, headerMap['Total Value (ZAR)']) || '0',
      Fees: getValueByHeader(values, headers, headerMap['Fees (ZAR)']) || '0',
      ExchangeWallet: getValueByHeader(values, headers, headerMap['Exchange / Wallet']) || 'Unknown',
      TransactionID: getValueByHeader(values, headers, headerMap['Transaction ID']) || '',
      Notes: getValueByHeader(values, headers, headerMap['Notes']) || '',
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
    if (transaction.TransactionType !== 'Transfer' && Math.abs(totalValue - calculatedTotal) > 1) {
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