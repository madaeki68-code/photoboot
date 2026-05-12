import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import Typography from '../ui/Typography';

const Hero = () => {
  const { settings } = useSettings();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]);

  const images = [
    settings.hero_image,
    settings.hero_image_2,
    settings.hero_image_3
  ].filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const heroData = {
    title: settings.hero_title || 'moment',
    subtitle: settings.hero_subtitle || '',
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <AnimatePresence initial={false}>
        {images.length > 0 && (
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <motion.img 
              style={{ y }}
              src={images[currentIndex]} 
              alt="Hero" 
              className="w-full h-[120%] object-cover origin-center"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 border-[30px] md:border-[60px] border-white/5 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16">
        <div className="flex justify-between items-start pt-16 md:pt-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="text-white/40 text-[10px] uppercase tracking-[0.5em] vertical-text hidden md:block"
          >
            EST. 2024 — ARSIP
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center gap-6"
          >
            <div className="flex flex-col items-center gap-4 group cursor-pointer">
              <Typography variant="label" className="text-white/40 group-hover:text-white transition-colors">Jelajahi</Typography>
              <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
