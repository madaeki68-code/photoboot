import React, { useState } from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

const Testimonials = () => {
  const { settings } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = settings.site_testimonials || [];

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (testimonials.length === 0) return null;
  const current = testimonials[activeIndex];

  return (
    <Section id="testimonials" className="border-t border-gray-100">
      <div className="text-sm flex items-center gap-2 text-gray-400 mb-12 md:mb-24">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 block" />
        <Typography variant="label">Testimoni / ({(testimonials.length).toString().padStart(2, '0')})</Typography>
      </div>

      <div className="grid md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-8 min-h-[300px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h2" className="text-2xl md:text-4xl lg:text-6xl italic">
                "{current.quote}"
              </Typography>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:col-span-4 flex flex-col justify-end">
          <FadeIn delay={0.2} className="flex flex-col gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              {current.image ? (
                <img 
                  src={current.image} 
                  alt={current.name} 
                  className="w-16 h-16 md:w-24 md:h-24 object-cover grayscale rounded-sm"
                />
              ) : (
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-sm flex items-center justify-center text-gray-300">
                  <span className="text-[8px] md:text-[10px] uppercase font-bold">No Pic</span>
                </div>
              )}
              <div>
                <Typography variant="h3" className="mb-1">{current.name}</Typography>
                <Typography variant="p" className="text-sm opacity-60">
                  Pemotretan di <span className="text-[#1F2021] opacity-100">{current.location}</span>
                </Typography>
              </div>
            </div>
            
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={prev}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#1F2021] hover:text-white transition-all duration-500"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={next}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#1F2021] hover:text-white transition-all duration-500"
              >
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
};

export default Testimonials;
