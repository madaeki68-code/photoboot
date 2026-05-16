import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, ArrowLeft, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';

/* ─── Types ─────────────────────────────────────────────── */
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

interface Package {
  id: string;
  name: string;
  price: string;
  duration?: string;
  description?: string;
  features?: string[];
}

interface Addon {
  id: string;
  name: string;
  price: string;
  description?: string;
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
  admin_signature?: string;
  admin_name?: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const parseCurrency = (val?: string | number) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/\D/g, '')) || 0;
};

const INTER = "'Inter', 'Segoe UI', Arial, sans-serif";

/* ─── Component ──────────────────────────────────────────── */
const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [addonData, setAddonData] = useState<Addon[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [{ data: bookingData, error: bookingError }, { data: settingsData }, { data: pkgData }, { data: addonList }] =
        await Promise.all([
          supabase.from('bookings').select('*').eq('id', id).single(),
          supabase.from('settings').select('*'),
          supabase.from('packages').select('*'),
          supabase.from('addons').select('*'),
        ]);

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Settings map
      const obj: Settings = {};
      settingsData?.forEach((item: any) => { obj[item.key as keyof Settings] = item.value; });
      setSettings(obj);

      // Match package by name
      if (bookingData?.package_name && pkgData) {
        const matched = pkgData.find((p: Package) => p.name === bookingData.package_name) || null;
        setPackageData(matched);
      }

      // Match addons by name
      if (bookingData?.addons?.length && addonList) {
        const matched = (bookingData.addons as string[])
          .map((name: string) => addonList.find((a: Addon) => a.name === name))
          .filter(Boolean) as Addon[];
        setAddonData(matched);
      }
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
        margin: [0, 0, 0, 0] as [number, number, number, number],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto mb-3" />
          <p className="text-gray-500 text-sm" style={{ fontFamily: INTER }}>Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4" style={{ fontFamily: INTER }}>Invoice tidak ditemukan.</p>
          <button onClick={() => navigate('/admin?tab=finance')} className="text-blue-600 hover:underline text-sm">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const total = parseCurrency(booking.total_price_numeric ?? booking.total_price);
  const paid  = parseCurrency(booking.paid_amount_numeric ?? booking.paid_amount);
  const remaining = total - paid;
  const paymentStatus = remaining <= 0 && total > 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  const invoiceNo   = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Harga paket & addon terpisah
  const packagePrice = parseCurrency(packageData?.price);
  const addonRows = addonData.map(a => ({ ...a, priceNum: parseCurrency(a.price) }));

  return (
    <div className="min-h-screen bg-gray-200 pt-28 pb-8 print:bg-white print:py-0" style={{ fontFamily: INTER }}>

      {/* ── Action Bar ── */}
      <div className="max-w-[794px] mx-auto px-4 mb-6 print:hidden">
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => navigate('/admin?tab=finance')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer size={16} /> Print
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

      {/* ── A4 Sheet ── */}
      <div className="max-w-[794px] mx-auto px-4 print:px-0 print:max-w-none">
        <div
          ref={invoiceRef}
          style={{ background: '#fff', minHeight: '1123px', fontFamily: INTER }}
          className="shadow-xl print:shadow-none"
        >

          {/* TOP BAR */}
          <div style={{ height: 6, background: 'linear-gradient(90deg,#1F2021 0%,#555 100%)' }} />

          {/* HEADER */}
          <div style={{ padding: '40px 48px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e5e5' }}>
            {/* Company */}
            <div>
              {settings.company_logo ? (
                <img src={settings.company_logo} alt="Logo" style={{ height: 52, objectFit: 'contain', marginBottom: 10 }} />
              ) : (
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1F2021', letterSpacing: '-0.5px', marginBottom: 6, fontFamily: INTER }}>
                  {settings.company_name || 'PERUSAHAAN'}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7, fontFamily: INTER }}>
                {settings.company_name && settings.company_logo && (
                  <div style={{ fontWeight: 700, color: '#1F2021', marginBottom: 2 }}>{settings.company_name}</div>
                )}
                {settings.company_address && <div>{settings.company_address}</div>}
                {settings.company_phone && <div>Telp: {settings.company_phone}</div>}
                {settings.company_email && <div>Email: {settings.company_email}</div>}
              </div>
            </div>

            {/* Invoice meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: '#1F2021', letterSpacing: '-1.5px', lineHeight: 1, fontFamily: INTER }}>
                INVOICE
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: '#666', lineHeight: 1.9, fontFamily: INTER }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <span style={{ color: '#aaa' }}>No. Invoice</span>
                  <strong style={{ color: '#1F2021' }}>{invoiceNo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <span style={{ color: '#aaa' }}>Tanggal</span>
                  <strong style={{ color: '#1F2021' }}>{invoiceDate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <span style={{ color: '#aaa' }}>Tgl. Acara</span>
                  <strong style={{ color: '#1F2021' }}>{booking.event_date}</strong>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                {paymentStatus === 'paid' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: INTER }}>
                    ✓ LUNAS
                  </span>
                )}
                {paymentStatus === 'partial' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#fef3c7', color: '#d97706', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: INTER }}>
                    DP / SEBAGIAN
                  </span>
                )}
                {paymentStatus === 'unpaid' && (
                  <span style={{ display: 'inline-block', padding: '4px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: INTER }}>
                    BELUM BAYAR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BILL TO */}
          <div style={{ padding: '28px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, borderBottom: '1px solid #e5e5e5' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontFamily: INTER }}>
                Tagihan Kepada
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2021', marginBottom: 6, fontFamily: INTER }}>{booking.name}</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, fontFamily: INTER }}>
                <div>WhatsApp: {booking.whatsapp}</div>
                <div>Lokasi: {booking.location}</div>
                <div>Kategori: {booking.event_category}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontFamily: INTER }}>
                Detail Acara
              </div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, fontFamily: INTER }}>
                <div><span style={{ color: '#aaa', display: 'inline-block', width: 70 }}>Paket</span><strong style={{ color: '#1F2021' }}>{booking.package_name || '-'}</strong></div>
                <div><span style={{ color: '#aaa', display: 'inline-block', width: 70 }}>Tanggal</span><strong style={{ color: '#1F2021' }}>{booking.event_date}</strong></div>
                <div><span style={{ color: '#aaa', display: 'inline-block', width: 70 }}>Kategori</span><strong style={{ color: '#1F2021' }}>{booking.event_category}</strong></div>
                {booking.promo_code && (
                  <div><span style={{ color: '#aaa', display: 'inline-block', width: 70 }}>Promo</span><strong style={{ color: '#16a34a' }}>{booking.promo_code}</strong></div>
                )}
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div style={{ padding: '28px 48px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: INTER }}>
              <thead>
                <tr style={{ background: '#1F2021', color: '#fff' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', width: 36 }}>No</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Deskripsi</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', width: 130 }}>Harga</th>
                </tr>
              </thead>
              <tbody>
                {/* ── Paket Utama ── */}
                <tr style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <td style={{ padding: '14px 14px', color: '#aaa', verticalAlign: 'top', fontWeight: 600 }}>1</td>
                  <td style={{ padding: '14px 14px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, color: '#1F2021', fontSize: 14, marginBottom: 4 }}>
                      {booking.package_name || 'Paket Photobooth'}
                    </div>
                    {packageData?.duration && (
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                        Durasi: {packageData.duration}
                      </div>
                    )}
                    {packageData?.description && (
                      <div style={{ fontSize: 12, color: '#555', marginBottom: 8, lineHeight: 1.6 }}>
                        {packageData.description}
                      </div>
                    )}
                    {packageData?.features && packageData.features.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 16, listStyle: 'none' }}>
                        {packageData.features.map((f, i) => (
                          <li key={i} style={{ fontSize: 11, color: '#555', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#1F2021', fontWeight: 700, marginTop: 1 }}>✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {booking.notes && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 8, fontStyle: 'italic', borderTop: '1px dashed #eee', paddingTop: 6 }}>
                        Catatan: {booking.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: 700, color: '#1F2021', verticalAlign: 'top', fontSize: 14 }}>
                    {formatRupiah(packagePrice || total)}
                  </td>
                </tr>

                {/* ── Addons ── */}
                {addonRows.map((addon, idx) => (
                  <tr key={addon.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 14px', color: '#aaa', verticalAlign: 'top', fontWeight: 600 }}>{idx + 2}</td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#1F2021', fontSize: 13, marginBottom: 3 }}>
                        + {addon.name}
                      </div>
                      {addon.description && (
                        <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>{addon.description}</div>
                      )}
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Layanan Tambahan</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#1F2021', verticalAlign: 'top' }}>
                      {formatRupiah(addon.priceNum)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SUMMARY BOX */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <div style={{ width: 300, fontFamily: INTER }}>
                <div style={{ background: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
                  {addonRows.length > 0 && (
                    <>
                      <div style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid #eee', color: '#666' }}>
                        <span>Paket</span>
                        <span style={{ fontWeight: 600 }}>{formatRupiah(packagePrice)}</span>
                      </div>
                      {addonRows.map(a => (
                        <div key={a.id} style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid #eee', color: '#666' }}>
                          <span>+ {a.name}</span>
                          <span style={{ fontWeight: 600 }}>{formatRupiah(a.priceNum)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>{formatRupiah(total)}</span>
                  </div>
                  <div style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#666' }}>Sudah Dibayar (DP)</span>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{formatRupiah(paid)}</span>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', background: remaining > 0 ? '#1F2021' : '#16a34a' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                      {remaining > 0 ? 'Sisa Tagihan' : 'Status'}
                    </span>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
                      {remaining > 0 ? formatRupiah(remaining) : 'LUNAS ✓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT INFO */}
          {(settings.bank_name || settings.bank_account_number) && (
            <div style={{ padding: '0 48px 28px' }}>
              <div style={{
                border: `2px solid ${remaining > 0 ? '#bfdbfe' : '#bbf7d0'}`,
                borderRadius: 10,
                padding: '16px 20px',
                background: remaining > 0 ? '#eff6ff' : '#f0fdf4',
                fontFamily: INTER,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: remaining > 0 ? '#1d4ed8' : '#15803d', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {remaining > 0 ? '⚡ Informasi Pembayaran' : '✓ Rekening Perusahaan'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 12 }}>
                  {settings.bank_name && (
                    <div>
                      <div style={{ color: '#888', marginBottom: 3, fontSize: 11 }}>Bank</div>
                      <div style={{ fontWeight: 700, color: '#1F2021' }}>{settings.bank_name}</div>
                    </div>
                  )}
                  {settings.bank_account_number && (
                    <div>
                      <div style={{ color: '#888', marginBottom: 3, fontSize: 11 }}>No. Rekening</div>
                      <div style={{ fontWeight: 700, color: '#1F2021', fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 }}>{settings.bank_account_number}</div>
                    </div>
                  )}
                  {settings.bank_account_name && (
                    <div>
                      <div style={{ color: '#888', marginBottom: 3, fontSize: 11 }}>Atas Nama</div>
                      <div style={{ fontWeight: 700, color: '#1F2021' }}>{settings.bank_account_name}</div>
                    </div>
                  )}
                </div>
                {remaining > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid #bfdbfe`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>Transfer sebesar:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{formatRupiah(remaining)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SIGNATURE + NOTES */}
          <div style={{ padding: '0 48px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-end', fontFamily: INTER }}>
            {/* Notes */}
            <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.8, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <strong style={{ color: '#888' }}>Catatan:</strong>
              <ul style={{ marginTop: 4, paddingLeft: 16, listStyle: 'disc' }}>
                <li>Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan basah.</li>
                <li>Harap simpan invoice ini sebagai bukti transaksi.</li>
                {remaining > 0 && <li>Pelunasan sisa tagihan wajib dilakukan sebelum hari acara.</li>}
                <li>Pertanyaan? Hubungi kami di {settings.company_phone || settings.company_email || 'kontak kami'}.</li>
              </ul>
            </div>

            {/* TTD Admin */}
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                Hormat Kami,
              </div>
              {settings.admin_signature ? (
                <img
                  src={settings.admin_signature}
                  alt="Tanda Tangan"
                  style={{ height: 64, objectFit: 'contain', margin: '0 auto 4px', display: 'block' }}
                />
              ) : (
                <div style={{ height: 64, borderBottom: '1.5px solid #ccc', marginBottom: 4 }} />
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2021' }}>
                {settings.admin_name || settings.company_name || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: '#aaa' }}>
                {settings.company_name || 'Photobooth Studio'}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '14px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', fontFamily: INTER }}>
            <div style={{ fontSize: 11, color: '#bbb' }}>
              {settings.company_name || 'Photobooth Studio'} &copy; {new Date().getFullYear()}
            </div>
            <div style={{ fontSize: 11, color: '#bbb' }}>
              {invoiceNo} &nbsp;·&nbsp; {invoiceDate}
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#1F2021 0%,#555 100%)' }} />

        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
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
