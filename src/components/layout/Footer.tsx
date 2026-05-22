import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import Typography from '../ui/Typography';

const Footer = () => {
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-[#0A0A0A] text-white pt-24 pb-12 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-md">
            <Typography variant="p" className="text-white/50 text-sm mb-8">
              {settings.contact_address || 'Jakarta, Indonesia'}
            </Typography>
            <a 
              href={`mailto:${settings.contact_email || ''}`} 
              className="text-xl md:text-2xl font-serif hover:text-accent transition-colors border-b border-white/20 pb-2"
            >
              {settings.contact_email || 'hello@yourbrand.com'}
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <Typography variant="label" className="text-white/40 block">Media Sosial</Typography>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Instagram', url: settings.social_instagram },
                { name: 'Twitter', url: settings.social_twitter },
                { name: 'Pexels', url: settings.social_pexels }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.url || "#"} 
                  className="text-[10px] uppercase tracking-[0.3em] font-medium hover:text-white text-white/40 transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-[9px] uppercase tracking-[0.3em] text-white/20">
            <p>© {new Date().getFullYear()} {settings.site_logo_text || 'BRAND'}</p>
            <a href="/admin" className="hover:text-white transition-colors">Admin Portal</a>
          </div>

          <button 
            onClick={scrollToTop}
            className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span>Kembali ke atas</span>
            <span className="group-hover:-translate-y-1 transition-transform">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
