
import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label 
      className={`text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} 
      {...props}
    >
      {children}
    </label>
  );
};
