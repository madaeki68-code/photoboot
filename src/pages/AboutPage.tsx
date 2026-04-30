import React from 'react';
import About from '../components/sections/About';
import Footer from '../components/layout/Footer';
import FadeIn from '../components/ui/FadeIn';
import PageHero from '../components/ui/PageHero';
import { useSettings } from '../hooks/useSettings';
import { Image as ImageIcon } from 'lucide-react';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';

const AboutPage = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-white">
      <PageHero 
        title="Tentang Kami" 
        subtitle="Mengenal lebih dalam visi dan dedikasi Vena Pictures dalam mengabadikan momen."
        image={settings.about_hero_image}
      />

      {/* Main About Section */}
      <About />

      {/* Philosophy Section */}
      <Section dark={false} className="bg-[#f9f9f9]">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <FadeIn direction="left">
            <div className="aspect-[3/4] overflow-hidden rounded-sm bg-gray-200 flex items-center justify-center">
              {settings.about_philosophy_image ? (
                <img 
                  src={settings.about_philosophy_image} 
                  alt="Philosophy" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon size={32} md:size={48} strokeWidth={1} className="text-gray-300" />
              )}
            </div>
          </FadeIn>
          <FadeIn direction="right">
            <div className="max-w-md">
              <Typography variant="label" className="mb-4 md:mb-8 block">Filosofi Saya</Typography>
              <Typography variant="h2" className="mb-4 md:mb-8">
                {settings.about_philosophy_title || ""}
              </Typography>
              <div className="space-y-4 md:space-y-6">
                {(settings.about_philosophy_desc || "").split('\n').map((para, i) => (
                  <Typography key={i} variant="p" className="text-sm md:text-lg">{para}</Typography>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Stats/Achievements */}
      <Section className="border-y border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {(settings.site_stats || []).map((stat, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="text-center">
                <Typography variant="h1" className="text-2xl md:text-4xl mb-1">{stat.value}</Typography>
                <Typography variant="label" className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest">{stat.label}</Typography>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default AboutPage;
