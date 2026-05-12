import React from 'react';
import FadeIn from '../ui/FadeIn';
import { Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

const Services = () => {
  const { settings } = useSettings();
  const services = settings.site_services || [];

  return (
    <Section id="services" className="bg-white">
      <div className="max-w-4xl mb-16 text-center mx-auto">
        <Typography variant="label" className="mb-6 block text-accent">Bagian 03 — Keahlian</Typography>
        <Typography variant="h2" className="mb-8 italic">
          {settings.services_title || "Mengabadikan moment Pernikahan Kamu."}
        </Typography>
      </div>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory md:snap-none">
        {services.map((srv: any, idx: number) => (
          <div
            key={srv.num || idx}
            className="group flex flex-col bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-500 shrink-0 w-[72vw] md:w-auto snap-start"
          >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {srv.image ? (
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} strokeWidth={1} className="text-gray-300" />
                  </div>
                )}
                {/* Number badge */}
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-500">
                    {srv.num || (idx + 1).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 flex flex-col flex-1">
                <Typography variant="h3" className="text-base md:text-xl mb-2 leading-tight group-hover:italic transition-all duration-300">
                  {srv.title}
                </Typography>
                <Typography variant="p" className="text-xs md:text-sm text-gray-400 leading-relaxed">
                  {srv.desc}
                </Typography>
              </div>
            </div>
        ))}
      </div>

      <div className="mt-20 flex justify-center">
        <a href="#contact" className="group flex flex-col items-center gap-4">
          <Typography variant="label" className="group-hover:text-accent transition-colors">Mulai sebuah proyek</Typography>
          <div className="w-px h-20 bg-gradient-to-b from-primary/20 to-transparent group-hover:from-accent transition-all" />
        </a>
      </div>
    </Section>
  );
};

export default Services;
