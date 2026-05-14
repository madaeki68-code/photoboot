import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';

const formatRupiah = (val: string) => {
  if (!val) return 'Rp 0';
  const numeric = val.replace(/\D/g, '');
  if (!numeric) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(numeric));
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1F2021] rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold">Invoice Tidak Ditemukan</h1>
        <Link to="/" className="text-blue-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const invoiceNumber = `INV-${booking.id.split('-')[0].toUpperCase()}`;
  const total = Number((booking.total_price || '').replace(/\D/g, '')) || 0;
  const paid = Number((booking.paid_amount || '').replace(/\D/g, '')) || 0;
  const sisa = total - paid;
  const isPaidOff = total > 0 && sisa <= 0;

  return (
    <div className="min-h-screen bg-gray-100 pt-40 pb-20 px-4 md:px-6 print:bg-white print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .invoice-paper {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-[210mm] mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 no-print">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#1F2021] transition-colors"
          >
            <ArrowLeft size={20} /> Kembali
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-white border border-gray-200 text-[#1F2021] px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
            <button 
              onClick={() => {
                if (window.location.hostname === 'localhost') {
                  alert('Perhatian: Anda sedang di localhost. Link yang dibagikan mungkin tidak bisa dibuka oleh klien. Pastikan aplikasi sudah di-deploy.');
                }
                const message = encodeURIComponent(
                  `Halo ${booking.name},\n\nBerikut adalah invoice resmi untuk pesanan Photobooth Anda dari KALLO PHOTOBOOTH.\n\nLink Invoice: ${window.location.href}\n\nTerima kasih!`
                );
                const phone = booking.whatsapp.replace(/\D/g, '');
                const waPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
                window.open(`https://wa.me/${waPhone}?text=${message}`, '_blank');
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-lg"
            >
              <CheckCircle2 size={18} /> Bagikan ke WhatsApp
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              <Printer size={18} /> Cetak Invoice (A4 PDF)
            </button>
          </div>
        </div>

        <div className="invoice-paper bg-white p-12 md:p-20 shadow-2xl shadow-gray-300/50 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-10 mb-10">
            <div className="flex items-center gap-4">
              {settings.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  className="h-16 w-auto object-contain" 
                />
              ) : (
                <div className="w-16 h-16 bg-[#1F2021] rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                  {settings.site_logo_text?.[0] || settings.site_title?.[0] || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-[#1F2021] leading-none uppercase">
                  {settings.site_logo_text || settings.site_title || 'PHOTOBOOTH'}
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Professional Photobooth Service</p>
                <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">
                  {settings.contact_address || 'Jakarta, Indonesia'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-gray-100 leading-none mb-4">INVOICE</h2>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1F2021]">{invoiceNumber}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 border-b pb-1">DITAGIHKAN KEPADA</h3>
              <div className="space-y-1">
                <p className="text-lg font-black text-[#1F2021] uppercase">{booking.name}</p>
                <p className="text-sm text-gray-600">{booking.whatsapp}</p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 border-b pb-1">DETAIL ACARA</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="text-gray-400 py-1 font-medium w-24">Kategori</td>
                    <td className="text-[#1F2021] py-1 font-bold">: {booking.event_category}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-400 py-1 font-medium">Tanggal</td>
                    <td className="text-[#1F2021] py-1 font-bold">: {booking.event_date}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-400 py-1 font-medium">Lokasi</td>
                    <td className="text-[#1F2021] py-1 font-bold">: {booking.location}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-left">Layanan / Item</th>
                  <th className="p-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right w-40">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                <tr>
                  <td className="p-6">
                    <p className="font-black text-sm text-[#1F2021] uppercase">{booking.package_name || 'Paket Utama'}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Layanan Photobooth Profesional</p>
                  </td>
                  <td className="p-6 text-right font-bold text-sm text-[#1F2021]">-</td>
                </tr>
                {booking.addons && booking.addons.length > 0 && booking.addons.map((addon: string, i: number) => (
                  <tr key={i}>
                    <td className="p-6">
                      <p className="font-bold text-sm text-[#1F2021]">+ {addon}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Layanan Tambahan (Addon)</p>
                    </td>
                    <td className="p-6 text-right font-bold text-sm text-[#1F2021]">-</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {booking.notes && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border-l-4 border-gray-900">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Catatan Khusus</p>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{booking.notes}"</p>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-start gap-12">
              <div className="flex-1">
                <div className="mt-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-12">TANDA TERIMA</h3>
                  <div className="flex gap-20">
                    <div className="text-center">
                      <div className="w-56 h-24 border-b-2 border-gray-900 mb-2 relative flex items-center justify-center">
                        {settings.admin_signature ? (
                          <img 
                            src={settings.admin_signature} 
                            alt="Tanda Tangan" 
                            className="absolute h-20 w-auto object-contain z-10" 
                          />
                        ) : (
                          <p className="text-gray-200 text-[10px] mt-12 italic">Tanda tangan admin</p>
                        )}
                        {isPaidOff && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-12deg] z-20">
                            <div className="border-4 border-green-600 text-green-600 font-black text-3xl px-6 py-2 rounded-2xl">LUNAS</div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-black text-[#1F2021] uppercase tracking-widest">ADMIN KALLO PHOTOBOOTH</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-80 space-y-3 bg-gray-50 p-8 rounded-2xl">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Total Biaya</span>
                  <span className="text-[#1F2021]">{formatRupiah(total.toString())}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Sudah Dibayar</span>
                  <span className="text-green-600">{formatRupiah(paid.toString())}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-[#1F2021]">Sisa Tagihan</span>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${isPaidOff ? 'text-green-600' : 'text-red-500'}`}>
                      {isPaidOff ? 'Rp 0' : formatRupiah(sisa.toString())}
                    </span>
                    {isPaidOff && (
                      <p className="text-[8px] font-bold text-green-600 uppercase tracking-tighter mt-1 leading-none">Status: Lunas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                {settings.site_title || 'PHOTOBOOTH'} © {new Date().getFullYear()}
              </p>
              <p className="text-[9px] text-gray-400 italic leading-none">Dokumen ini sah diproses secara digital.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
