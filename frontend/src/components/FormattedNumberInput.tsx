import { useState, useEffect } from 'react';
import { formatLargeNumber, parseFormattedNumber } from '../utils/formatters';

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  id?: string;
}

export default function FormattedNumberInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  min,
  max,
  suffix = '',
  disabled = false,
  id,
}: FormattedNumberInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when external value changes (and not focused)
  useEffect(() => {
    if (!isFocused) {
      // Only show formatted value if it's a meaningful number (> 0)
      setDisplayValue(value > 0 ? formatLargeNumber(value) : '');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFormattedNumber(displayValue);
    
    // Apply min/max constraints
    let finalValue = parsed;
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    
    onChange(finalValue);
    // Show formatted value only if > 0, otherwise keep empty
    setDisplayValue(finalValue > 0 ? formatLargeNumber(finalValue) : '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Remove all non-digit characters to get the pure number
    const digitsOnly = raw.replace(/\D/g, '');
    
    // Remove leading zeros
    const cleanedDigits = digitsOnly.replace(/^0+(?=\d)/, '');
    
    // Parse to number
    const numericValue = parseInt(cleanedDigits, 10) || 0;
    
    // Format with thousand separators (Swedish style with spaces)
    const formatted = numericValue > 0 
      ? numericValue.toLocaleString('sv-SE') 
      : '';
    
    setDisplayValue(formatted);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        id={id}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-black border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all ${
          suffix ? 'pr-16' : ''
        } ${className}`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

