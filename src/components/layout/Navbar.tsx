import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const Navbar = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const { settings } = useSettings();

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#1F2021] origin-left z-[60]"
        style={{ scaleX }}
      />
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 md:px-12 py-10 text-[#1F2021]">
        <Link to="/" className="hover:opacity-70 transition-opacity">
          {settings.site_logo ? (
            <img 
              src={settings.site_logo} 
              alt={settings.site_logo_text || 'Brand'} 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          ) : (
            <span className="text-2xl md:text-3xl font-serif font-medium tracking-tighter text-white">
              {settings.site_logo_text || 'BRAND'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Beranda', path: '/' },
            { name: 'Karya', path: '/works' },
            { name: 'Galeri', path: '/gallery' },
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className="text-[10px] uppercase tracking-[0.3em] font-medium hover:text-gray-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <button 
          onClick={onMenuOpen}
          className="group flex flex-col items-end gap-1.5 p-2"
        >
          <div className="w-8 h-[1px] bg-white transition-all group-hover:w-6" />
          <div className="w-5 h-[1px] bg-white transition-all group-hover:w-8" />
        </button>
      </nav>
    </>
  );
};

export default Navbar;
