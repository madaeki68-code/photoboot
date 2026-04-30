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
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {images.length > 0 && (
          <motion.img 
            key={currentIndex}
            style={{ y }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            src={images[currentIndex]} 
            alt="Hero" 
            className="absolute inset-0 w-full h-[120%] object-cover origin-top"
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
      
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row justify-between items-end text-[#1F2021]"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Teks Hero dihapus sesuai permintaan */}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-end gap-4"
        >
          <div className="hidden md:flex gap-16 text-[10px] uppercase tracking-[0.2em] opacity-50 mb-8">
            <div className="text-right">
              <p className="mb-1">6720 × 4480</p>
              <p>Dual Pixel Raw</p>
            </div>
            <div className="text-right">
              <p className="mb-1">36 x 24 mm</p>
              <p>Canon EOS</p>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-bounce">
            <Typography variant="label" className="opacity-50">Scroll untuk menjelajah</Typography>
            <div className="w-px h-12 bg-[#1F2021]/20" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
