import React from 'react';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'label' | 'cap';
  italic?: boolean;
}

const Typography: React.FC<TextProps> = ({
  children,
  className = '',
  variant = 'p',
  italic = false
}) => {
  const styles = {
    h1: 'text-4xl md:text-[8vw] font-medium tracking-tighter leading-[0.8]',
    h2: 'text-3xl md:text-6xl font-medium tracking-tighter leading-tight',
    h3: 'text-xl md:text-3xl font-medium tracking-tighter',
    p: 'text-base text-gray-600 leading-relaxed',
    label: 'text-[10px] uppercase tracking-[0.3em] text-gray-400',
    cap: 'text-xs font-medium text-gray-500 uppercase tracking-widest',
  };

  const Component = (variant.startsWith('h') ? variant : (variant === 'p' ? 'p' : 'span')) as React.ElementType;

  return (
    <Component className={`${styles[variant]} ${italic ? 'italic' : ''} ${className}`}>
      {children}
    </Component>
  );
};

export default Typography;
