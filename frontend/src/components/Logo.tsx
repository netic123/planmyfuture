interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <svg 
      viewBox="0 0 512 512" 
      className={`${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle - dark */}
      <circle cx="256" cy="256" r="240" fill="#171717"/>
      
      {/* Inner ring */}
      <circle cx="256" cy="256" r="200" fill="none" stroke="#404040" strokeWidth="2"/>
      
      {/* Crystal ball / lens shape */}
      <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" strokeWidth="8"/>
      
      {/* Horizon line */}
      <line x1="140" y1="256" x2="372" y2="256" stroke="#ffffff" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Rising line - representing growth */}
      <path 
        d="M180 300 L256 200 L332 240" 
        stroke="#ffffff" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Arrow tip */}
      <path 
        d="M320 252 L332 240 L344 252" 
        stroke="#ffffff" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Current position dot */}
      <circle cx="180" cy="300" r="8" fill="#ffffff"/>
    </svg>
  );
}
