import React from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

const About = () => {
  const { settings } = useSettings();

  const aboutData = {
    title: settings.about_title || '',
    description: settings.about_description || '',
    image: settings.about_image || '',
    image2: settings.about_image_2 || '',
    location: settings.about_location || ''
  };

  return (
    <Section id="about" className="overflow-hidden">
      <div className="grid md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-5 md:sticky md:top-32 h-fit">
          <FadeIn direction="up">
            <Typography variant="h2" className="mb-8">
              {aboutData.title || "Seni Keabadian Dalam Diam"}
            </Typography>
            <div className="w-12 h-px bg-primary/20 mb-8" />
            <Typography variant="p" className="text-lg md:text-xl mb-10 italic font-medium tracking-tighter">
              {aboutData.description}
            </Typography>
            <Link to="/gallery" className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold">
              <span>Lihat Arsip</span>
              <div className="w-8 h-px bg-primary group-hover:w-12 transition-all" />
            </Link>
          </FadeIn>
        </div>
        
        <div className="md:col-span-7">
          <FadeIn delay={0.2}>
            <div className="relative flex gap-4 items-start">
              {/* Gambar 1 — lebih tinggi */}
              <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-bg-soft">
                {aboutData.image ? (
                  <img
                    src={aboutData.image}
                    alt={aboutData.location}
                    className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} strokeWidth={1} className="text-gray-200" />
                  </div>
                )}

              </div>

              {/* Gambar 2 — sedikit turun untuk efek stagger */}
              <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-bg-soft mt-12">
                {aboutData.image2 ? (
                  <img
                    src={aboutData.image2}
                    alt="About 2"
                    className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} strokeWidth={1} className="text-gray-200" />
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </Section>
  );
};

export default About;
