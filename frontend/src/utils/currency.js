export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const getCurrencySymbol = (code = 'INR') => {
  const currency = currencies.find((c) => c.code === code);
  return currency ? currency.symbol : '₹';
};

export const formatCurrency = (amount, code = 'INR') => {
  try {
    const symbol = getCurrencySymbol(code);
    const value = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(amount);
    return `${symbol}${value}`;
  } catch (err) {
    const symbol = getCurrencySymbol(code);
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
};

export const getCurrencyParts = (amount, code = 'INR') => {
  try {
    const currencyDef = currencies.find(c => c.code === code);
    const symbol = currencyDef ? currencyDef.symbol : getCurrencySymbol(code);

    // We only need Intl.NumberFormat to format the number itself correctly with commas
    const parts = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).formatToParts(amount);

    return {
      symbol: symbol,
      value: parts.map(p => p.value).join('').trim(),
    };
  } catch (err) {
    return {
      symbol: getCurrencySymbol(code),
      value: amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
    };
  }
};
