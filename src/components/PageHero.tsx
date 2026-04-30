import React from 'react';
import { motion } from 'framer-motion';

export const PageHero = ({ title, bgImage, subtitle, children }: { title: string, bgImage: string, subtitle?: string, children?: React.ReactNode }) => {
  return (
    <section className="min-h-[80vh] relative overflow-hidden bg-black text-white selection:bg-white selection:text-black pt-32 pb-24 px-6 flex flex-col justify-end">
      {bgImage && (
        <img 
          src={bgImage} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="relative z-10 max-w-[1400px] mx-auto w-full flex flex-col justify-end h-full mt-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {subtitle && (
             <p className="text-sm md:text-md uppercase tracking-widest text-gray-300 mb-6 flex items-center gap-4">
                <span className="w-8 h-px bg-white block" />
                {subtitle}
             </p>
          )}
          <h1 className="text-6xl md:text-9xl font-medium tracking-tighter mb-8 leading-none">
            {title}
          </h1>
          {children && (
            <div className="mt-12 max-w-2xl text-lg md:text-2xl text-gray-200 font-light leading-relaxed">
              {children}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
