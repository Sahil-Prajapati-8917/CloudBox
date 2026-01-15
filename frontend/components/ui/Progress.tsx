
import React from 'react';

export const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
    <div
      className="h-full w-full flex-1 bg-slate-900 transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);
