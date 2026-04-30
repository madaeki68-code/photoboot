import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const MenuOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { settings } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] bg-white p-6 md:p-12 overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-16">
            <Link to="/" onClick={onClose} className="text-3xl font-bold italic tracking-tighter text-[#1F2021]">
              {settings.site_logo_text || 'v'}
            </Link>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-16 w-full max-w-6xl mx-auto">
            {/* Main Navigation - Now Horizontal at the top */}
            <div className="border-b border-gray-100 pb-12">
              <ul className="flex flex-wrap gap-x-6 md:gap-x-12 gap-y-4 md:gap-y-6">
                {[
                  { name: 'Beranda', path: '/' },
                  { name: 'Tentang', path: '/about' },
                  { name: 'Layanan', path: '/services' },
                  { name: 'Galeri', path: '/gallery' },
                  { name: 'Kontak', path: '/contact' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.path}
                      onClick={onClose}
                      className="text-3xl md:text-6xl font-medium tracking-tighter hover:text-gray-400 transition-colors text-left"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-24">
              {/* Socials */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-6">Media Sosial</p>
                <ul className="flex flex-col gap-3 text-lg">
                  <li><a href={settings.social_instagram || "#"} className="hover:text-gray-400 transition-colors">Instagram</a></li>
                  <li><a href={settings.social_twitter || "#"} className="hover:text-gray-400 transition-colors">Twitter / X</a></li>
                  <li><a href={settings.social_pexels || "#"} className="hover:text-gray-400 transition-colors">Pexels</a></li>
                </ul>
              </div>

              {/* Branding / Quote */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-6">
                  {settings.site_title?.split('|')[0] || 'Vena Pictures'}
                </p>
                <p className="text-xl text-gray-500 leading-relaxed italic">
                  "{settings.about_description || 'I shoot authentic, expressive photographs that capture the essence of every moment.'}"
                </p>
              </div>

              {/* Contact */}
              <div className="pb-12">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-6">Kontak</p>
                <a href={`mailto:${settings.contact_email || 'hello@example.com'}`} className="text-2xl font-medium hover:text-gray-400 transition-colors break-words">
                  {settings.contact_email || 'hello@example.com'}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuOverlay;
