import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Plus, ArrowRight } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../lib/supabase';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';
import Footer from '../components/layout/Footer';

const PackagesPage = () => {
  const { settings } = useSettings();
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, addonRes] = await Promise.all([
          supabase.from('packages').select('*').order('created_at', { ascending: true }),
          supabase.from('addons').select('*').order('created_at', { ascending: true })
        ]);
        
        if (pkgRes.data) setPackages(pkgRes.data);
        if (addonRes.data) setAddons(addonRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#1F2021] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 pb-10 px-4 md:pt-40 md:pb-20 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <Typography variant="label" className="mb-6 block text-gray-400 uppercase tracking-[0.3em]">
            {settings.site_title || 'Kallo Photobooth'}
          </Typography>
          <Typography variant="h2" className="mb-4 mx-auto max-w-3xl">
            {settings.packages_title || 'Pilih Paket yang Sesuai Momenmu.'}
          </Typography>
          <Typography variant="p" className="mx-auto max-w-2xl text-gray-500">
            {settings.packages_subtitle || 'Berbagai pilihan paket untuk setiap jenis acara Anda.'}
          </Typography>
        </motion.div>
      </div>

      {/* Packages */}
      <Section id="packages" className="bg-gray-50">
        {packages.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Typography variant="p">Paket belum tersedia. Silakan cek kembali nanti.</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-4 md:px-0 max-w-sm sm:max-w-none mx-auto">
            {packages.map((pkg: any, idx: number) => {
              const isPopular = pkg.popular === true || pkg.popular === 'true';
              const isSelected = selectedPkg === (pkg.name || idx.toString());
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPkg(pkg.name || idx.toString())}
                  className={`relative rounded-xl md:rounded-2xl border-2 p-3 md:p-8 cursor-pointer transition-all duration-300 text-center flex flex-col items-center ${
                    isSelected
                      ? 'border-[#1F2021] bg-[#1F2021] text-white shadow-xl scale-[1.02]'
                      : isPopular
                      ? 'border-[#1F2021] bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  {isPopular && !isSelected && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#1F2021] text-white text-[8px] md:text-[10px] uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                      Terpopuler
                    </span>
                  )}
                  <div className="mb-3 md:mb-6 w-full text-center flex flex-col items-center">
                    {pkg.cover_image && (
                      <div className="w-full mb-3 md:mb-6 rounded-lg md:rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '1920/1350' }}>
                        <img 
                          src={pkg.cover_image} 
                          alt={pkg.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {pkg.category && (
                      <span className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded mb-2 md:mb-3 inline-block ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {pkg.category}
                      </span>
                    )}
                    <Typography
                      variant="h3"
                      className={`mb-1 md:mb-2 text-sm md:text-base ${isSelected ? 'text-white' : ''}`}
                    >
                      {pkg.name || `Paket ${idx + 1}`}
                    </Typography>
                    <div className={`text-base md:text-3xl font-bold tracking-tighter ${isSelected ? 'text-white' : 'text-[#1F2021]'}`}>
                      {pkg.price || 'Hubungi Kami'}
                    </div>
                    {pkg.duration && (
                      <Typography
                        variant="label"
                        className={`mt-0.5 md:mt-1 block text-[10px] md:text-xs ${isSelected ? 'text-white/60' : 'text-gray-400'}`}
                      >
                        {pkg.duration}
                      </Typography>
                    )}
                  </div>

                  {pkg.description && (
                    <Typography
                      variant="p"
                      className={`text-xs md:text-sm mb-3 md:mb-6 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}
                    >
                      {pkg.description}
                    </Typography>
                  )}

                  <ul className="space-y-1.5 md:space-y-3 mb-4 md:mb-8 w-full text-left">
                    {(pkg.features || []).map((feature: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-start gap-1.5 md:gap-3">
                        <Check 
                          size={12}
                          className={`shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-[#1F2021]'}`} 
                        />
                        <span className={`text-[11px] md:text-sm leading-tight ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/booking?package=${encodeURIComponent(pkg.name || '')}`}
                    className={`flex items-center justify-center gap-1.5 md:gap-2 w-full py-2 md:py-3 rounded-full text-[11px] md:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-[#1F2021] hover:bg-gray-100'
                        : 'bg-[#1F2021] text-white hover:bg-gray-800'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Pesan Sekarang <ArrowRight size={12} className="md:w-4 md:h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Addons */}
      {addons.length > 0 && (
        <Section id="addons" className="bg-white">
          <div className="mb-12 text-center">
            <Typography variant="label" className="mb-4 block">Tambahan</Typography>
            <Typography variant="h2" className="italic">Addons & Extras</Typography>
            <Typography variant="p" className="mt-4 max-w-lg mx-auto text-gray-500">
              Lengkapi paketmu dengan pilihan tambahan berikut.
            </Typography>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-4 p-6 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">{addon.name || `Addon ${idx + 1}`}</p>
                  {addon.price && (
                    <p className="text-xs text-gray-400 mb-1">{addon.price}</p>
                  )}
                  {(addon.desc || addon.description) && (
                    <p className="text-xs text-gray-500 leading-relaxed">{addon.desc || addon.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section className="bg-[#1F2021] text-white">
        <div className="text-center max-w-2xl mx-auto">
          <Typography variant="h2" className="text-white italic mb-6">
            Siap Mengabadikan Momenmu?
          </Typography>
          <Typography variant="p" className="text-white/60 mb-10">
            Hubungi kami atau langsung isi form booking untuk memulai.
          </Typography>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 bg-white text-[#1F2021] px-8 py-4 rounded-full text-sm font-medium hover:bg-gray-100 transition-all"
          >
            Booking Sekarang <ArrowRight size={16} />
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default PackagesPage;
