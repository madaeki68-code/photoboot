import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Footer from '../components/layout/Footer';
import FadeIn from '../components/ui/FadeIn';
import { useSettings } from '../hooks/useSettings';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';

import PageHero from '../components/ui/PageHero';

const ServicesPage = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-white">
      <PageHero 
        title="Layanan Kami" 
        subtitle="Mewujudkan visi Anda melalui fotografi naratif dan artistik."
        image={settings.services_hero_image}
      />

      {/* Main Services */}
      <Section className="border-t border-gray-100">
        <div className="grid md:grid-cols-2 gap-10 md:gap-24">
          <div>
            <Typography variant="label" className="mb-6 md:mb-8 block">Layanan Utama</Typography>
            <Typography variant="h2" className="max-w-md text-2xl md:text-5xl">
              Spesialis dalam menangkap esensi hubungan manusia.
            </Typography>
          </div>
          <div className="space-y-12 md:space-y-20">
            {(settings.site_services || []).map((service: any, idx: number) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div className="group border-b border-gray-100 pb-8 md:pb-12 hover:border-black transition-colors">
                   <div className="flex justify-between items-start mb-4">
                    <Typography variant="label" className="text-gray-400">{service.num}</Typography>
                    <div className="md:hidden">
                      <ArrowRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                  <Typography variant="h3" className="mb-3 md:mb-4 group-hover:italic transition-all text-xl md:text-3xl">{service.title}</Typography>
                  <Typography variant="p" className="max-w-md text-sm md:text-base opacity-70">{service.desc}</Typography>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* Process Section */}
      <Section dark className="bg-black text-white">
        <Typography variant="label" className="mb-12 md:mb-20 block text-gray-500">Cara Saya Bekerja</Typography>
        <div className="grid md:grid-cols-3 gap-10 md:gap-24">
          {(settings.services_process || []).map((process: any, idx: number) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="space-y-4 md:space-y-6">
                <Typography variant="h1" className="text-4xl md:text-6xl text-gray-800">{process.step}</Typography>
                <Typography variant="h3" className="text-lg md:text-2xl">{process.title}</Typography>
                <Typography variant="p" className="text-gray-400 text-sm md:text-base">{process.desc}</Typography>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Investment/Packages */}
      <Section>
        <div className="text-center mb-12 md:mb-20">
          <Typography variant="label" className="mb-2 md:mb-4 block">Investasi</Typography>
          <Typography variant="h2" className="text-3xl md:text-5xl">Paket Fotografi</Typography>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {(settings.services_packages || []).map((pkg: any, idx: number) => (
            <FadeIn key={idx} delay={idx * 0.1} className="h-full">
              <div className="border border-gray-100 p-8 md:p-12 rounded-sm hover:border-black transition-all flex flex-col h-full">
                <Typography variant="h3" className="mb-1 md:mb-2 text-xl md:text-2xl">{pkg.name}</Typography>
                <div className="flex items-baseline gap-1 mb-6 md:mb-8">
                  <span className="text-sm text-gray-400">$</span>
                  <span className="text-3xl md:text-4xl font-medium">{pkg.price}</span>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12 flex-1">
                  {pkg.features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="text-xs md:text-sm text-gray-500 border-b border-gray-50 pb-2">{feature}</li>
                  ))}
                </ul>
                <button className="w-full py-3 md:py-4 border border-black hover:bg-black hover:text-white transition-all text-[10px] md:text-xs uppercase tracking-widest font-medium">
                  Tanya Sekarang
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
