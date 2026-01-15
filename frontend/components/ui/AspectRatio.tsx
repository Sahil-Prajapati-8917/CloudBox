
import React from 'react';

export const AspectRatio: React.FC<{ ratio?: number; children: React.ReactNode; className?: string }> = ({ 
  ratio = 1, 
  children, 
  className = '' 
}) => (
  <div 
    className={`relative w-full overflow-hidden ${className}`} 
    style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
  >
    <div className="absolute inset-0">
      {children}
    </div>
  </div>
);
