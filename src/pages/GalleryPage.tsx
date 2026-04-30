import React from 'react';
import Gallery from '../components/sections/Gallery';
import Showcase from '../components/sections/Showcase';
import Footer from '../components/layout/Footer';
import FadeIn from '../components/ui/FadeIn';
import { Project } from '../types';
import { useSettings } from '../hooks/useSettings';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';
import { Image as ImageIcon } from 'lucide-react';

import PageHero from '../components/ui/PageHero';

const GalleryPage = ({ onSelectProject }: { onSelectProject: (p: Project) => void }) => {
  const { settings } = useSettings();

  return (
    <div className="bg-white">
      <PageHero 
        title="Galeri Karya" 
        subtitle="Kumpulan momen yang ditangkap dengan dedikasi dan cinta."
        image={settings.gallery_hero_image}
      />

      {/* Featured Spotlight */}
      <Section className="py-10 md:py-20">
        <FadeIn>
          <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-sm relative group bg-gray-100">
            {settings.gallery_featured_image ? (
              <img 
                src={settings.gallery_featured_image} 
                alt="Featured Campaign" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={48} md:size={64} strokeWidth={1} className="text-gray-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 md:p-12 text-white">
              <Typography variant="label" className="text-white/60 mb-2 md:mb-4 block text-[9px] md:text-[10px]">Kampanye Unggulan</Typography>
              <Typography variant="h2" className="text-white text-2xl md:text-5xl">
                {settings.gallery_featured_title || ""}
              </Typography>
              <Typography variant="p" className="text-white/80 max-w-sm mt-2 md:mt-4 text-xs md:text-base">
                {settings.gallery_featured_subtitle || ""}
              </Typography>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Main Gallery Grid */}
      <Gallery onSelectProject={onSelectProject} />

      {/* Cinematic Showcase */}
      <Showcase />

      <Footer />
    </div>
  );
};

export default GalleryPage;
