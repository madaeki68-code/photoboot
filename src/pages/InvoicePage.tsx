import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, ArrowLeft, Printer, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  event_category: string;
  event_date: string;
  package_name: string;
  promo_code?: string;
  notes?: string;
  total_price?: string;
  paid_amount?: string;
  total_price_numeric?: number;
  paid_amount_numeric?: number;
  addons?: string[];
  status: string;
  created_at: string;
}

interface Settings {
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_logo?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);

const parseCurrency = (val?: string | number) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/\D/g, '')) || 0;
};

const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      if (bookingError) throw bookingError;
      setBooking(bookingData);

      const { data: settingsData } = await supabase.from('settings').select('*');
      const obj: Settings = {};
      settingsData?.forEach((item: any) => {
        obj[item.key as keyof Settings] = item.value;
      });
      setSettings(obj);
    } catch (err) {
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice-${booking?.name?.replace(/\s+/g, '-')}-${booking?.id?.slice(0, 8).toUpperCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (err) {
      console.error('PDF error:', err);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invoice tidak ditemukan.</p>
          <button onClick={() => navigate('/admin?tab=finance')} className="text-blue-600 hover:underline text-sm">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const total = parseCurrency(booking.total_price_numeric ?? booking.total_price);
  const paid = parseCurrency(booking.paid_amount_numeric ?? booking.paid_amount);
  const remaining = total - paid;
  const paymentStatus = remaining <= 0 && total > 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  const invoiceNo = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(booking.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-200 py-8 print:bg-white print:py-0">

      {/* ── Action Bar (hidden on print) ── */}
      <div className="max-w-[794px] mx-auto px-4 mb-6 print:hidden">
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => navigate('/admin?tab=finance')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? 'Membuat PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* ── A4 Invoice Sheet ── */}
      <div className="max-w-[794px] mx-auto px-4 print:px-0 print:max-w-none">
        <div
          ref={invoiceRef}
          className="bg-white shadow-xl print:shadow-none"
          style={{ minHeight: '1123px', fontFamily: 'Arial, sans-serif' }}
        >

          {/* ── TOP ACCENT BAR ── */}
          <div style={{ height: '6px', background: 'linear-gradient(90deg, #1F2021 0%, #555 100%)' }} />

          {/* ── HEADER ── */}
          <div className="px-12 pt-10 pb-8 flex justify-between items-start border-b border-gray-200">
            {/* Logo / Company */}
            <div>
              {settings.company_logo ? (
                <img src={settings.company_logo} alt="Logo" style={{ height: '52px', objectFit: 'contain', marginBottom: '10px' }} />
              ) : (
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1F2021', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                  {settings.company_name || 'PERUSAHAAN'}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                {settings.company_name && settings.company_logo && (
                  <div style={{ fontWeight: 700, color: '#1F2021', marginBottom: '2px' }}>{settings.company_name}</div>
                )}
                {settings.company_address && <div>{settings.company_address}</div>}
                {settings.company_phone && <div>Telp: {settings.company_phone}</div>}
                {settings.company_email && <div>Email: {settings.company_email}</div>}
              </div>
            </div>

            {/* Invoice Title */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#1F2021', letterSpacing: '-1px', lineHeight: 1 }}>
                INVOICE
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                <div><span style={{ color: '#999' }}>No. Invoice</span> &nbsp;<strong style={{ color: '#1F2021' }}>{invoiceNo}</strong></div>
                <div><span style={{ color: '#999' }}>Tanggal</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style={{ color: '#1F2021' }}>{invoiceDate}</strong></div>
                <div><span style={{ color: '#999' }}>Tgl. Acara</span> &nbsp;&nbsp;&nbsp;<strong style={{ color: '#1F2021' }}>{booking.event_date}</strong></div>
              </div>
              {/* Status Badge */}
              <div style={{ marginTop: '12px' }}>
                {paymentStatus === 'paid' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    ✓ LUNAS
                  </span>
                )}
                {paymentStatus === 'partial' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#fef3c7', color: '#d97706', borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    DP / SEBAGIAN
                  </span>
                )}
                {paymentStatus === 'unpaid' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: '999px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    BELUM BAYAR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── BILL TO / DETAIL ── */}
          <div className="px-12 py-8 grid grid-cols-2 gap-8 border-b border-gray-200">
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Tagihan Kepada
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1F2021', marginBottom: '6px' }}>{booking.name}</div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.8' }}>
                <div>WhatsApp: {booking.whatsapp}</div>
                <div>Lokasi: {booking.location}</div>
                <div>Kategori: {booking.event_category}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Detail Acara
              </div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.8' }}>
                <div><span style={{ color: '#999' }}>Paket</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong style={{ color: '#1F2021' }}>{booking.package_name || '-'}</strong></div>
                <div><span style={{ color: '#999' }}>Tanggal</span> &nbsp;&nbsp;&nbsp;&nbsp;: <strong style={{ color: '#1F2021' }}>{booking.event_date}</strong></div>
                <div><span style={{ color: '#999' }}>Kategori</span> &nbsp;&nbsp;&nbsp;: <strong style={{ color: '#1F2021' }}>{booking.event_category}</strong></div>
                {booking.promo_code && (
                  <div><span style={{ color: '#999' }}>Promo</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong style={{ color: '#16a34a' }}>{booking.promo_code}</strong></div>
                )}
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <div className="px-12 py-8">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1F2021', color: 'white' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>No</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Deskripsi</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {/* Paket Utama */}
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 14px', color: '#999', verticalAlign: 'top' }}>1</td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#1F2021' }}>{booking.package_name || 'Paket Photobooth'}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>Layanan Photobooth — {booking.event_category}</div>
                    {booking.notes && (
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '3px', fontStyle: 'italic' }}>Catatan: {booking.notes}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#1F2021', verticalAlign: 'top' }}>
                    {formatRupiah(total)}
                  </td>
                </tr>

                {/* Addons */}
                {booking.addons && booking.addons.length > 0 && booking.addons.map((addon, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 14px', color: '#999' }}>{idx + 2}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ color: '#444' }}>+ {addon}</div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>Layanan Tambahan</div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#666' }}>Termasuk</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── SUMMARY BOX ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <div style={{ width: '280px' }}>
                <div style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(total)}</span>
                  </div>
                  <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>Sudah Dibayar (DP)</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>{formatRupiah(paid)}</span>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', background: remaining > 0 ? '#1F2021' : '#16a34a' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>
                      {remaining > 0 ? 'Sisa Tagihan' : 'Status'}
                    </span>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>
                      {remaining > 0 ? formatRupiah(remaining) : 'LUNAS ✓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── PAYMENT INFO ── */}
          {(settings.bank_name || settings.bank_account_number) && (
            <div className="px-12 pb-8">
              <div style={{
                border: `2px solid ${remaining > 0 ? '#bfdbfe' : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '16px 20px',
                background: remaining > 0 ? '#eff6ff' : '#f0fdf4',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: remaining > 0 ? '#1d4ed8' : '#15803d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {remaining > 0 ? '⚡ Informasi Pembayaran' : '✓ Rekening Perusahaan'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  {settings.bank_name && (
                    <div>
                      <div style={{ color: '#888', marginBottom: '2px' }}>Bank</div>
                      <div style={{ fontWeight: 700, color: '#1F2021' }}>{settings.bank_name}</div>
                    </div>
                  )}
                  {settings.bank_account_number && (
                    <div>
                      <div style={{ color: '#888', marginBottom: '2px' }}>No. Rekening</div>
                      <div style={{ fontWeight: 700, color: '#1F2021', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '1px' }}>{settings.bank_account_number}</div>
                    </div>
                  )}
                  {settings.bank_account_name && (
                    <div>
                      <div style={{ color: '#888', marginBottom: '2px' }}>Atas Nama</div>
                      <div style={{ fontWeight: 700, color: '#1F2021' }}>{settings.bank_account_name}</div>
                    </div>
                  )}
                </div>
                {remaining > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>Transfer sebesar:</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>{formatRupiah(remaining)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          <div className="px-12 pb-8">
            <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.7', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <strong style={{ color: '#888' }}>Catatan:</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '16px', listStyle: 'disc' }}>
                <li>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.</li>
                <li>Harap simpan invoice ini sebagai bukti transaksi.</li>
                {remaining > 0 && <li>Pelunasan sisa tagihan wajib dilakukan sebelum hari acara.</li>}
                <li>Untuk pertanyaan, hubungi kami di {settings.company_phone || settings.company_email || 'kontak kami'}.</li>
              </ul>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <div style={{ fontSize: '11px', color: '#aaa' }}>
              {settings.company_name || 'Photobooth Studio'} &copy; {new Date().getFullYear()}
            </div>
            <div style={{ fontSize: '11px', color: '#aaa' }}>
              {invoiceNo} &nbsp;·&nbsp; {invoiceDate}
            </div>
          </div>

          {/* ── BOTTOM ACCENT BAR ── */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #1F2021 0%, #555 100%)' }} />

        </div>
      </div>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
