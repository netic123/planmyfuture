export function formatCurrency(amount: number, decimals: number = 0): string {
  // Format with Swedish locale and replace non-breaking space with regular space
  const formatted = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  
  // Replace non-breaking spaces with regular spaces for better display
  return formatted.replace(/\u00A0/g, ' ');
}

// Format large numbers with spaces for readability (e.g., 3 750 000)
export function formatLargeNumber(amount: number): string {
  return amount.toLocaleString('sv-SE').replace(/\u00A0/g, ' ');
}

// Parse a formatted number string back to a number
export function parseFormattedNumber(str: string): number {
  // Remove spaces and replace comma with dot for parsing
  const cleaned = str.replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatNumber(amount: number, decimals: number = 0): string {
  const formatted = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  
  return formatted.replace(/\u00A0/g, ' ');
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}



