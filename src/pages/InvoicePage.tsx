import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, ArrowLeft, Printer, CheckCircle2, Clock, Wallet } from 'lucide-react';
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

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val);
};

const parseCurrency = (val?: string | number) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(val.replace(/\D/g, '')) || 0;
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
      // Fetch booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*');

      const settingsObj: Settings = {};
      settingsData?.forEach((item: any) => {
        settingsObj[item.key as keyof Settings] = item.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);

    const opt = {
      margin: 10,
      filename: `Invoice-${booking?.name}-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F2021] mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat invoice...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Invoice tidak ditemukan</p>
          <button
            onClick={() => navigate('/admin?tab=finance')}
            className="text-[#1F2021] hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const total = parseCurrency(booking.total_price_numeric ?? booking.total_price);
  const paid = parseCurrency(booking.paid_amount_numeric ?? booking.paid_amount);
  const remaining = total - paid;
  const paymentStatus = remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0">
      {/* Action Bar - Hidden on Print */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => navigate('/admin?tab=finance')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1F2021] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali</span>
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-2 bg-[#1F2021] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? 'Membuat PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto px-4">
        <div ref={invoiceRef} className="bg-white shadow-lg rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-[#1F2021] text-white p-8 print:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-sm opacity-80">No: INV-{booking.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm opacity-80">Tanggal: {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              {settings.company_logo && (
                <img src={settings.company_logo} alt="Logo" className="h-16 object-contain" />
              )}
            </div>
          </div>

          {/* Company & Client Info */}
          <div className="grid md:grid-cols-2 gap-8 p-8 border-b border-gray-100">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Dari:</h3>
              <h4 className="font-bold text-lg text-[#1F2021] mb-2">
                {settings.company_name || 'Nama Perusahaan'}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {settings.company_address || 'Alamat Perusahaan'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {settings.company_phone && `Tel: ${settings.company_phone}`}
              </p>
              <p className="text-sm text-gray-600">
                {settings.company_email && `Email: ${settings.company_email}`}
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Kepada:</h3>
              <h4 className="font-bold text-lg text-[#1F2021] mb-2">{booking.name}</h4>
              <p className="text-sm text-gray-600">WhatsApp: {booking.whatsapp}</p>
              <p className="text-sm text-gray-600">Lokasi: {booking.location}</p>
              <p className="text-sm text-gray-600">Kategori: {booking.event_category}</p>
              <p className="text-sm text-gray-600">Tanggal Event: {booking.event_date}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs uppercase tracking-widest text-gray-400 font-bold">Deskripsi</th>
                  <th className="text-right py-3 text-xs uppercase tracking-widest text-gray-400 font-bold">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="font-bold text-[#1F2021]">{booking.package_name || 'Paket Photobooth'}</div>
                    {booking.notes && (
                      <div className="text-sm text-gray-500 mt-1">{booking.notes}</div>
                    )}
                  </td>
                  <td className="text-right font-bold text-[#1F2021]">{formatRupiah(total)}</td>
                </tr>

                {booking.addons && booking.addons.length > 0 && (
                  <>
                    {booking.addons.map((addon, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-600">+ {addon}</td>
                        <td className="text-right text-sm text-gray-600">-</td>
                      </tr>
                    ))}
                  </>
                )}

                {booking.promo_code && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-sm text-green-600">Kode Promo: {booking.promo_code}</td>
                    <td className="text-right text-sm text-green-600">Terapkan</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-8 ml-auto max-w-xs space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-600">Sudah Dibayar (DP):</span>
                <span className="font-bold text-green-600">{formatRupiah(paid)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-3">
                <span>Sisa Tagihan:</span>
                <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                  {remaining > 0 ? formatRupiah(remaining) : 'LUNAS ✓'}
                </span>
              </div>
            </div>

            {/* Payment Status Badge */}
            <div className="mt-8 flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-50">
              {paymentStatus === 'paid' ? (
                <>
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="font-bold text-green-600 uppercase tracking-wider">Pembayaran Lunas</span>
                </>
              ) : (
                <>
                  <Clock className="text-orange-600" size={24} />
                  <span className="font-bold text-orange-600 uppercase tracking-wider">
                    {paymentStatus === 'partial' ? 'Pembayaran Sebagian (DP)' : 'Menunggu Pembayaran'}
                  </span>
                </>
              )}
            </div>

            {/* Bank Account Info - Always show */}
            {(settings.bank_name || settings.bank_account_number) && (
              <div className={`mt-8 p-6 rounded-xl border-2 ${remaining > 0 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${remaining > 0 ? 'text-blue-900' : 'text-green-900'}`}>
                  <Wallet size={18} />
                  Informasi Rekening Pembayaran
                </h3>
                <div className="space-y-2 text-sm">
                  {settings.bank_name && (
                    <div className="flex justify-between">
                      <span className={remaining > 0 ? 'text-blue-700' : 'text-green-700'}>Bank:</span>
                      <span className={`font-bold ${remaining > 0 ? 'text-blue-900' : 'text-green-900'}`}>{settings.bank_name}</span>
                    </div>
                  )}
                  {settings.bank_account_number && (
                    <div className="flex justify-between">
                      <span className={remaining > 0 ? 'text-blue-700' : 'text-green-700'}>No. Rekening:</span>
                      <span className={`font-bold font-mono text-base tracking-wider ${remaining > 0 ? 'text-blue-900' : 'text-green-900'}`}>{settings.bank_account_number}</span>
                    </div>
                  )}
                  {settings.bank_account_name && (
                    <div className="flex justify-between">
                      <span className={remaining > 0 ? 'text-blue-700' : 'text-green-700'}>Atas Nama:</span>
                      <span className={`font-bold ${remaining > 0 ? 'text-blue-900' : 'text-green-900'}`}>{settings.bank_account_name}</span>
                    </div>
                  )}
                  {remaining > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-blue-200 flex justify-between items-center">
                      <span className="text-blue-700 font-bold">Jumlah yang Harus Dibayar:</span>
                      <span className="text-xl font-bold text-red-600">{formatRupiah(remaining)}</span>
                    </div>
                  )}
                  {remaining <= 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-green-200 flex justify-between items-center">
                      <span className="text-green-700 font-bold">Status:</span>
                      <span className="text-lg font-bold text-green-600">Pembayaran Lunas ✓</span>
                    </div>
                  )}
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-blue-600 mt-4 italic">
                    Silakan transfer ke rekening di atas dan kirimkan bukti transfer ke WhatsApp kami.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-8 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Terima kasih atas kepercayaan Anda. Untuk pertanyaan, hubungi kami di {settings.company_phone || settings.company_email || 'kontak kami'}.
            </p>
            <p className="text-xs text-gray-400 text-center mt-2">
              Invoice ini dibuat secara otomatis dan sah tanpa tanda tangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
