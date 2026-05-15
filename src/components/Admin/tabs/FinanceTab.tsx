import React, { useState } from 'react';
import { 
  Wallet, 
  Receipt, 
  Download, 
  Filter, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Edit2,
  Save,
  X,
  Calendar,
  FileSpreadsheet,
  History,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import PaymentHistory from '../PaymentHistory';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  event_date: string;
  package_name: string;
  status: string;
  total_price?: string;
  paid_amount?: string;
  total_price_numeric?: number;
  paid_amount_numeric?: number;
  created_at: string;
}

interface FinanceTabProps {
  bookings: Booking[];
  onRefresh?: () => void;
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

const FinanceTab: React.FC<FinanceTabProps> = ({ bookings, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState<any | null>(null);
  const [markingLunas, setMarkingLunas] = useState<string | null>(null);

  // Generate WA link untuk notif pelunasan
  const generateWaLunas = (b: typeof processedBookings[0]) => {
    if (!b.whatsapp) return '#';
    let phone = b.whatsapp.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    const message = `Halo Kak ${b.name} 👋\n\nTerima kasih atas pelunasan pembayaran untuk paket *${b.package_name || 'Photobooth'}* pada tanggal *${b.event_date}*.\n\nPembayaran Anda sebesar *${formatRupiah(b.total)}* telah kami terima dan booking Anda sudah berstatus *LUNAS* ✅\n\nKami akan segera berkoordinasi menjelang hari H. Sampai jumpa! 🎉`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleMarkLunas = async (b: typeof processedBookings[0]) => {
    if (!window.confirm(`Tandai booking ${b.name} sebagai LUNAS?\n\nTotal: ${formatRupiah(b.total)}`)) return;
    setMarkingLunas(b.id);
    try {
      const { error } = await supabase.from('bookings').update({
        paid_amount: formatRupiah(b.total),
        paid_amount_numeric: b.total,
        status: 'confirmed',
      }).eq('id', b.id);
      if (error) throw error;
      onRefresh?.();
      // Buka WA otomatis
      const waUrl = generateWaLunas({ ...b, paid: b.total, remains: 0 });
      if (waUrl !== '#') window.open(waUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('Gagal menandai lunas.');
    } finally {
      setMarkingLunas(null);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setIsSaving(true);
    
    const numericTotalPrice = editingPayment.total_price ? Number(editingPayment.total_price.replace(/\D/g, '')) : 0;
    const numericPaidAmount = editingPayment.paid_amount ? Number(editingPayment.paid_amount.replace(/\D/g, '')) : 0;
    
    try {
      const { error } = await supabase.from('bookings').update({
        total_price: editingPayment.total_price || null,
        paid_amount: editingPayment.paid_amount || null,
        total_price_numeric: numericTotalPrice,
        paid_amount_numeric: numericPaidAmount,
      }).eq('id', editingPayment.id);
      
      if (error) throw error;
      setIsModalOpen(false);
      setEditingPayment(null);
      onRefresh?.();
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('Gagal menyimpan data pembayaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const processedBookings = bookings.map(b => {
    const total = parseCurrency(b.total_price_numeric ?? b.total_price);
    const paid = parseCurrency(b.paid_amount_numeric ?? b.paid_amount);
    const remains = total - paid;
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    
    if (total > 0) {
      if (remains <= 0) paymentStatus = 'paid';
      else if (paid > 0) paymentStatus = 'partial';
    }

    return { ...b, total, paid, remains, paymentStatus };
  });

  // Date filtering logic
  const filterByDate = (booking: typeof processedBookings[0]) => {
    if (dateFilter === 'all') return true;
    
    const bookingDate = new Date(booking.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const bookingDay = new Date(bookingDate);
      bookingDay.setHours(0, 0, 0, 0);
      return bookingDay.getTime() === today.getTime();
    }

    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    }

    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return bookingDate >= monthAgo;
    }

    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return bookingDate >= start && bookingDate <= end;
    }

    return true;
  };

  const filteredBookings = processedBookings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.package_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.paymentStatus === filterStatus;
    const matchesDate = filterByDate(b);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalOmzet = filteredBookings.reduce((acc, curr) => acc + curr.total, 0);
  const totalReceived = filteredBookings.reduce((acc, curr) => acc + curr.paid, 0);
  const totalReceivables = totalOmzet - totalReceived;

  const handleExportCSV = () => {
    const headers = ['No Invoice', 'Tanggal', 'Klien', 'WhatsApp', 'Paket', 'Total Biaya', 'Terbayar', 'Sisa Tagihan', 'Status'];
    const rows = filteredBookings.map(b => [
      `INV-${b.id.slice(0, 8).toUpperCase()}`,
      new Date(b.created_at).toLocaleDateString('id-ID'),
      b.name,
      b.whatsapp,
      b.package_name || '-',
      b.total,
      b.paid,
      b.remains,
      b.paymentStatus === 'paid' ? 'Lunas' : b.paymentStatus === 'partial' ? 'DP/Cicil' : 'Belum Bayar'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Finance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1F2021] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold mb-2">Total Pendapatan (Paid)</p>
            <h3 className="text-3xl font-bold">{formatRupiah(totalReceived)}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
              <CheckCircle2 size={14} /> Terkumpul
            </div>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Piutang Berjalan (Unpaid)</p>
          <h3 className="text-3xl font-bold text-red-500">{formatRupiah(totalReceivables)}</h3>
          <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 w-fit px-3 py-1 rounded-full">
            <AlertCircle size={14} /> Perlu Ditagih
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Target Omzet (Total)</p>
          <h3 className="text-3xl font-bold text-[#1F2021]">{formatRupiah(totalOmzet)}</h3>
          <div className="mt-4 flex items-center gap-2 text-blue-500 text-xs font-bold bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Receipt size={14} /> Proyeksi Akhir
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari klien atau paket..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1F2021] outline-none transition-all"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all text-sm font-bold uppercase tracking-widest"
          >
            <FileSpreadsheet size={18} />
            Export CSV
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center mr-2">
            Status:
          </div>
          {(['all', 'paid', 'partial', 'unpaid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
                filterStatus === status 
                ? 'bg-[#1F2021] text-white shadow-lg' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'paid' ? 'Lunas' : status === 'partial' ? 'DP' : 'Belum Bayar'}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center mr-2">
            <Calendar size={14} className="mr-1" />
            Periode:
          </div>
          {(['all', 'today', 'week', 'month', 'custom'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setDateFilter(period)}
              className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all ${
                dateFilter === period 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {period === 'all' ? 'Semua' : period === 'today' ? 'Hari Ini' : period === 'week' ? '7 Hari' : period === 'month' ? '30 Hari' : 'Custom'}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap gap-3 items-center bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600">Dari:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600">Sampai:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Finance Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                <th className="px-8 py-5">No. Invoice</th>
                <th className="px-8 py-5">Klien & Paket</th>
                <th className="px-8 py-5">Total Biaya</th>
                <th className="px-8 py-5">Terbayar</th>
                <th className="px-8 py-5">Sisa Tagihan</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-400 italic">
                    Data keuangan tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs text-gray-400">
                      INV-{b.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-[#1F2021]">{b.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{b.package_name}</div>
                    </td>
                    <td className="px-8 py-5 font-bold">{formatRupiah(b.total)}</td>
                    <td className="px-8 py-5 text-green-600 font-medium">{formatRupiah(b.paid)}</td>
                    <td className="px-8 py-5">
                      <span className={`font-bold ${b.remains > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                        {b.remains > 0 ? formatRupiah(b.remains) : 'LUNAS'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        b.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                        b.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          b.paymentStatus === 'paid' ? 'bg-green-500' :
                          b.paymentStatus === 'partial' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`} />
                        {b.paymentStatus === 'paid' ? 'Lunas' : b.paymentStatus === 'partial' ? 'DP / Cicil' : 'Tagihan'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Tandai Lunas — hanya muncul jika belum lunas */}
                        {b.paymentStatus !== 'paid' && b.total > 0 && (
                          <button
                            onClick={() => handleMarkLunas(b)}
                            disabled={markingLunas === b.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-green-100 disabled:opacity-50"
                            title="Tandai Lunas & Kirim WA"
                          >
                            <CheckCircle2 size={14} />
                            {markingLunas === b.id ? '...' : 'Lunas'}
                          </button>
                        )}
                        {/* WA Tagih Sisa — hanya jika ada sisa */}
                        {b.paymentStatus === 'partial' && b.whatsapp && (
                          <a
                            href={(() => {
                              let phone = b.whatsapp.replace(/\D/g, '');
                              if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                              const msg = `Halo Kak ${b.name} 👋\n\nKami ingin mengingatkan bahwa masih ada sisa tagihan sebesar *${formatRupiah(b.remains)}* untuk paket *${b.package_name || 'Photobooth'}* pada tanggal *${b.event_date}*.\n\nMohon segera dilunasi ya. Terima kasih 🙏`;
                              return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                            })()}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100"
                            title="WA Tagih Sisa Pembayaran"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            setShowPaymentHistory({
                              id: b.id,
                              name: b.name,
                              total: b.total,
                              paid: b.paid
                            });
                          }}
                          className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-purple-100"
                          title="Riwayat Pembayaran"
                        >
                          <History size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingPayment({
                              id: b.id,
                              name: b.name,
                              package_name: b.package_name,
                              total_price: formatRupiah(b.total),
                              paid_amount: formatRupiah(b.paid)
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit Pembayaran"
                        >
                          <Edit2 size={16} />
                        </button>
                        <a 
                          href={`/invoice/${b.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 p-2.5 bg-gray-50 text-[#1F2021] rounded-xl hover:bg-[#1F2021] hover:text-white transition-all shadow-sm"
                          title="Detail Invoice"
                        >
                          <FileText size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:block pr-1">Invoice</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Pembayaran */}
      <AnimatePresence>
        {isModalOpen && editingPayment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-[#1F2021]">
                    Catat Pembayaran
                  </h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    {editingPayment.name} - {editingPayment.package_name}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Total Biaya (Rp)</label>
                  <input
                    type="text"
                    value={editingPayment.total_price}
                    onChange={(e) => setEditingPayment({ ...editingPayment, total_price: formatRupiah(Number(e.target.value.replace(/\D/g, ''))) })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-mono"
                    placeholder="Contoh: Rp 2.500.000"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Sudah Dibayar / DP (Rp)</label>
                  <input
                    type="text"
                    value={editingPayment.paid_amount}
                    onChange={(e) => setEditingPayment({ ...editingPayment, paid_amount: formatRupiah(Number(e.target.value.replace(/\D/g, ''))) })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 transition-all font-mono text-green-600"
                    placeholder="Contoh: Rp 500.000"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPayment({ ...editingPayment, paid_amount: editingPayment.total_price })}
                    className="flex-1 bg-green-50 text-green-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors"
                  >
                    Set Lunas
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] flex items-center justify-center gap-2 bg-[#1F2021] text-white px-8 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {showPaymentHistory && (
          <PaymentHistory
            bookingId={showPaymentHistory.id}
            bookingName={showPaymentHistory.name}
            totalPrice={showPaymentHistory.total}
            paidAmount={showPaymentHistory.paid}
            onClose={() => setShowPaymentHistory(null)}
            onUpdate={() => {
              onRefresh?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceTab;
