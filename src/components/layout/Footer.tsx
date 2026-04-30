import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const Footer = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandName = settings.site_title?.split('|')[0]?.trim() || 'Vena Pictures';

  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white pt-12 md:pt-40 pb-8 px-4 md:px-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-4xl mb-12 md:mb-40">
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs flex items-center gap-2 text-gray-500 mb-6 md:mb-12">
                <span className="w-1 h-1 rounded-full bg-gray-500 block" />
                Hubungi kami / (06)
              </div>
              
              <h2 className="text-2xl md:text-7xl font-medium leading-[0.9] mb-6 md:mb-12 tracking-tighter text-gray-100">
                Mari kita tangkap kisah Anda bersama.
              </h2>
              
              <a href={`mailto:${settings.contact_email || ''}`} className="group inline-flex items-center gap-2 md:gap-4 bg-white text-[#1F2021] px-6 md:px-10 py-3 md:py-6 rounded-full text-[10px] md:text-sm font-medium hover:bg-gray-200 transition-all hover:scale-105 mb-10 md:mb-16">
                Mulai proyek
                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#1F2021]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              </a>
            </div>
            
            <div className="pt-8 md:pt-12 border-t border-white/10">
              <p className="text-[9px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-6">Hubungi kami di</p>
              <a href={`mailto:${settings.contact_email || ''}`} className="text-xl md:text-6xl font-medium block mb-6 md:mb-12 hover:text-gray-400 transition-opacity tracking-tighter leading-none">
                {settings.contact_email || ''}
              </a>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-8">
                <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed max-w-[200px] md:max-w-[240px]">
                {settings.contact_address || ''}
                </p>
                <div className="flex gap-4 md:gap-8 text-[9px] md:text-xs uppercase tracking-widest font-medium text-gray-400">
                  <a href={settings.social_instagram || "#"} className="hover:text-white transition-colors">Instagram</a>
                  <a href={settings.social_twitter || "#"} className="hover:text-white transition-colors">Twitter</a>
                  <a href={settings.social_pexels || "#"} className="hover:text-white transition-colors">Pexels</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative pt-8 md:pt-12 border-t border-white/5">
          <div className="text-center overflow-hidden">
            <h1 className="text-[10vw] md:text-[8vw] leading-[0.7] font-medium tracking-tighter text-white/5 select-none pointer-events-none uppercase">
              {settings.site_footer_text || 'vena'}
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-12 gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gray-700 text-center md:text-left">
              <p>© {new Date().getFullYear()} {brandName}</p>
              <a href="/admin" className="hover:text-white transition-colors">Admin Portal</a>
            </div>
            
            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors"
            >
              Back to top
              <div className="w-5 h-5 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                <span className="text-xs md:text-lg leading-none">↑</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
