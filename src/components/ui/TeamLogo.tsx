import { useState } from 'react';
import { Shield } from 'lucide-react';

interface TeamLogoProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}

export const TeamLogo = ({ src, alt, size = 16, className = '' }: TeamLogoProps) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div 
        className={`flex items-center justify-center bg-white/5 border border-white/10 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <Shield size={size * 0.7} className="text-text-muted/40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};
