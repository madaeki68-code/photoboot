import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { Login } from './components/Admin/Login';
import { Dashboard } from './components/Admin/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import MenuOverlay from './components/layout/MenuOverlay';
import WhatsAppWidget from './components/ui/WhatsAppWidget';
import ProjectDetail from './components/sections/ProjectDetail';
import Home from './pages/Home';
import GalleryPage from './pages/GalleryPage';
import WorksPage from './pages/WorksPage';
import { Project } from './types';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  }, [settings.site_title]);

  useEffect(() => {
    window.scrollTo(0,0);
  }, [location.pathname]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Force scroll to top on mount
    lenis.scrollTo(0, { immediate: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  if (location.pathname === '/admin') {
    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-[#1F2021] rounded-full animate-spin" /></div>;
    if (!user) return <Login />;
    if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-center px-6"><div><h1 className="text-2xl font-medium mb-4">Akses Ditolak</h1><p className="text-gray-500">Anda tidak memiliki izin untuk mengakses dasbor admin.</p></div></div>;
    return (
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1F2021] selection:bg-[#1F2021] selection:text-white">
      <Navbar onMenuOpen={() => setIsMenuOpen(true)} />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <WhatsAppWidget />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
