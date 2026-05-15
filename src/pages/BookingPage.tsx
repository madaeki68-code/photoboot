import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, X, Loader2, Check, Wallet, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { Section } from '../components/ui/Section';
import Typography from '../components/ui/Typography';
import Footer from '../components/layout/Footer';

const EVENT_CATEGORIES = [
  'Pernikahan / Wedding',
  'Ulang Tahun',
  'Wisuda',
  'Gathering / Corporate',
  'Lamaran',
  'Baby Shower',
  'Pesta / Party',
  'Lainnya',
];

interface BookingForm {
  name: string;
  whatsapp: string;
  location: string;
  event_category: string;
  event_date: string;
  package_name: string;
  addons: string[];
  promo_code: string;
  notes: string;
  payment_proof_url: string;
  dp_amount: string;
}

const initialForm: BookingForm = {
  name: '',
  whatsapp: '',
  location: '',
  event_category: '',
  event_date: '',
  package_name: '',
  addons: [],
  promo_code: '',
  notes: '',
  payment_proof_url: '',
  dp_amount: '',
};

const getNumeric = (val: string) => Number((val || '').toString().replace(/\D/g, '')) || 0;

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val);
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const promos: any[] = settings.booking_promos || [];

  const [packages, setPackages] = useState<any[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);

  const [form, setForm] = useState<BookingForm>({
    ...initialForm,
    package_name: searchParams.get('package') || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, addonRes] = await Promise.all([
          supabase.from('packages').select('*').order('created_at', { ascending: true }),
          supabase.from('addons').select('*').order('created_at', { ascending: true })
        ]);
        if (pkgRes.data) setPackages(pkgRes.data);
        if (addonRes.data) setAvailableAddons(addonRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [promoInfo, setPromoInfo] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setForm({ ...form, payment_proof_url: '' });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCheckPromo = () => {
    const code = form.promo_code.trim().toUpperCase();
    if (!code) return;
    const found = promos.find(
      (p: any) => (p.code || '').toUpperCase() === code && p.active !== false
    );
    if (found) {
      setPromoStatus('valid');
      setPromoInfo(found);
    } else {
      setPromoStatus('invalid');
      setPromoInfo(null);
    }
  };

  const uploadPaymentProof = async (): Promise<string> => {
    if (!uploadFile) return '';
    setUploading(true);
    try {
      const ext = uploadFile.name.split('.').pop();
      const fileName = `booking_proof_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('bookings')
        .upload(fileName, uploadFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('bookings').getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    const selectedPackage = packages.find(p => p.name === form.package_name);
    if (selectedPackage) {
      total += getNumeric(selectedPackage.price);
    }
    
    form.addons.forEach(addonName => {
      const addon = availableAddons.find(a => a.name === addonName);
      if (addon) total += getNumeric(addon.price);
    });

    if (promoStatus === 'valid' && promoInfo) {
      const discountStr = promoInfo.discount || '';
      if (discountStr.includes('%')) {
        const pct = getNumeric(discountStr);
        total = total - (total * (pct / 100));
      } else {
        total = total - getNumeric(discountStr);
      }
    }
    if (total < 0) total = 0;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let proofUrl = form.payment_proof_url;
      if (uploadFile) {
        proofUrl = await uploadPaymentProof();
      }

      const total = calculateTotal();

      const payload = {
        name: form.name,
        whatsapp: form.whatsapp,
        location: form.location,
        event_category: form.event_category,
        event_date: form.event_date,
        package_name: form.package_name,
        addons: form.addons,
        promo_code: promoStatus === 'valid' ? form.promo_code.trim().toUpperCase() : null,
        notes: form.notes,
        payment_proof_url: proofUrl,
        status: 'pending',
        total_price: formatRupiah(total),
        paid_amount: form.dp_amount || 'Rp 0',
      };

      const { error: insertError } = await supabase.from('bookings').insert([payload]);
      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <CheckCircle2 size={56} className="mx-auto mb-6 text-green-500" strokeWidth={1.5} />
            <Typography variant="h2" className="mb-4 italic">
              Booking Terkirim!
            </Typography>
            <Typography variant="p" className="text-gray-500 mb-8">
              Terima kasih, <strong>{form.name}</strong>! Kami akan menghubungi kamu melalui WhatsApp{' '}
              <strong>{form.whatsapp}</strong> untuk konfirmasi lebih lanjut.
            </Typography>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
            >
              Kembali ke Beranda
            </a>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="pt-40 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <Typography variant="label" className="mb-6 block text-gray-400 uppercase tracking-[0.3em]">
            {settings.site_title || 'Kallo Photobooth'}
          </Typography>
          <Typography variant="h2" className="mb-4 mx-auto">
            {settings.booking_title || 'Pesan Photobooth Sekarang.'}
          </Typography>
          <Typography variant="p" className="mx-auto max-w-lg text-gray-500">
            {settings.booking_subtitle ||
              'Isi form di bawah ini dan kami akan segera menghubungimu untuk konfirmasi.'}
          </Typography>
        </motion.div>
      </div>

      <Section className="bg-gray-50 !py-16">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="cth. Budi Santoso"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white"
              />
            </div>

            {/* No WhatsApp */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                required
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="cth. 08123456789"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white"
              />
            </div>

            {/* Lokasi Acara */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Lokasi Acara <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="cth. Gedung Serbaguna, Jakarta Selatan"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white"
              />
            </div>

            {/* Kategori Acara */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Kategori Acara <span className="text-red-500">*</span>
              </label>
              <select
                name="event_category"
                required
                value={form.event_category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white appearance-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Acara */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Tanggal Acara <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="event_date"
                required
                value={form.event_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white"
              />
            </div>

            {/* Pilih Paket */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Paket yang Dipilih
              </label>
              <select
                name="package_name"
                value={form.package_name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white appearance-none"
              >
                <option value="">-- Pilih Paket (Opsional) --</option>
                {packages.map((pkg: any, idx: number) => (
                  <option key={idx} value={pkg.name || `Paket ${idx + 1}`}>
                    {pkg.name || `Paket ${idx + 1}`}
                    {pkg.price ? ` — ${pkg.price}` : ''}
                  </option>
                ))}
              </select>
              {packages.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Belum ada paket tersedia.{' '}
                  <a href="/packages" className="underline hover:text-[#1F2021]">
                    Lihat paket
                  </a>
                </p>
              )}
              {form.package_name && packages.find(p => p.name === form.package_name) && (
                <div className="mt-4 p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  {(() => {
                    const pkg = packages.find(p => p.name === form.package_name);
                    return (
                      <>
                        <div className="mb-4">
                          <Typography variant="h3" className="mb-1">{pkg.name}</Typography>
                          <div className="text-xl font-bold tracking-tighter text-[#1F2021] mb-1">
                            {pkg.price || 'Hubungi Kami'}
                          </div>
                          {pkg.duration && (
                            <Typography variant="label" className="text-gray-400 block">
                              {pkg.duration}
                            </Typography>
                          )}
                        </div>
                        
                        {pkg.description && (
                          <Typography variant="p" className="text-sm text-gray-600 mb-4">
                            {pkg.description}
                          </Typography>
                        )}

                        {pkg.features && pkg.features.length > 0 && (
                          <ul className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                            {pkg.features.map((feat: string, fi: number) => (
                              <li key={fi} className="flex items-start gap-2">
                                <Check size={14} className="mt-0.5 shrink-0 text-[#1F2021]" />
                                <span className="text-sm text-gray-600">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Pilih Addon */}
            {availableAddons.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
                  Tambahan (Addons) - Pilih Salah Satu
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${form.addons.length === 0 ? 'border-[#1F2021] bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="addon_selection"
                      checked={form.addons.length === 0}
                      onChange={() => setForm({ ...form, addons: [] })}
                      className="mt-1 w-4 h-4 text-[#1F2021] focus:ring-[#1F2021]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-[#1F2021]">Tanpa Tambahan</span>
                    </div>
                  </label>

                  {availableAddons.map((addon: any, idx: number) => {
                    const isChecked = form.addons.length === 1 && form.addons[0] === addon.name;
                    return (
                      <label key={idx} className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${isChecked ? 'border-[#1F2021] bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="addon_selection"
                          value={addon.name}
                          checked={isChecked}
                          onChange={() => setForm({ ...form, addons: [addon.name] })}
                          className="mt-1 w-4 h-4 text-[#1F2021] focus:ring-[#1F2021]"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-[#1F2021]">{addon.name}</span>
                            <span className="text-xs font-bold text-gray-500">{addon.price}</span>
                          </div>
                          {(addon.description || addon.desc) && (
                            <p className="text-xs text-gray-500">{addon.description || addon.desc}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catatan */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Catatan Tambahan
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="cth. Butuh backdrop custom, tema vintage, dll."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white resize-none"
              />
            </div>

            {/* Ringkasan Biaya */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Ringkasan Biaya</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Paket: {form.package_name || '-'}</span>
                  <span>{form.package_name ? formatRupiah(getNumeric(packages.find(p => p.name === form.package_name)?.price || '0')) : 'Rp 0'}</span>
                </div>
                {form.addons.length > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Layanan Tambahan (Addon)</span>
                    <span>{formatRupiah(form.addons.reduce((acc, adName) => {
                      const ad = availableAddons.find(a => a.name === adName);
                      return acc + (ad ? getNumeric(ad.price) : 0);
                    }, 0))}</span>
                  </div>
                )}
                {promoStatus === 'valid' && promoInfo && (
                  <div className="flex justify-between items-center text-green-600 font-medium">
                    <span>Diskon Promo</span>
                    <span>-{promoInfo.discount}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-bold">
                  <span className="text-[#1F2021]">Total Tagihan</span>
                  <span className="text-xl text-[#1F2021]">{formatRupiah(calculateTotal())}</span>
                </div>
                {form.dp_amount && getNumeric(form.dp_amount) > 0 && (
                  <>
                    <div className="flex justify-between items-center text-green-600">
                      <span>DP / Sudah Dibayar</span>
                      <span className="font-semibold">- {formatRupiah(getNumeric(form.dp_amount))}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-bold">
                      <span className="text-red-600">Sisa Tagihan</span>
                      <span className="text-xl text-red-600">
                        {calculateTotal() - getNumeric(form.dp_amount) > 0
                          ? formatRupiah(calculateTotal() - getNumeric(form.dp_amount))
                          : 'LUNAS'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Info Rekening Bank */}
            {(settings.bank_name || settings.bank_account_number) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Wallet size={18} />
                  Informasi Rekening Pembayaran
                </h3>
                <div className="space-y-3 text-sm">
                  {settings.bank_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Bank</span>
                      <span className="font-bold text-blue-900">{settings.bank_name}</span>
                    </div>
                  )}
                  {settings.bank_account_number && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">No. Rekening</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900 font-mono text-base tracking-wider">
                          {settings.bank_account_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(settings.bank_account_number);
                          }}
                          className="p-1 rounded hover:bg-blue-200 text-blue-600 transition-colors"
                          title="Salin nomor rekening"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {settings.bank_account_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Atas Nama</span>
                      <span className="font-bold text-blue-900">{settings.bank_account_name}</span>
                    </div>
                  )}
                  {calculateTotal() > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-blue-200 flex justify-between items-center">
                      <span className="text-blue-700 font-bold">
                        {form.dp_amount && getNumeric(form.dp_amount) > 0 ? 'Sisa yang Harus Dibayar:' : 'Total yang Harus Dibayar:'}
                      </span>
                      <span className="text-xl font-bold text-red-600">
                        {form.dp_amount && getNumeric(form.dp_amount) > 0
                          ? (calculateTotal() - getNumeric(form.dp_amount) > 0
                              ? formatRupiah(calculateTotal() - getNumeric(form.dp_amount))
                              : 'LUNAS')
                          : formatRupiah(calculateTotal())}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-4 italic">
                  Silakan transfer ke rekening di atas dan upload bukti transfer di bawah.
                </p>
              </div>
            )}

            {/* Upload Bukti Transfer */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nominal Transfer / DP (Rp)
              </label>
              <input
                type="text"
                name="dp_amount"
                value={form.dp_amount}
                onChange={(e) => {
                  const val = getNumeric(e.target.value);
                  setForm({ ...form, dp_amount: val ? formatRupiah(val) : '' });
                }}
                placeholder="cth. 500000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Isi jika kamu membayar DP atau sebagian. Kosongkan jika belum transfer.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Upload Bukti Transfer
              </label>
              {uploadPreview ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={uploadPreview}
                    alt="Bukti Transfer"
                    className="w-full max-h-64 object-contain bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-white">
                  <Upload size={24} className="text-gray-300" strokeWidth={1.5} />
                  <span className="text-xs text-gray-400">
                    Klik untuk upload foto bukti transfer
                  </span>
                  <span className="text-[10px] text-gray-300">JPG, PNG, PDF — maks. 5MB</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Kode Promo */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Kode Promo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="promo_code"
                  value={form.promo_code}
                  onChange={(e) => {
                    setForm({ ...form, promo_code: e.target.value });
                    setPromoStatus('idle');
                    setPromoInfo(null);
                  }}
                  placeholder="cth. HEMAT20"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F2021] transition-colors bg-white uppercase"
                />
                <button
                  type="button"
                  onClick={handleCheckPromo}
                  className="px-5 py-3 bg-[#1F2021] text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Cek Promo
                </button>
              </div>
              {promoStatus === 'valid' && promoInfo && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                  <CheckCircle2 size={14} />
                  <span>
                    Promo valid! {promoInfo.discount && `Diskon ${promoInfo.discount}`}
                    {promoInfo.desc && ` — ${promoInfo.desc}`}
                  </span>
                </div>
              )}
              {promoStatus === 'invalid' && (
                <p className="mt-2 text-red-500 text-xs">Kode promo tidak valid atau sudah tidak aktif.</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white py-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting || uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploading ? 'Mengupload...' : 'Mengirim...'}
                </>
              ) : (
                'Kirim Booking'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Dengan mengirim form ini, kamu menyetujui syarat & ketentuan kami.
            </p>
          </form>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default BookingPage;
