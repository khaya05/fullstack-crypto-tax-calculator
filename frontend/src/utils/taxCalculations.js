export const getTaxYear = (date) => {
  const transactionDate = new Date(date);
  const year = transactionDate.getFullYear();
  const month = transactionDate.getMonth();
  return month >= 2 ? year + 1 : year; // March = 2 (0-indexed)
};

export const getUniqueTaxYears = (data) => {
  const years = data.map(t => getTaxYear(t.Date));
  return [...new Set(years)].sort();
};