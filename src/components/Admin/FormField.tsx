import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, className = '', subtitle }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</label>
        {subtitle && <span className="text-[10px] text-gray-300 italic">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
};

export default FormField;
