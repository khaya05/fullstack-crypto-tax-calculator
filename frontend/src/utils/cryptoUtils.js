const STABLECOINS = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'PAX'];

export const isStablecoin = (coin) => STABLECOINS.includes(coin?.toUpperCase());