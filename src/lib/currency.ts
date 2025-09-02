// Currency utility functions and configurations
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after'; // Symbol position relative to amount
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', position: 'before' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
];

export const DEFAULT_CURRENCY = 'NPR';

export function getCurrencyConfig(currencyCode: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode);
  const formattedAmount = amount.toFixed(2);
  
  if (config.position === 'before') {
    return `${config.symbol} ${formattedAmount}`;
  } else {
    return `${formattedAmount} ${config.symbol}`;
  }
}

export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode);
  return config.symbol;
}

export function getCurrencyName(currencyCode: string = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currencyCode);
  return config.name;
}
