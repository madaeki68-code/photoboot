import React from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

const About = () => {
  const { settings } = useSettings();

  const aboutData = {
    title: settings.about_title || '',
    description: settings.about_description || '',
    image: settings.about_image || '',
    location: settings.about_location || ''
  };

  return (
    <Section id="about">
      <div className="text-sm mb-10 md:mb-16 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1F2021] block" />
        <Typography variant="label">Tentang / (01)</Typography>
      </div>
      
      <div className="grid md:grid-cols-12 gap-12 md:gap-24 items-start">
        <div className="md:col-span-7">
          <FadeIn>
            <Typography variant="h2" className="mb-8 md:mb-12 leading-[1.2]">
              {aboutData.title}
            </Typography>
            <Typography variant="p" className="text-lg md:text-2xl mb-8 md:mb-12 max-w-2xl opacity-80">
              {aboutData.description}
            </Typography>
            <a href="/about" className="inline-flex items-center gap-2 text-sm font-medium border-b border-[#1F2021] pb-1 hover:opacity-60 transition-opacity">
              Baca selengkapnya <ArrowRight size={16} />
            </a>
          </FadeIn>
        </div>
        
        <div className="md:col-span-5">
          <FadeIn delay={0.2}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-8 bg-gray-50 flex items-center justify-center">
              {aboutData.image ? (
                <img 
                  src={aboutData.image} 
                  alt={aboutData.location} 
                  className="w-full h-full object-cover transition-all duration-1000"
                />
              ) : (
                <ImageIcon size={48} strokeWidth={1} className="text-gray-200" />
              )}
              <div className="absolute bottom-6 left-6 text-white">
                <Typography variant="label" className="text-white/60 mb-1 block">Dipotret di</Typography>
                <Typography variant="h3" className="text-white">{aboutData.location}</Typography>
              </div>
            </div>
            <a href="/gallery" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
              Lihat galeri <ArrowRight size={16} />
            </a>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
};

export default About;
