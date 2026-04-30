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
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-8 text-[#1F2021] mix-blend-difference">
        <Link to="/" className="text-xl md:text-2xl font-bold italic tracking-tighter text-white">
          {settings.site_logo_text || 'v'}
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Beranda', path: '/' },
            { name: 'Tentang', path: '/about' },
            { name: 'Layanan', path: '/services' },
            { name: 'Galeri', path: '/gallery' },
            { name: 'Kontak', path: '/contact' }
          ].map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className="text-xs uppercase tracking-widest text-white hover:opacity-50 transition-opacity"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <button 
          onClick={onMenuOpen}
          className="flex items-center gap-2 text-sm uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
        >
          <span className="md:hidden text-sm uppercase">menu</span>
          <span className="text-xl font-light tracking-[-0.2em] ml-1">::</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
