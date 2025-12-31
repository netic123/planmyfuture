import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  children?: ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
        </span>
      )}
    </span>
  );
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
}

export function LabelWithTooltip({ label, tooltip, required }: LabelWithTooltipProps) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
      {label}{required && ' *'}
      <Tooltip text={tooltip} />
    </label>
  );
}

