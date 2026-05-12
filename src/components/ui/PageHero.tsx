import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from './FadeIn';
import Typography from './Typography';
import { Image as ImageIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  height?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, image, height = "h-[80vh]" }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <section className={`relative ${height} w-full overflow-hidden bg-[#0A0A0A] flex items-center`}>
      <div className="absolute inset-0">
        {image ? (
          <motion.img 
            style={{ y }}
            src={image} 
            alt={title} 
            className="w-full h-[120%] object-cover origin-center brightness-[0.7] grayscale hover:grayscale-0 transition-all duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <ImageIcon size={64} strokeWidth={1} className="text-white/10" />
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 border-[30px] md:border-[60px] border-white/5 pointer-events-none" />

      <div className="relative z-10 w-full px-8 md:px-16 mt-20">
        <div className="max-w-4xl">
          <FadeIn direction="up">
            <Typography variant="label" className="text-accent mb-6 block tracking-[0.5em]">Section — {(title || '').split(' ')[0]}</Typography>
            <Typography variant="h1" className="text-white mb-8 italic">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="p" className="text-white/60 text-lg md:text-2xl font-medium tracking-tighter italic max-w-2xl">
                {subtitle}
              </Typography>
            )}
          </FadeIn>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 flex flex-col items-center gap-4">
        <div className="w-px h-24 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default PageHero;
