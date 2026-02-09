import { getTaxYear } from './taxCalculations.js';

// FIFO Balance structure: { amount: number, price: number, date: string }
// Coin balances: { [coin]: FIFOBalance[] }

/**
 * Calculate FIFO-based crypto tax calculations
 */
export const calculateFIFO = (transactions) => {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.Date) - new Date(b.Date)
  );

  // Track balances for each coin
  const coinBalances = {}; // { [coin]: FIFOBalance[] }
  
  // Track all March 1st dates in the dataset
  const marchDates = new Set();
  
  // Results
  const transactionCalculations = [];
  const baseCostsByDate = {}; // { "2024-03-01": { BTC: 26000, ETH: 5000, ... } }
  const capitalGainsByYear = {}; // { 2024: { BTC: 5000, ETH: -2000, total: 3000 }, ... }
  const capitalGainsByCoin = {}; // { BTC: { 2024: 5000, 2025: 3000 }, ... }

  // Process each transaction
  sortedTransactions.forEach((transaction, index) => {
    const date = new Date(transaction.Date);
    const type = (transaction.TransactionType || '').toUpperCase();
    const coin = transaction.Asset;
    const quantity = parseFloat(transaction.Quantity);
    const pricePerUnit = parseFloat(transaction.PricePerUnit || 0);
    const totalValue = parseFloat(transaction.TotalValue || 0);
    const fees = parseFloat(transaction.Fees || 0);
    const taxYear = getTaxYear(transaction.Date);

    // Track March 1st dates
    if (date.getMonth() === 2 && date.getDate() === 1) {
      marchDates.add(transaction.Date);
    }

    // Initialize coin balance if needed
    if (!coinBalances[coin]) {
      coinBalances[coin] = [];
    }

    // Initialize capital gains tracking
    if (!capitalGainsByYear[taxYear]) {
      capitalGainsByYear[taxYear] = { total: 0 };
    }
    if (!capitalGainsByCoin[coin]) {
      capitalGainsByCoin[coin] = {};
    }
    if (!capitalGainsByCoin[coin][taxYear]) {
      capitalGainsByCoin[coin][taxYear] = 0;
    }

    let calculation = {
      transactionIndex: index,
      transaction,
      type,
      coin,
      quantity,
      pricePerUnit,
      totalValue,
      fees,
      taxYear,
      fifoDetails: [],
      capitalGain: 0,
      proceeds: 0,
      baseCost: 0,
      balancesAfter: {}
    };

    if (type === 'BUY') {
      // Add to balance
      coinBalances[coin].push({
        amount: quantity,
        price: pricePerUnit,
        date: transaction.Date
      });
      
      calculation.fifoDetails.push({
        description: `Added ${quantity} ${coin} @ R${pricePerUnit.toLocaleString()}/coin`,
        value: totalValue
      });
      
      calculation.balancesAfter[coin] = [...coinBalances[coin]];
      
    } else if (type === 'SELL') {
      // Remove from balance using FIFO
      let remainingToSell = quantity;
      let totalBaseCost = 0;
      const soldBalances = [];

      while (remainingToSell > 0 && coinBalances[coin].length > 0) {
        const oldestBalance = coinBalances[coin][0];
        const amountToSell = Math.min(remainingToSell, oldestBalance.amount);
        
        const costForThisAmount = amountToSell * oldestBalance.price;
        totalBaseCost += costForThisAmount;
        
        soldBalances.push({
          amount: amountToSell,
          price: oldestBalance.price,
          date: oldestBalance.date,
          cost: costForThisAmount
        });

        oldestBalance.amount -= amountToSell;
        remainingToSell -= amountToSell;

        if (oldestBalance.amount <= 0.00000001) { // Handle floating point precision
          coinBalances[coin].shift();
        }
      }

      const proceeds = totalValue;
      const capitalGain = proceeds - totalBaseCost;

      calculation.proceeds = proceeds;
      calculation.baseCost = totalBaseCost;
      calculation.capitalGain = capitalGain;
      calculation.fifoDetails = soldBalances.map(b => ({
        description: `Sold ${b.amount.toFixed(8)} ${coin} from ${new Date(b.date).toLocaleDateString()} @ R${b.price.toLocaleString()}/coin`,
        value: b.cost
      }));
      calculation.fifoDetails.push({
        description: `Total Base Cost`,
        value: totalBaseCost
      });
      calculation.fifoDetails.push({
        description: `Proceeds (Sale Value)`,
        value: proceeds
      });
      calculation.fifoDetails.push({
        description: `Capital Gain/Loss`,
        value: capitalGain
      });

      // Update capital gains
      capitalGainsByYear[taxYear].total += capitalGain;
      if (!capitalGainsByYear[taxYear][coin]) {
        capitalGainsByYear[taxYear][coin] = 0;
      }
      capitalGainsByYear[taxYear][coin] += capitalGain;
      capitalGainsByCoin[coin][taxYear] += capitalGain;

      calculation.balancesAfter[coin] = [...coinBalances[coin]];

    } else if (type === 'TRADE') {
      // Trade one crypto for another
      // First, determine what we're selling and what we're buying
      // For a TRADE, we need to know both coins involved
      // Assuming the transaction has the coin being sold, and we need to infer the coin being bought
      // Or we might need to parse this from the transaction data
      
      // For now, let's assume TRADE means selling the coin to get another coin
      // We'll need the "To Asset" or similar field, but for now let's handle it as selling
      
      // Remove from balance using FIFO (selling the source coin)
      let remainingToSell = quantity;
      let totalBaseCost = 0;
      const soldBalances = [];

      while (remainingToSell > 0 && coinBalances[coin].length > 0) {
        const oldestBalance = coinBalances[coin][0];
        const amountToSell = Math.min(remainingToSell, oldestBalance.amount);
        
        const costForThisAmount = amountToSell * oldestBalance.price;
        totalBaseCost += costForThisAmount;
        
        soldBalances.push({
          amount: amountToSell,
          price: oldestBalance.price,
          date: oldestBalance.date,
          cost: costForThisAmount
        });

        oldestBalance.amount -= amountToSell;
        remainingToSell -= amountToSell;

        if (oldestBalance.amount <= 0.00000001) {
          coinBalances[coin].shift();
        }
      }

      // The proceeds from selling is the total value, which represents what we're getting
      const proceeds = totalValue;
      const capitalGain = proceeds - totalBaseCost;

      calculation.proceeds = proceeds;
      calculation.baseCost = totalBaseCost;
      calculation.capitalGain = capitalGain;
      calculation.fifoDetails = soldBalances.map(b => ({
        description: `Traded ${b.amount.toFixed(8)} ${coin} from ${new Date(b.date).toLocaleDateString()} @ R${b.price.toLocaleString()}/coin`,
        value: b.cost
      }));
      calculation.fifoDetails.push({
        description: `Total Base Cost of ${coin} sold`,
        value: totalBaseCost
      });
      calculation.fifoDetails.push({
        description: `Proceeds (Value received)`,
        value: proceeds
      });
      calculation.fifoDetails.push({
        description: `Capital Gain/Loss on ${coin}`,
        value: capitalGain
      });

      // Update capital gains
      capitalGainsByYear[taxYear].total += capitalGain;
      if (!capitalGainsByYear[taxYear][coin]) {
        capitalGainsByYear[taxYear][coin] = 0;
      }
      capitalGainsByYear[taxYear][coin] += capitalGain;
      capitalGainsByCoin[coin][taxYear] += capitalGain;

      // Note: For TRADE, we would also add the received coin to balances
      // But we need to know what coin we're receiving
      // This would require additional transaction data fields
      calculation.balancesAfter[coin] = [...coinBalances[coin]];
    }

    transactionCalculations.push(calculation);
  });

  // Calculate Base Costs for each March 1st date
  const sortedMarchDates = Array.from(marchDates).sort();
  
  sortedMarchDates.forEach(marchDate => {
    baseCostsByDate[marchDate] = {};
    
    // Calculate base cost for each coin at this date
    Object.keys(coinBalances).forEach(coin => {
      const balances = coinBalances[coin];
      let baseCost = 0;
      
      // Sum all balances that existed before or on this March 1st
      balances.forEach(balance => {
        const balanceDate = new Date(balance.date);
        const marchDateObj = new Date(marchDate);
        
        if (balanceDate <= marchDateObj) {
          baseCost += balance.amount * balance.price;
        }
      });
      
      if (baseCost > 0) {
        baseCostsByDate[marchDate][coin] = baseCost;
      }
    });
  });

  // Also calculate base costs at the end of each tax year (Feb 28/29)
  const taxYears = [...new Set(sortedTransactions.map(t => getTaxYear(t.Date)))].sort();
  
  taxYears.forEach(year => {
    const yearEndDate = new Date(year, 1, 28); // Feb 28
    const dateKey = `${year}-02-28`;
    
    if (!baseCostsByDate[dateKey]) {
      baseCostsByDate[dateKey] = {};
    }
    
    Object.keys(coinBalances).forEach(coin => {
      const balances = coinBalances[coin];
      let baseCost = 0;
      
      balances.forEach(balance => {
        const balanceDate = new Date(balance.date);
        if (balanceDate <= yearEndDate) {
          baseCost += balance.amount * balance.price;
        }
      });
      
      if (baseCost > 0) {
        baseCostsByDate[dateKey][coin] = baseCost;
      }
    });
  });

  return {
    transactionCalculations,
    baseCostsByDate,
    capitalGainsByYear,
    capitalGainsByCoin,
    finalBalances: coinBalances,
    taxYears
  };
};

