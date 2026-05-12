import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
  noPadding?: boolean;
}

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-[1400px] mx-auto px-4 md:px-6 w-full ${className}`}>
    {children}
  </div>
);

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  id,
  dark = false,
  noPadding = false
}) => {
  return (
    <section
      id={id}
      className={`
        ${noPadding ? '' : 'py-16 md:py-40'} 
        ${dark ? 'bg-[#1F2021] text-white' : 'bg-white text-black'} 
        ${className}
      `}
    >
      <Container>
        {children}
      </Container>
    </section>
  );
};
