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

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, image, height = "h-screen" }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);

  return (
    <section className={`relative ${height} w-full overflow-hidden bg-black flex items-center justify-center`}>
      {image ? (
        <motion.img 
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-[120%] object-cover origin-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
           <ImageIcon size={48} strokeWidth={1} className="text-white/10" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce">
        <Typography variant="label" className="opacity-50 text-[#1F2021]">Scroll untuk menjelajah</Typography>
        <div className="w-px h-12 bg-[#1F2021]/20" />
      </div>
    </section>
  );
};

export default PageHero;
