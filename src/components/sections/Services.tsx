import React from 'react';
import FadeIn from '../ui/FadeIn';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Section } from '../ui/Section';
import Typography from '../ui/Typography';

const Services = () => {
  const { settings } = useSettings();

  const services = settings.site_services || [];

  return (
    <Section id="services" className="border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 md:mb-24 gap-4 md:gap-0">
        <div className="text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F2021] block" />
          <Typography variant="label">Layanan / ({(services.length).toString().padStart(2, '0')})</Typography>
        </div>
        <div className="flex items-center gap-4 text-[9px] md:text-xs uppercase tracking-widest text-gray-400 border border-gray-200 rounded-full px-4 md:px-6 py-1.5 md:py-2">
          Foto diterbitkan di <span className="text-[#1F2021] font-bold">VOGUE</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-12 md:gap-24">
        <div className="md:col-span-5">
          <FadeIn>
            <Typography variant="label" className="mb-8 block text-gray-400">Momen yang saya tangkap</Typography>
            <Typography variant="h2" className="mb-8 md:mb-12">
              {settings.services_title || ''}
            </Typography>
            <Typography variant="p" className="mb-8 md:mb-12 max-w-md opacity-80 text-base md:text-lg">
              {settings.services_subtitle || ''}
            </Typography>
            <a href="/services" className="inline-flex items-center gap-2 text-sm font-medium border-b border-[#1F2021] pb-1 hover:opacity-60 transition-opacity">
              Jelajahi layanan saya <ArrowRight size={16} />
            </a>
          </FadeIn>
        </div>

        <div className="md:col-span-7">
          <div className="flex flex-col">
            {services.map((srv: any, idx: number) => (
              <FadeIn key={srv.num || idx} delay={0.1 * idx} direction="up">
                <div className="group flex flex-col md:flex-row md:items-center justify-between py-6 md:py-12 border-b border-gray-100 first:border-t">
                  <div className="flex items-center gap-6 md:gap-8 mb-2 md:mb-0">
                    <Typography variant="label" className="text-gray-400 font-mono text-[9px] md:text-[10px]">
                      {srv.num || (idx + 1).toString().padStart(2, '0')}
                    </Typography>
                    <Typography variant="h3" className="group-hover:translate-x-2 transition-transform duration-500 text-lg md:text-2xl">
                      {srv.title}
                    </Typography>
                  </div>
                  <Typography variant="p" className="text-[13px] md:text-sm opacity-60 max-w-xs md:text-right">
                    {srv.desc}
                  </Typography>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Services;
