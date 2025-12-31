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
    // Show raw number when focused for easier editing, empty if 0
    setDisplayValue(value > 0 ? value.toString() : '');
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
    let raw = e.target.value;
    
    // Allow only numbers, spaces, and comma/dot
    let cleaned = raw.replace(/[^\d\s.,]/g, '');
    
    // Remove leading zeros (but keep single "0" or "0.")
    cleaned = cleaned.replace(/^0+(?=\d)/, '');
    
    setDisplayValue(cleaned);
    
    // Update the actual value in real-time
    const parsed = parseFormattedNumber(cleaned);
    onChange(parsed);
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
        className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all ${
          suffix ? 'pr-12' : ''
        } ${className}`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

