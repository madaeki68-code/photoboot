import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, Copy, Check, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

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
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      console.error('Invoice element not found');
      return;
    }

    try {
      console.log('Generating PDF using html-to-image & jsPDF...');
      const element = invoiceRef.current;
      
      // Convert HTML to PNG image
      const dataUrl = await toPng(element, { 
        quality: 1.0,
        pixelRatio: 2, // High resolution
        skipFonts: false,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit A4 (210 x 297 mm)
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Invoice-${booking?.id?.split('-')[0].toUpperCase() || 'Booking'}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated and download triggered');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Gagal mengunduh PDF. Silakan coba Cetak (Ctrl+P) sebagai alternatif.');
    }
  };

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
    <div className="min-h-screen bg-gray-100 pt-28 pb-20 px-3 sm:px-4 md:px-6 print:bg-white print:p-0">
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
        
        /* Fix for html2canvas oklab/oklch issue in Tailwind v4 */
        .invoice-paper * {
          color-scheme: light !important;
          -webkit-print-color-adjust: exact;
        }
      `}} />

      <div className="max-w-[210mm] mx-auto">
        {/* ─── Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3 no-print">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#1F2021] transition-colors self-start"
          >
            <ArrowLeft size={20} /> Kembali
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-white border border-[#e5e7eb] text-[#1F2021] px-4 py-2.5 rounded-full text-sm font-medium hover:bg-[#f9fafb] transition-colors shadow-sm"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
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
              className="flex items-center gap-2 bg-[#16a34a] text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-lg"
            >
              <CheckCircle2 size={16} /> Bagikan ke WA
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-[#1F2021] text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              <Download size={16} /> Download Invoice PDF
            </button>
          </div>
        </div>

        {/* ─── Invoice Paper ─── */}
        <div ref={invoiceRef} className="invoice-paper bg-white p-6 sm:p-10 md:p-16 shadow-2xl shadow-gray-300/50 relative overflow-hidden flex flex-col rounded-2xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b-2 border-[#111827] pb-8 mb-8">
            {/* Logo + Nama */}
            <div className="flex items-center gap-3">
              {settings.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-[#1F2021] rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0">
                  {settings.site_logo_text?.[0] || settings.site_title?.[0] || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-[#1F2021] leading-none uppercase">
                  {settings.site_logo_text || settings.site_title || 'PHOTOBOOTH'}
                </h1>
                <p className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-widest mt-1">Professional Photobooth Service</p>
                <p className="text-[9px] text-[#6b7280] mt-0.5 max-w-[180px] leading-relaxed">
                  {settings.contact_address || 'Jakarta, Indonesia'}
                </p>
              </div>
            </div>
            {/* Invoice label */}
            <div className="text-left sm:text-right">
              <h2 className="text-3xl sm:text-4xl font-black text-[#f3f4f6] leading-none mb-3">INVOICE</h2>
              <p className="text-sm font-bold text-[#1F2021]">{invoiceNumber}</p>
              <p className="text-[10px] text-[#9ca3af] font-bold uppercase">
                {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Billed to + Detail Acara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mb-10">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#9ca3af] font-bold mb-3 border-b pb-1">DITAGIHKAN KEPADA</h3>
              <div className="space-y-0.5">
                <p className="text-base sm:text-lg font-black text-[#1F2021] uppercase">{booking.name}</p>
                <p className="text-sm text-[#4b5563]">{booking.whatsapp}</p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#9ca3af] font-bold mb-3 border-b pb-1">DETAIL ACARA</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="text-[#9ca3af] py-1 font-medium w-20 align-top">Kategori</td>
                    <td className="text-[#1F2021] py-1 font-bold">: {booking.event_category}</td>
                  </tr>
                  <tr>
                    <td className="text-[#9ca3af] py-1 font-medium align-top">Tanggal</td>
                    <td className="text-[#1F2021] py-1 font-bold">: {booking.event_date}</td>
                  </tr>
                  <tr>
                    <td className="text-[#9ca3af] py-1 font-medium align-top">Lokasi</td>
                    <td className="text-[#1F2021] py-1 font-bold break-words">: {booking.location}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f3f4f6]">
                  <th className="p-3 sm:p-4 text-[10px] font-bold text-[#4b5563] uppercase tracking-widest text-left">Layanan / Item</th>
                  <th className="p-3 sm:p-4 text-[10px] font-bold text-[#4b5563] uppercase tracking-widest text-right w-24 sm:w-40">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#f9fafb]">
                <tr>
                  <td className="p-4 sm:p-6">
                    <p className="font-black text-sm text-[#1F2021] uppercase">{booking.package_name || 'Paket Utama'}</p>
                    <p className="text-[10px] text-[#9ca3af] mt-1 uppercase font-bold tracking-tighter">Layanan Photobooth Profesional</p>
                  </td>
                  <td className="p-4 sm:p-6 text-right font-bold text-sm text-[#1F2021]">-</td>
                </tr>
                {booking.addons && booking.addons.length > 0 && booking.addons.map((addon: string, i: number) => (
                  <tr key={i}>
                    <td className="p-4 sm:p-6">
                      <p className="font-bold text-sm text-[#1F2021]">+ {addon}</p>
                      <p className="text-[10px] text-[#9ca3af] mt-1 uppercase font-bold tracking-tighter">Layanan Tambahan (Addon)</p>
                    </td>
                    <td className="p-4 sm:p-6 text-right font-bold text-sm text-[#1F2021]">-</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {booking.notes && (
              <div className="mt-6 p-4 sm:p-6 bg-[#f9fafb] rounded-xl border-l-4 border-[#111827]">
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">Catatan Khusus</p>
                <p className="text-xs text-[#4b5563] italic leading-relaxed">"{booking.notes}"</p>
              </div>
            )}
          </div>

          {/* Footer: Signature + Summary */}
          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8">
              {/* Tanda Terima */}
              <div className="flex-1">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#9ca3af] font-bold mb-8">TANDA TERIMA</h3>
                <div className="flex gap-10">
                  <div className="text-center">
                    <div className="w-44 h-20 border-b-2 border-[#111827] mb-2 relative flex items-center justify-center">
                      {settings.admin_signature ? (
                        <img
                          src={settings.admin_signature}
                          alt="Tanda Tangan"
                          className="absolute h-16 w-auto object-contain z-10"
                        />
                      ) : (
                        <p className="text-[#e5e7eb] text-[10px] mt-10 italic">Tanda tangan admin</p>
                      )}
                      {isPaidOff && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-12deg] z-20">
                          <div className="border-4 border-[#16a34a] text-[#16a34a] font-black text-3xl px-6 py-2 rounded-2xl">LUNAS</div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-[#1F2021] uppercase tracking-widest">
                      {settings.site_logo_text || settings.site_title || 'ADMIN'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ringkasan Pembayaran */}
              <div className="w-full sm:w-72 space-y-3 bg-[#f9fafb] p-5 sm:p-8 rounded-2xl">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                  <span>Total Biaya</span>
                  <span className="text-[#1F2021]">{formatRupiah(total.toString())}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                  <span>Sudah Dibayar</span>
                  <span className="text-[#16a34a]">{formatRupiah(paid.toString())}</span>
                </div>
                <div className="pt-4 border-t border-[#e5e7eb] flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-[#1F2021]">Sisa Tagihan</span>
                  <div className="text-right">
                    <span className={`text-xl sm:text-2xl font-black ${isPaidOff ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {isPaidOff ? 'Rp 0' : formatRupiah(sisa.toString())}
                    </span>
                    {isPaidOff && (
                      <p className="text-[8px] font-bold text-[#16a34a] uppercase tracking-tighter mt-1 leading-none">Status: Lunas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#f3f4f6] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <p className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-widest leading-none">
                {settings.site_title || 'PHOTOBOOTH'} © {new Date().getFullYear()}
              </p>
              <p className="text-[9px] text-[#9ca3af] italic leading-none">Dokumen ini sah diproses secara digital.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
