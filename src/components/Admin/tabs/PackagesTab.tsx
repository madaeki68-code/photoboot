import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Package as PackageIcon, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useSettings } from '../../../hooks/useSettings';
import DashboardSection from '../DashboardSection';
import ImageUpload from '../ImageUpload';

const formatRupiah = (val: string) => {
  const numeric = val.replace(/\D/g, '');
  if (!numeric) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(numeric));
};

const emptyPackage = {
  name: '',
  price: '',
  duration: '',
  description: '',
  features: [],
  popular: false,
  category: '',
  cover_image: ''
};

const emptyAddon = {
  name: '',
  price: '',
  description: ''
};

const emptyPromo = {
  code: '',
  discount: '',
  desc: '',
  active: true
};

const PackagesTab: React.FC = () => {
  const { settings, updateSetting, refresh } = useSettings();

  const [adminPackages, setAdminPackages] = useState<any[]>([]);
  const [adminAddons, setAdminAddons] = useState<any[]>([]);
  const [adminPromos, setAdminPromos] = useState<any[]>([]);
  
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const [packagesPageData, setPackagesPageData] = useState({
    packages_title: '',
    packages_subtitle: '',
  });
  const [bookingPageData, setBookingPageData] = useState({
    booking_title: '',
    booking_subtitle: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackagesAndAddons();
  }, []);

  useEffect(() => {
    if (settings) {
      setAdminPromos(settings.booking_promos || []);
      setPackagesPageData({
        packages_title: settings.packages_title || '',
        packages_subtitle: settings.packages_subtitle || '',
      });
      setBookingPageData({
        booking_title: settings.booking_title || '',
        booking_subtitle: settings.booking_subtitle || '',
      });
    }
  }, [settings]);

  const fetchPackagesAndAddons = async () => {
    try {
      const [pkgRes, addonRes] = await Promise.all([
        supabase.from('packages').select('*').order('created_at', { ascending: true }),
        supabase.from('addons').select('*').order('created_at', { ascending: true })
      ]);
      if (pkgRes.data) setAdminPackages(pkgRes.data);
      if (addonRes.data) setAdminAddons(addonRes.data);
    } catch (error) {
      console.error('Error fetching packages/addons:', error);
    }
  };

  const handleSavePageSettings = async () => {
    setIsSaving(true);
    try {
      await updateSetting('packages_title', packagesPageData.packages_title);
      await updateSetting('packages_subtitle', packagesPageData.packages_subtitle);
      await updateSetting('booking_title', bookingPageData.booking_title);
      await updateSetting('booking_subtitle', bookingPageData.booking_subtitle);
      
      alert('Pengaturan halaman berhasil disimpan!');
      refresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Packages (Modal Edit) ──
  const openPackageModal = (pkg?: any) => {
    if (pkg) {
      setEditingPackage({ ...pkg });
    } else {
      setEditingPackage({ ...emptyPackage });
    }
    setIsPackageModalOpen(true);
  };

  const closePackageModal = () => {
    setEditingPackage(null);
    setIsPackageModalOpen(false);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    const payload = {
      name: editingPackage.name,
      price: editingPackage.price,
      duration: editingPackage.duration,
      description: editingPackage.description,
      features: editingPackage.features,
      popular: editingPackage.popular,
      category: editingPackage.category,
      cover_image: editingPackage.cover_image
    };

    try {
      if (editingPackage.id) {
        await supabase.from('packages').update(payload).eq('id', editingPackage.id);
      } else {
        await supabase.from('packages').insert([payload]);
      }
      closePackageModal();
      fetchPackagesAndAddons();
    } catch (err) {
      console.error('Error saving package:', err);
      alert('Gagal menyimpan paket.');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Hapus paket ini?')) return;
    try {
      await supabase.from('packages').delete().eq('id', id);
      fetchPackagesAndAddons();
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  // ── Addons (Modal Edit) ──
  const openAddonModal = (addon?: any) => {
    if (addon) setEditingAddon({ ...addon });
    else setEditingAddon({ ...emptyAddon });
    setIsAddonModalOpen(true);
  };

  const closeAddonModal = () => {
    setEditingAddon(null);
    setIsAddonModalOpen(false);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon.name || editingAddon.name.trim() === '') {
      alert('Nama Addon tidak boleh kosong!');
      return;
    }
    const payload = {
      name: editingAddon.name.trim(),
      price: editingAddon.price,
      description: editingAddon.description || editingAddon.desc
    };
    try {
      if (editingAddon.id) {
        await supabase.from('addons').update(payload).eq('id', editingAddon.id);
      } else {
        await supabase.from('addons').insert([payload]);
      }
      closeAddonModal();
      fetchPackagesAndAddons();
    } catch (err) {
      console.error('Error saving addon:', err);
      alert('Gagal menyimpan addon.');
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!window.confirm('Hapus addon ini?')) return;
    try {
      await supabase.from('addons').delete().eq('id', id);
      fetchPackagesAndAddons();
    } catch (err) {
      console.error('Error deleting addon:', err);
    }
  };

  // ── Promos (Modal Edit) ──
  const openPromoModal = (promo?: any, idx?: number) => {
    if (promo) setEditingPromo({ ...promo, _idx: idx });
    else setEditingPromo({ ...emptyPromo });
    setIsPromoModalOpen(true);
  };

  const closePromoModal = () => {
    setEditingPromo(null);
    setIsPromoModalOpen(false);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    try {
      const next = [...adminPromos];
      const { _idx, ...promoData } = editingPromo;
      if (_idx !== undefined) {
        next[_idx] = promoData;
      } else {
        next.push(promoData);
      }
      setAdminPromos(next);
      await updateSetting('booking_promos', next);
      closePromoModal();
      refresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan promo.');
    }
  };

  const handleDeletePromo = async (idx: number) => {
    if (!window.confirm('Hapus promo ini?')) return;
    try {
      const next = adminPromos.filter((_, i) => i !== idx);
      setAdminPromos(next);
      await updateSetting('booking_promos', next);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      {/* ── Teks Halaman Paket ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
          <div className="p-2 bg-gray-50 rounded-lg">
            <PackageIcon className="text-[#1F2021]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1F2021]">Pengaturan Halaman</h2>
            <p className="text-sm text-gray-500">Sesuaikan judul dan deskripsi halaman publik</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/packages`);
                alert('Link Paket disalin!');
              }}
              className="flex items-center gap-2 bg-gray-50 text-[#1F2021] px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-gray-100 transition-all border border-gray-100"
            >
              Copy Link Paket
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/booking`);
                alert('Link Booking disalin!');
              }}
              className="flex items-center gap-2 bg-gray-50 text-[#1F2021] px-4 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-gray-100 transition-all border border-gray-100"
            >
              Copy Link Booking
            </button>
            <button
              onClick={handleSavePageSettings}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Menyimpan...' : 'Simpan Teks'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Halaman Paket</h3>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Judul Halaman</label>
              <input
                type="text"
                value={packagesPageData.packages_title}
                onChange={(e) => setPackagesPageData({ ...packagesPageData, packages_title: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                placeholder="cth. Pilih Paket yang Sesuai Momenmu."
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Subjudul</label>
              <textarea
                rows={2}
                value={packagesPageData.packages_subtitle}
                onChange={(e) => setPackagesPageData({ ...packagesPageData, packages_subtitle: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                placeholder="Deskripsi singkat..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Halaman Booking</h3>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Judul Halaman</label>
              <input
                type="text"
                value={bookingPageData.booking_title}
                onChange={(e) => setBookingPageData({ ...bookingPageData, booking_title: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                placeholder="cth. Pesan Photobooth Sekarang."
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Subjudul</label>
              <textarea
                rows={2}
                value={bookingPageData.booking_subtitle}
                onChange={(e) => setBookingPageData({ ...bookingPageData, booking_subtitle: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                placeholder="Deskripsi singkat..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Daftar Paket ── */}
      <DashboardSection
        title="Daftar Paket"
        description="Paket yang tampil di halaman /packages."
        onAdd={() => openPackageModal()}
        addLabel="Tambah Paket"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPackages.map((pkg: any) => (
            <motion.div
              layout
              key={pkg.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 group overflow-hidden relative"
            >
              <div className="h-32 bg-gray-50 relative">
                {pkg.cover_image ? (
                  <img src={pkg.cover_image} alt={pkg.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <PackageIcon size={32} />
                  </div>
                )}
                {pkg.popular && (
                  <span className="absolute top-3 left-3 bg-[#1F2021] text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded">
                    Populer
                  </span>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openPackageModal(pkg)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md hover:bg-white transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                {pkg.category && <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">{pkg.category}</span>}
                <h3 className="font-bold text-lg text-[#1F2021] truncate">{pkg.name}</h3>
                <div className="text-gray-500 font-medium text-sm mt-1">{pkg.price || 'Rp -'}</div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{pkg.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </DashboardSection>

      {/* ── Modal Edit Paket ── */}
      <AnimatePresence>
        {isPackageModalOpen && editingPackage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePackageModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold tracking-tight text-[#1F2021]">
                  {editingPackage.id ? 'Edit Paket' : 'Tambah Paket Baru'}
                </h2>
                <button onClick={closePackageModal} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Nama Paket</label>
                    <input
                      required
                      type="text"
                      value={editingPackage.name}
                      onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      placeholder="cth. Gold Package"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Kategori</label>
                    <input
                      type="text"
                      value={editingPackage.category || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      placeholder="cth. Wedding, Corporate"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Harga</label>
                    <input
                      required
                      type="text"
                      value={editingPackage.price}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: formatRupiah(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      placeholder="Rp 0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Durasi</label>
                    <input
                      type="text"
                      value={editingPackage.duration || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      placeholder="cth. 3 Jam"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={editingPackage.description || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                    placeholder="Deskripsi paket..."
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Fitur (Satu baris = satu fitur)</label>
                  <textarea
                    rows={5}
                    value={(editingPackage.features || []).join('\n')}
                    onChange={(e) => setEditingPackage({ ...editingPackage, features: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-mono"
                    placeholder="Cetak sepuasnya&#10;Backdrop custom&#10;2 Operator"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Cover Image</label>
                  <ImageUpload
                    label="Upload Cover Paket"
                    value={editingPackage.cover_image}
                    onChange={(url) => setEditingPackage({ ...editingPackage, cover_image: url })}
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="popular-checkbox"
                    checked={!!editingPackage.popular}
                    onChange={(e) => setEditingPackage({ ...editingPackage, popular: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#1F2021] focus:ring-[#1F2021]"
                  />
                  <label htmlFor="popular-checkbox" className="text-sm font-bold text-[#1F2021] cursor-pointer">
                    Tandai sebagai Paket Populer
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all"
                  >
                    <Save size={18} /> Simpan Paket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Addons & Promos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <DashboardSection
          title="Addons & Extras"
          description="Layanan tambahan"
          onAdd={() => openAddonModal()}
          addLabel="Tambah Addon"
        >
          <div className="space-y-4">
            {adminAddons.map((addon: any) => (
              <div key={addon.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 group">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#1F2021]">{addon.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{addon.description || addon.desc || '-'}</p>
                </div>
                <div className="font-bold text-sm text-[#1F2021]">{addon.price || 'Rp 0'}</div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openAddonModal(addon)} className="p-1.5 text-gray-400 hover:text-[#1F2021] transition-colors rounded-md hover:bg-gray-50">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteAddon(addon.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {adminAddons.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada addon.</p>}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Kode Promo"
          description="Diskon booking"
          onAdd={() => openPromoModal()}
          addLabel="Tambah Promo"
        >
          <div className="space-y-4">
            {adminPromos.map((promo: any, idx: number) => (
              <div key={idx} className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 group ${!promo.active ? 'opacity-50' : ''}`}>
                <div className="flex-1">
                  <h4 className="font-mono font-bold text-sm text-[#1F2021] uppercase">{promo.code}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">{promo.desc || '-'}</p>
                </div>
                <div className="font-bold text-sm text-[#1F2021]">{promo.discount || '-'}</div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openPromoModal(promo, idx)} className="p-1.5 text-gray-400 hover:text-[#1F2021] transition-colors rounded-md hover:bg-gray-50">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeletePromo(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {adminPromos.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada promo.</p>}
          </div>
        </DashboardSection>
      </div>

      {/* ── Modal Edit Addon ── */}
      <AnimatePresence>
        {isAddonModalOpen && editingAddon && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddonModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold tracking-tight text-[#1F2021]">
                  {editingAddon.id ? 'Edit Addon' : 'Tambah Addon'}
                </h2>
                <button onClick={closeAddonModal} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAddon} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Nama Addon</label>
                  <input
                    required
                    type="text"
                    value={editingAddon.name}
                    onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Harga</label>
                  <input
                    required
                    type="text"
                    value={editingAddon.price}
                    onChange={(e) => setEditingAddon({ ...editingAddon, price: formatRupiah(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={editingAddon.description || editingAddon.desc || ''}
                    onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                  />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all"
                  >
                    <Save size={18} /> Simpan Addon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Edit Promo ── */}
      <AnimatePresence>
        {isPromoModalOpen && editingPromo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePromoModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold tracking-tight text-[#1F2021]">
                  {editingPromo._idx !== undefined ? 'Edit Promo' : 'Tambah Promo'}
                </h2>
                <button onClick={closePromoModal} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePromo} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Kode Promo (Otomatis Kapital)</label>
                  <input
                    required
                    type="text"
                    value={editingPromo.code}
                    onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Diskon / Potongan</label>
                  <input
                    required
                    type="text"
                    value={editingPromo.discount}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Keterangan Tambahan</label>
                  <textarea
                    rows={2}
                    value={editingPromo.desc || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, desc: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                  />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="active-promo-checkbox"
                    checked={editingPromo.active !== false}
                    onChange={(e) => setEditingPromo({ ...editingPromo, active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#1F2021] focus:ring-[#1F2021]"
                  />
                  <label htmlFor="active-promo-checkbox" className="text-sm font-bold text-[#1F2021] cursor-pointer">
                    Promo Aktif
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all"
                  >
                    <Save size={18} /> Simpan Promo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackagesTab;
