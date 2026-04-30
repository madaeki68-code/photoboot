import React from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight } from 'lucide-react';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';
import { useSettings } from '../../hooks/useSettings';

const Showcase = () => {
  const { settings } = useSettings();
  const images = (settings.site_showcase || []).filter(Boolean);

  if (images.length === 0) return null;

  return (
    <Section id="showcase" className="border-t border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-6 md:gap-0">
        <div className="text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F2021] block" />
          <Typography variant="label">Showcase / (05)</Typography>
        </div>
        <div className="md:text-right">
          <Typography variant="label" className="text-gray-400 mb-2 md:mb-4 block text-[9px] md:text-[10px]">Most viewed Pexels album</Typography>
          <a href="#" className="inline-flex items-center gap-2 bg-[#1F2021] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105">
            View the album <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <FadeIn key={idx} delay={idx * 0.1} direction="up">
            <div className="aspect-[3/4] overflow-hidden rounded-sm group">
              <img 
                src={img} 
                alt={`Showcase ${idx + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
              />
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
};

export default Showcase;
