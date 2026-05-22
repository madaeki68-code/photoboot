import React from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const Navbar = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const { settings } = useSettings();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#1F2021] origin-left z-[60]"
        style={{ scaleX }}
      />
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5 md:py-7 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-black/30 backdrop-blur-sm'
      }`}>
        <Link to="/" className="hover:opacity-70 transition-opacity">
          {settings.site_logo ? (
            <img 
              src={settings.site_logo} 
              alt={settings.site_logo_text || 'Brand'} 
              className="h-8 md:h-10 w-auto object-contain" 
            />
          ) : (
            <span className={`text-xl md:text-2xl font-serif font-medium tracking-tighter transition-colors ${scrolled ? 'text-[#1F2021]' : 'text-white'}`}>
              {settings.site_logo_text || 'BRAND'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Beranda', path: '/' },
            { name: 'Karya', path: '/works' },
            { name: 'Galeri', path: '/gallery' },
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`text-[11px] uppercase tracking-[0.25em] font-semibold transition-colors ${
                scrolled ? 'text-[#1F2021] hover:text-gray-400' : 'text-white hover:text-white/60'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <button 
          onClick={onMenuOpen}
          className="group flex flex-col items-end gap-1.5 p-2"
        >
          <div className={`w-7 h-[1.5px] transition-all group-hover:w-5 ${scrolled ? 'bg-[#1F2021]' : 'bg-white'}`} />
          <div className={`w-4 h-[1.5px] transition-all group-hover:w-7 ${scrolled ? 'bg-[#1F2021]' : 'bg-white'}`} />
        </button>
      </nav>
    </>
  );
};

export default Navbar;
