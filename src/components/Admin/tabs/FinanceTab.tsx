import React, { useState, useEffect } from 'react';
import {
  Wallet, Receipt, Search, CheckCircle2, AlertCircle,
  FileText, Edit2, Save, X, Calendar, FileSpreadsheet,
  History, MessageCircle, Plus, Trash2, TrendingUp,
  TrendingDown, BarChart3, ArrowUpCircle, ArrowDownCircle,
  Banknote, CreditCard, Smartphone, MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import PaymentHistory from '../PaymentHistory';

/* ─── Types ─────────────────────────────────────────────── */
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

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'qris' | 'other';
  transaction_date: string;
  notes?: string;
  created_at: string;
}

interface FinanceTabProps {
  bookings: Booking[];
  onRefresh?: () => void;
}

/* ─── Constants ──────────────────────────────────────────── */
const INCOME_CATEGORIES = ['Booking Photobooth', 'Sewa Alat', 'Jasa Edit Foto', 'Konsultasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Operasional', 'Gaji / Honor', 'Peralatan', 'Transport', 'Marketing', 'Sewa Tempat', 'Utilitas', 'Lainnya'];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tunai', icon: Banknote },
  { value: 'transfer', label: 'Transfer Bank', icon: CreditCard },
  { value: 'qris', label: 'QRIS', icon: Smartphone },
  { value: 'other', label: 'Lainnya', icon: MoreHorizontal },
] as const;

/* ─── Helpers ────────────────────────────────────────────── */
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const parseCurrency = (val?: string | number) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/\D/g, '')) || 0;
};

const fmtInputRupiah = (raw: string) => {
  const n = Number(raw.replace(/\D/g, ''));
  return n ? formatRupiah(n) : '';
};

/* ─── Sub-tab: Tagihan Booking ───────────────────────────── */
const BookingInvoicesTab: React.FC<{ bookings: Booking[]; onRefresh?: () => void }> = ({ bookings, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState<any>(null);
  const [markingLunas, setMarkingLunas] = useState<string | null>(null);

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

  const filterByDate = (b: typeof processedBookings[0]) => {
    if (dateFilter === 'all') return true;
    const d = new Date(b.created_at);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (dateFilter === 'today') { const dd = new Date(d); dd.setHours(0,0,0,0); return dd.getTime() === today.getTime(); }
    if (dateFilter === 'week') { const w = new Date(today); w.setDate(w.getDate()-7); return d >= w; }
    if (dateFilter === 'month') { const m = new Date(today); m.setMonth(m.getMonth()-1); return d >= m; }
    if (dateFilter === 'custom' && customStart && customEnd) {
      const s = new Date(customStart); const e = new Date(customEnd); e.setHours(23,59,59,999);
      return d >= s && d <= e;
    }
    return true;
  };

  const filtered = processedBookings.filter(b => {
    const ms = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.package_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return ms && (filterStatus === 'all' || b.paymentStatus === filterStatus) && filterByDate(b);
  });

  const totalOmzet = filtered.reduce((a, c) => a + c.total, 0);
  const totalReceived = filtered.reduce((a, c) => a + c.paid, 0);
  const totalReceivables = totalOmzet - totalReceived;

  const handleMarkLunas = async (b: typeof processedBookings[0]) => {
    if (!window.confirm(`Tandai booking ${b.name} sebagai LUNAS?\n\nTotal: ${formatRupiah(b.total)}`)) return;
    setMarkingLunas(b.id);
    try {
      await supabase.from('bookings').update({ paid_amount: formatRupiah(b.total), paid_amount_numeric: b.total, status: 'confirmed' }).eq('id', b.id);

      if (b.remains > 0) {
        // Insert ke payments
        await supabase.from('payments').insert([{
          booking_id: b.id, amount: b.remains, payment_method: 'transfer',
          payment_date: new Date().toISOString(), verified: true
        }]);

        // Sync ke transactions sebagai pemasukan pelunasan
        await supabase.from('transactions').insert([{
          type: 'income',
          category: 'Booking Photobooth',
          description: `Pelunasan booking — ${b.name}`,
          amount: b.remains,
          payment_method: 'transfer',
          transaction_date: new Date().toISOString().split('T')[0],
          notes: `Booking ID: ${b.id.slice(0, 8).toUpperCase()} | Paket: ${b.package_name || '-'}`,
        }]);
      }

      onRefresh?.();
      let phone = b.whatsapp.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      const msg = `Halo Kak ${b.name} 👋\n\nTerima kasih atas pelunasan pembayaran untuk paket *${b.package_name || 'Photobooth'}* pada tanggal *${b.event_date}*.\n\nPembayaran Anda sebesar *${formatRupiah(b.total)}* telah kami terima dan booking Anda sudah berstatus *LUNAS* ✅\n\nKami akan segera berkoordinasi menjelang hari H. Sampai jumpa! 🎉`;
      if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) { console.error(err); alert('Gagal menandai lunas.'); }
    finally { setMarkingLunas(null); }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setIsSaving(true);
    const numTotal = Number(editingPayment.total_price.replace(/\D/g, ''));
    const numPaid = Number(editingPayment.paid_amount.replace(/\D/g, ''));
    try {
      await supabase.from('bookings').update({
        total_price: editingPayment.total_price, paid_amount: editingPayment.paid_amount,
        total_price_numeric: numTotal, paid_amount_numeric: numPaid
      }).eq('id', editingPayment.id);

      // Hapus semua payments lama lalu buat satu record baru
      await supabase.from('payments').delete().eq('booking_id', editingPayment.id);
      if (numPaid > 0) {
        await supabase.from('payments').insert([{
          booking_id: editingPayment.id, amount: numPaid, payment_method: 'transfer',
          payment_date: new Date().toISOString(), verified: true
        }]);
      }

      // Hapus semua transaksi lama terkait booking ini, lalu buat ulang
      await supabase.from('transactions')
        .delete()
        .eq('type', 'income')
        .ilike('notes', `%${editingPayment.id.slice(0, 8).toUpperCase()}%`);

      if (numPaid > 0) {
        await supabase.from('transactions').insert([{
          type: 'income',
          category: 'Booking Photobooth',
          description: `Pembayaran booking — ${editingPayment.name}`,
          amount: numPaid,
          payment_method: 'transfer',
          transaction_date: new Date().toISOString().split('T')[0],
          notes: `Booking ID: ${editingPayment.id.slice(0, 8).toUpperCase()} | Paket: ${editingPayment.package_name || '-'}`,
        }]);
      }

      setIsModalOpen(false); setEditingPayment(null); onRefresh?.();
    } catch (err) { console.error(err); alert('Gagal menyimpan.'); }
    finally { setIsSaving(false); }
  };

  const handleExportCSV = () => {
    const headers = ['No Invoice','Tanggal','Klien','WhatsApp','Paket','Total Biaya','Terbayar','Sisa Tagihan','Status'];
    const rows = filtered.map(b => [`INV-${b.id.slice(0,8).toUpperCase()}`, new Date(b.created_at).toLocaleDateString('id-ID'), b.name, b.whatsapp, b.package_name||'-', b.total, b.paid, b.remains, b.paymentStatus==='paid'?'Lunas':b.paymentStatus==='partial'?'DP/Cicil':'Belum Bayar']);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}));
    a.download = `Tagihan-Booking-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 md:mx-0 md:px-0 md:pb-0 md:gap-5 md:grid md:grid-cols-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start bg-[#1F2021] text-white p-4 md:p-7 rounded-[1.5rem] shadow-xl relative overflow-hidden">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-60 font-bold mb-1.5 md:mb-2">Total Terbayar</p>
          <h3 className="text-xl md:text-3xl font-bold">{formatRupiah(totalReceived)}</h3>
          <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-green-400 text-[10px] md:text-xs font-bold bg-white/10 w-fit px-2.5 md:px-3 py-1 rounded-full"><CheckCircle2 size={12} className="md:w-[13px] md:h-[13px]"/> Terkumpul</div>
          <Wallet className="absolute -right-3 -bottom-3 md:-right-4 md:-bottom-4 text-white/5 w-20 h-20 md:w-28 md:h-28 rotate-12"/>
        </div>
        <div className="min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start bg-white p-4 md:p-7 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1.5 md:mb-2">Piutang Berjalan</p>
          <h3 className="text-xl md:text-3xl font-bold text-red-500">{formatRupiah(totalReceivables)}</h3>
          <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-red-500 text-[10px] md:text-xs font-bold bg-red-50 w-fit px-2.5 md:px-3 py-1 rounded-full"><AlertCircle size={12} className="md:w-[13px] md:h-[13px]"/> Perlu Ditagih</div>
        </div>
        <div className="min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start bg-white p-4 md:p-7 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1.5 md:mb-2">Target Omzet</p>
          <h3 className="text-xl md:text-3xl font-bold text-[#1F2021]">{formatRupiah(totalOmzet)}</h3>
          <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-blue-500 text-[10px] md:text-xs font-bold bg-blue-50 w-fit px-2.5 md:px-3 py-1 rounded-full"><Receipt size={12} className="md:w-[13px] md:h-[13px]"/> Proyeksi</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input type="text" placeholder="Cari klien atau paket..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1F2021] outline-none"/>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 text-xs font-bold uppercase tracking-widest">
            <FileSpreadsheet size={16}/> Export CSV
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center mr-1">Status:</span>
          {(['all','paid','partial','unpaid'] as const).map(s => (
            <button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${filterStatus===s?'bg-[#1F2021] text-white':'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
              {s==='all'?'Semua':s==='paid'?'Lunas':s==='partial'?'DP':'Belum Bayar'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1 mr-1"><Calendar size={13}/> Periode:</span>
          {(['all','today','week','month','custom'] as const).map(p => (
            <button key={p} onClick={()=>setDateFilter(p)} className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${dateFilter===p?'bg-blue-500 text-white':'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
              {p==='all'?'Semua':p==='today'?'Hari Ini':p==='week'?'7 Hari':p==='month'?'30 Hari':'Custom'}
            </button>
          ))}
        </div>
        {dateFilter==='custom' && (
          <div className="flex flex-wrap gap-3 items-center bg-blue-50 p-3 rounded-xl">
            <div className="flex items-center gap-2"><label className="text-xs font-bold text-gray-600">Dari:</label><input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"/></div>
            <div className="flex items-center gap-2"><label className="text-xs font-bold text-gray-600">Sampai:</label><input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"/></div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                <th className="px-6 py-4">No. Invoice</th><th className="px-6 py-4">Klien & Paket</th>
                <th className="px-6 py-4">Total</th><th className="px-6 py-4">Terbayar</th>
                <th className="px-6 py-4">Sisa</th><th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400 italic">Data tidak ditemukan.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">INV-{b.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-6 py-4"><div className="font-bold text-[#1F2021]">{b.name}</div><div className="text-[10px] text-gray-400 uppercase">{b.package_name}</div></td>
                  <td className="px-6 py-4 font-bold">{formatRupiah(b.total)}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{formatRupiah(b.paid)}</td>
                  <td className="px-6 py-4"><span className={`font-bold ${b.remains>0?'text-red-500':'text-gray-300'}`}>{b.remains>0?formatRupiah(b.remains):'LUNAS'}</span></td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${b.paymentStatus==='paid'?'bg-green-50 text-green-600':b.paymentStatus==='partial'?'bg-blue-50 text-blue-600':'bg-red-50 text-red-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${b.paymentStatus==='paid'?'bg-green-500':b.paymentStatus==='partial'?'bg-blue-500':'bg-red-500'}`}/>
                      {b.paymentStatus==='paid'?'Lunas':b.paymentStatus==='partial'?'DP / Cicil':'Tagihan'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {b.paymentStatus!=='paid' && b.total>0 && (
                        <button onClick={()=>handleMarkLunas(b)} disabled={markingLunas===b.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-600 hover:text-white text-[10px] font-black uppercase tracking-widest border border-green-100 disabled:opacity-50">
                          <CheckCircle2 size={13}/>{markingLunas===b.id?'...':'Lunas'}
                        </button>
                      )}
                      {b.paymentStatus==='partial' && b.whatsapp && (
                        <a href={(() => { let p=b.whatsapp.replace(/\D/g,''); if(p.startsWith('0'))p='62'+p.slice(1); const m=`Halo Kak ${b.name} 👋\n\nMasih ada sisa tagihan *${formatRupiah(b.remains)}* untuk paket *${b.package_name||'Photobooth'}* tgl *${b.event_date}*.\n\nMohon segera dilunasi ya 🙏`; return `https://wa.me/${p}?text=${encodeURIComponent(m)}`; })()} target="_blank" rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl border border-transparent hover:border-green-100"><MessageCircle size={15}/></a>
                      )}
                      <button onClick={()=>setShowPaymentHistory({id:b.id,name:b.name,total:b.total,paid:b.paid})}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl border border-transparent hover:border-purple-100"><History size={15}/></button>
                      <button onClick={()=>{setEditingPayment({id:b.id,name:b.name,package_name:b.package_name,total_price:formatRupiah(b.total),paid_amount:formatRupiah(b.paid)});setIsModalOpen(true);}}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100"><Edit2 size={15}/></button>
                      <a href={`/invoice/${b.id}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 p-2 bg-gray-50 text-[#1F2021] rounded-xl hover:bg-[#1F2021] hover:text-white">
                        <FileText size={15}/><span className="text-[10px] font-bold uppercase hidden group-hover:block pr-1">Invoice</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      <AnimatePresence>
        {isModalOpen && editingPayment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div><h2 className="text-base font-bold text-[#1F2021]">Edit Pembayaran</h2><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{editingPayment.name} — {editingPayment.package_name}</p></div>
                <button onClick={()=>setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm"><X size={16}/></button>
              </div>
              <form onSubmit={handleSavePayment} className="p-6 space-y-5">
                <div><label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1.5 font-bold">Total Biaya (Rp)</label>
                  <input type="text" value={editingPayment.total_price} onChange={e=>setEditingPayment({...editingPayment,total_price:fmtInputRupiah(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] font-mono"/></div>
                <div><label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1.5 font-bold">Sudah Dibayar / DP (Rp)</label>
                  <input type="text" value={editingPayment.paid_amount} onChange={e=>setEditingPayment({...editingPayment,paid_amount:fmtInputRupiah(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 font-mono text-green-600"/></div>
                <div className="pt-3 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={()=>setEditingPayment({...editingPayment,paid_amount:editingPayment.total_price})}
                    className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100">Set Lunas</button>
                  <button type="submit" disabled={isSaving} className="flex-[2] flex items-center justify-center gap-2 bg-[#1F2021] text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase disabled:opacity-50">
                    <Save size={16}/>{isSaving?'Menyimpan...':'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentHistory && (
          <PaymentHistory bookingId={showPaymentHistory.id} bookingName={showPaymentHistory.name} totalPrice={showPaymentHistory.total} paidAmount={showPaymentHistory.paid}
            onClose={()=>setShowPaymentHistory(null)} onUpdate={()=>onRefresh?.()}/>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Sub-tab: Pemasukan & Pengeluaran ───────────────────── */
const TransactionsTab: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [form, setForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    payment_method: 'cash' as Transaction['payment_method'],
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { initSync(); }, []);

  // Saat tab dibuka: sync semua booking yang sudah punya pembayaran
  // tapi belum tercatat di tabel transactions
  const initSync = async () => {
    setLoading(true);
    try {
      // Ambil semua booking yang sudah ada pembayaran
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, name, package_name, paid_amount_numeric, paid_amount, created_at')
        .gt('paid_amount_numeric', 0);

      if (bookings && bookings.length > 0) {
        // Ambil semua notes dari transactions yang sudah ada (untuk cek duplikat)
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('notes')
          .eq('type', 'income')
          .eq('category', 'Booking Photobooth');

        const existingNotes = new Set((existingTx || []).map(t => t.notes || ''));

        // Filter booking yang belum punya transaksi
        const toInsert = bookings
          .filter(b => {
            const noteKey = `Booking ID: ${b.id.slice(0, 8).toUpperCase()}`;
            // Cek apakah sudah ada transaksi dengan notes yang mengandung booking ID ini
            return ![...existingNotes].some(n => n.includes(noteKey));
          })
          .map(b => {
            const paid = typeof b.paid_amount_numeric === 'number'
              ? b.paid_amount_numeric
              : Number((b.paid_amount || '').replace(/\D/g, '')) || 0;
            return {
              type: 'income' as const,
              category: 'Booking Photobooth',
              description: `Pembayaran booking — ${b.name}`,
              amount: paid,
              payment_method: 'transfer' as const,
              transaction_date: b.created_at
                ? new Date(b.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              notes: `Booking ID: ${b.id.slice(0, 8).toUpperCase()} | Paket: ${b.package_name || '-'}`,
            };
          });

        if (toInsert.length > 0) {
          await supabase.from('transactions').insert(toInsert);
        }
      }
    } catch (err) {
      console.error('Sync error:', err);
    }
    await fetchTransactions();
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount.replace(/\D/g, ''));
    if (!amount || !form.category || !form.description) { alert('Lengkapi semua field wajib.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        type: form.type, category: form.category, description: form.description,
        amount, payment_method: form.payment_method,
        transaction_date: form.transaction_date, notes: form.notes || null,
      }]);
      if (error) throw error;
      setForm({ type: 'income', category: '', description: '', amount: '', payment_method: 'cash', transaction_date: new Date().toISOString().split('T')[0], notes: '' });
      setShowForm(false);
      fetchTransactions();
    } catch (err: any) { alert(`Gagal menyimpan: ${err.message}`); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    setDeletingId(id);
    await supabase.from('transactions').delete().eq('id', id);
    setDeletingId(null);
    fetchTransactions();
  };

  const filtered = transactions.filter(t => filterType === 'all' || t.type === filterType);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const pmIcon = (pm: string) => {
    const found = PAYMENT_METHODS.find(p => p.value === pm);
    return found ? found.label : pm;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 md:mx-0 md:px-0 md:pb-0 md:gap-5 md:grid md:grid-cols-3 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start bg-white p-4 md:p-7 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1.5 md:mb-2">Total Pemasukan</p>
          <h3 className="text-xl md:text-3xl font-bold text-green-600">{formatRupiah(totalIncome)}</h3>
          <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-green-600 text-[10px] md:text-xs font-bold bg-green-50 w-fit px-2.5 md:px-3 py-1 rounded-full"><ArrowUpCircle size={12} className="md:w-[13px] md:h-[13px]"/> Masuk</div>
        </div>
        <div className="min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start bg-white p-4 md:p-7 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1.5 md:mb-2">Total Pengeluaran</p>
          <h3 className="text-xl md:text-3xl font-bold text-red-500">{formatRupiah(totalExpense)}</h3>
          <div className="mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-red-500 text-[10px] md:text-xs font-bold bg-red-50 w-fit px-2.5 md:px-3 py-1 rounded-full"><ArrowDownCircle size={12} className="md:w-[13px] md:h-[13px]"/> Keluar</div>
        </div>
        <div className={`min-w-[200px] w-[80vw] md:w-auto md:min-w-0 flex-shrink-0 snap-start p-4 md:p-7 rounded-[1.5rem] border shadow-sm ${netBalance >= 0 ? 'bg-[#1F2021] text-white' : 'bg-white border-red-100'}`}>
          <p className={`text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 md:mb-2 ${netBalance >= 0 ? 'opacity-60' : 'text-gray-400'}`}>Saldo Bersih</p>
          <h3 className={`text-xl md:text-3xl font-bold ${netBalance < 0 ? 'text-red-500' : ''}`}>{formatRupiah(Math.abs(netBalance))}</h3>
          <div className={`mt-2.5 md:mt-3 flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold w-fit px-2.5 md:px-3 py-1 rounded-full ${netBalance >= 0 ? 'bg-white/10 text-green-400' : 'bg-red-50 text-red-500'}`}>
            {netBalance >= 0 ? <TrendingUp size={12} className="md:w-[13px] md:h-[13px]"/> : <TrendingDown size={12} className="md:w-[13px] md:h-[13px]"/>}
            {netBalance >= 0 ? 'Surplus' : 'Defisit'}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['all','income','expense'] as const).map(t => (
            <button key={t} onClick={()=>setFilterType(t)} className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${filterType===t?'bg-[#1F2021] text-white':'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>
              {t==='all'?'Semua':t==='income'?'Pemasukan':'Pengeluaran'}
            </button>
          ))}
        </div>
        <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1F2021] text-white rounded-xl text-sm font-bold hover:opacity-90">
          <Plus size={16}/> Tambah Transaksi
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setShowForm(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-base font-bold text-[#1F2021]">Tambah Transaksi</h2>
                <button onClick={()=>setShowForm(false)} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm"><X size={16}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                {/* Tipe */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['income','expense'] as const).map(t => (
                      <button key={t} type="button" onClick={()=>setForm({...form,type:t,category:''})}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${form.type===t?(t==='income'?'border-green-500 bg-green-50 text-green-700':'border-red-500 bg-red-50 text-red-700'):'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                        {t==='income'?<ArrowUpCircle size={16}/>:<ArrowDownCircle size={16}/>}
                        {t==='income'?'Pemasukan':'Pengeluaran'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Kategori <span className="text-red-400">*</span></label>
                  <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Deskripsi <span className="text-red-400">*</span></label>
                  <input required type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                    placeholder="cth. Pembayaran sewa venue" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none"/>
                </div>

                {/* Jumlah */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Jumlah (Rp) <span className="text-red-400">*</span></label>
                  <input required type="text" value={form.amount} onChange={e=>setForm({...form,amount:fmtInputRupiah(e.target.value)})}
                    placeholder="Rp 0" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none font-mono"/>
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.value} type="button" onClick={()=>setForm({...form,payment_method:pm.value})}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.payment_method===pm.value?'border-[#1F2021] bg-gray-50 text-[#1F2021]':'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                        <pm.icon size={15}/> {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Tanggal Transaksi</label>
                  <input type="date" value={form.transaction_date} onChange={e=>setForm({...form,transaction_date:e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none"/>
                </div>

                {/* Catatan */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Catatan (Opsional)</label>
                  <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}
                    placeholder="Catatan tambahan..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none resize-none"/>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200">Batal</button>
                  <button type="submit" disabled={saving} className="flex-[2] flex items-center justify-center gap-2 bg-[#1F2021] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                    <Save size={16}/>{saving?'Menyimpan...':'Simpan Transaksi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F2021] mx-auto"/></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Belum ada transaksi. Klik "Tambah Transaksi" untuk mulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${t.type==='income'?'bg-green-50':'bg-red-50'}`}>
                  {t.type==='income'?<ArrowUpCircle size={18} className="text-green-600"/>:<ArrowDownCircle size={18} className="text-red-500"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1F2021] text-sm">{t.description}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{t.category}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{pmIcon(t.payment_method)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(t.transaction_date).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'})}
                    {t.notes && <span className="ml-2 italic">· {t.notes}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold text-base ${t.type==='income'?'text-green-600':'text-red-500'}`}>
                    {t.type==='income'?'+':'-'}{formatRupiah(t.amount)}
                  </div>
                </div>
                <button onClick={()=>handleDelete(t.id)} disabled={deletingId===t.id}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                  <Trash2 size={15}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Sub-tab: Laporan Keseluruhan ───────────────────────── */
const ReportTab: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase.from('transactions').select('*').order('transaction_date', { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  const filterByPeriod = (dateStr: string, isPrev: boolean = false) => {
    const d = new Date(dateStr);
    const now = new Date();
    
    if (period === 'all') return !isPrev; // all period has no prev

    if (period === 'month') {
      const targetMonth = isPrev ? now.getMonth() - 1 : now.getMonth();
      const targetYear = isPrev && targetMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const m = targetMonth < 0 ? 11 : targetMonth;
      return d.getMonth() === m && d.getFullYear() === targetYear;
    }
    
    if (period === 'quarter') {
      let q = Math.floor(now.getMonth() / 3);
      let y = now.getFullYear();
      if (isPrev) {
        q -= 1;
        if (q < 0) { q = 3; y -= 1; }
      }
      return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === y;
    }
    
    if (period === 'year') {
      return d.getFullYear() === (isPrev ? now.getFullYear() - 1 : now.getFullYear());
    }
    return false;
  };

  const processedBookings = bookings.map(b => ({
    ...b,
    total: parseCurrency(b.total_price_numeric ?? b.total_price),
    paid: parseCurrency(b.paid_amount_numeric ?? b.paid_amount),
  }));

  // Current Period
  const filteredBookings = processedBookings.filter(b => filterByPeriod(b.created_at));
  const filteredTx = transactions.filter(t => filterByPeriod(t.transaction_date));

  // Previous Period
  const prevBookings = processedBookings.filter(b => filterByPeriod(b.created_at, true));
  const prevTx = transactions.filter(t => filterByPeriod(t.transaction_date, true));

  // Angka Utama - Current
  const bookingRevenue = filteredBookings.reduce((s, b) => s + b.paid, 0);
  const otherIncome = filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalIncome = bookingRevenue + otherIncome;
  const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const totalBookingTarget = filteredBookings.reduce((s, b) => s + b.total, 0);
  const totalReceivables = totalBookingTarget - bookingRevenue;

  // Angka Utama - Previous
  const prevBookingRev = prevBookings.reduce((s, b) => s + b.paid, 0);
  const prevOtherInc = prevTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevTotalIncome = prevBookingRev + prevOtherInc;
  const prevTotalExpense = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevNetProfit = prevTotalIncome - prevTotalExpense;

  const calcGrowth = (curr: number, prev: number) => {
    if (period === 'all') return null;
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const incGrowth = calcGrowth(totalIncome, prevTotalIncome);
  const expGrowth = calcGrowth(totalExpense, prevTotalExpense);
  const profitGrowth = calcGrowth(netProfit, prevNetProfit);

  const expenseByCategory = filteredTx.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const incomeByCategory = filteredTx.filter(t => t.type === 'income').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const byMethod = filteredTx.reduce((acc, t) => {
    const key = `${t.type}_${t.payment_method}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const periodLabel = period === 'month' ? 'Bulan Ini' : period === 'quarter' ? 'Kuartal Ini' : period === 'year' ? 'Tahun Ini' : 'Semua Waktu';

  const handleExportReport = () => {
    const expEntries: [string, number][] = Object.entries(expenseByCategory) as [string, number][];
    const lines: (string | number)[][] = [
      ['LAPORAN KEUANGAN', periodLabel],
      ['Tanggal Cetak', new Date().toLocaleDateString('id-ID')],
      [],
      ['=== RINGKASAN ==='],
      ['Pendapatan Booking', bookingRevenue],
      ['Pemasukan Lainnya', otherIncome],
      ['Total Pemasukan', totalIncome],
      ['Total Pengeluaran', totalExpense],
      ['Laba Bersih', netProfit],
      ['Piutang Booking', totalReceivables],
      [],
      ['=== DETAIL PENGELUARAN PER KATEGORI ==='],
      ...expEntries.map(([k, v]) => [k, v]),
      [],
      ['=== TRANSAKSI ==='],
      ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Metode', 'Jumlah'],
      ...filteredTx.map(t => [t.transaction_date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.category, t.description, t.payment_method, t.amount]),
    ];
    const csv = lines.map(r => Array.isArray(r) ? r.map(c => `"${c}"`).join(',') : '').join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `Laporan-Keuangan-${periodLabel.replace(/\s/g,'-')}-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const renderGrowth = (val: number | null, inverseBad: boolean = false) => {
    if (val === null) return null;
    const isPositive = val > 0;
    const isZero = val === 0;
    let isGood = isPositive;
    if (inverseBad) isGood = !isPositive; // for expenses, positive growth is "bad"
    
    return (
      <div className={`flex items-center gap-1 text-[10px] font-bold ${isZero ? 'text-gray-400' : isGood ? 'text-green-500' : 'text-red-500'}`}>
        {!isZero && (isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>)}
        <span>{isZero ? '0%' : `${Math.abs(val).toFixed(1)}%`} vs sblmnya</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {(['month','quarter','year','all'] as const).map(p => (
            <button key={p} onClick={()=>setPeriod(p)} className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all ${period===p?'bg-[#1F2021] text-white shadow-md':'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent'}`}>
              {p==='month'?'Bulan Ini':p==='quarter'?'Kuartal Ini':p==='year'?'Tahun Ini':'Semua'}
            </button>
          ))}
        </div>
        <button onClick={handleExportReport} className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 shadow-md transition-all">
          <FileSpreadsheet size={16}/> Export Laporan
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1F2021] mx-auto"/></div>
      ) : (
        <>
          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-[#1F2021] to-gray-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BarChart3 size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Search size={14}/> Ringkasan Eksekutif — {periodLabel}
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-gray-200 max-w-3xl">
                Periode ini, bisnis mencatat total pemasukan sebesar <strong className="text-white">{formatRupiah(totalIncome)}</strong> dan pengeluaran <strong className="text-white">{formatRupiah(totalExpense)}</strong>, 
                menghasilkan laba bersih sebesar <strong className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatRupiah(netProfit)}</strong>. 
                {totalReceivables > 0 && ` Terdapat piutang berjalan sebesar ${formatRupiah(totalReceivables)} yang perlu segera ditagihkan.`}
                {profitGrowth !== null && (
                  <span> Dibandingkan periode sebelumnya, laba bersih mengalami {profitGrowth > 0 ? 'kenaikan' : 'penurunan'} sebesar <strong className={profitGrowth > 0 ? 'text-green-400' : 'text-red-400'}>{Math.abs(profitGrowth).toFixed(1)}%</strong>.</span>
                )}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 lg:mx-0 lg:px-0 lg:pb-0 lg:gap-5 lg:grid lg:grid-cols-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { label: 'Total Pemasukan', value: totalIncome, growth: incGrowth, inverseBad: false, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: ArrowUpCircle },
              { label: 'Total Pengeluaran', value: totalExpense, growth: expGrowth, inverseBad: true, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: ArrowDownCircle },
              { label: 'Laba Bersih', value: netProfit, growth: profitGrowth, inverseBad: false, color: netProfit >= 0 ? 'text-[#1F2021]' : 'text-red-500', bg: netProfit >= 0 ? 'bg-gray-100' : 'bg-red-50', border: netProfit >= 0 ? 'border-gray-200' : 'border-red-200', icon: netProfit >= 0 ? TrendingUp : TrendingDown },
              { label: 'Piutang Berjalan', value: totalReceivables, growth: null, inverseBad: false, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', icon: AlertCircle },
            ].map(({ label, value, growth, inverseBad, color, bg, border, icon: Icon }) => (
              <div key={label} className={`min-w-[200px] w-[80vw] lg:w-auto lg:min-w-0 flex-shrink-0 snap-start bg-white p-4 lg:p-6 rounded-[1.5rem] border ${border} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={16} className={`lg:w-5 lg:h-5 ${color}`}/>
                  </div>
                  {renderGrowth(growth, inverseBad)}
                </div>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{label}</p>
                <p className={`text-xl lg:text-2xl font-bold tracking-tight ${color}`}>{formatRupiah(Math.abs(value))}</p>
              </div>
            ))}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sumber Pemasukan */}
            <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-6">Analisis Pemasukan</h3>
              <div className="space-y-5 flex-1">
                {/* Booking Revenue */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"/>
                      <span className="text-sm font-bold text-[#1F2021]">Booking Photobooth</span>
                    </div>
                    <span className="font-bold text-sm text-green-600">{formatRupiah(bookingRevenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalIncome > 0 ? (bookingRevenue / totalIncome) * 100 : 0}%` }}/>
                  </div>
                </div>

                {/* Other Incomes */}
                {(Object.entries(incomeByCategory) as [string, number][]).sort((a,b)=>b[1]-a[1]).map(([cat, val]) => (
                  <div key={cat}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-sm"/>
                        <span className="text-sm font-medium text-gray-600">{cat}</span>
                      </div>
                      <span className="font-bold text-sm text-green-600">{formatRupiah(val)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-300 rounded-full" style={{ width: `${totalIncome > 0 ? (val / totalIncome) * 100 : 0}%` }}/>
                    </div>
                  </div>
                ))}
                
                {Object.keys(incomeByCategory).length === 0 && bookingRevenue === 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
                    Belum ada data pemasukan.
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-7 -mb-7 p-6 rounded-b-3xl">
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Total Pemasukan</span>
                <span className="text-xl font-bold text-green-600">{formatRupiah(totalIncome)}</span>
              </div>
            </div>

            {/* Pengeluaran per Kategori */}
            <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-6">Analisis Pengeluaran</h3>
              <div className="space-y-5 flex-1">
                {Object.entries(expenseByCategory).length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
                    Belum ada data pengeluaran.
                  </div>
                ) : (Object.entries(expenseByCategory) as [string, number][]).sort((a,b)=>b[1]-a[1]).map(([cat, val]) => {
                  const pct = totalExpense > 0 ? (val / totalExpense) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"/>
                          <span className="text-sm font-medium text-gray-600">{cat}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 mr-2">{pct.toFixed(1)}%</span>
                          <span className="font-bold text-sm text-red-500">{formatRupiah(val)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-7 -mb-7 p-6 rounded-b-3xl">
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Total Pengeluaran</span>
                <span className="text-xl font-bold text-red-500">{formatRupiah(totalExpense)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Booking */}
            <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-5 flex items-center gap-2">
                <Receipt size={14}/> Status Tagihan Booking
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Booking', value: filteredBookings.length, sub: '', color: 'text-[#1F2021]', bg: 'bg-gray-50' },
                  { label: 'Lunas', value: filteredBookings.filter(b=>b.total>0&&b.total-b.paid<=0).length, sub: formatRupiah(filteredBookings.filter(b=>b.total>0&&b.total-b.paid<=0).reduce((s,b)=>s+b.total,0)), color: 'text-green-600', bg: 'bg-green-50/50' },
                  { label: 'DP / Cicil', value: filteredBookings.filter(b=>b.paid>0&&b.total-b.paid>0).length, sub: formatRupiah(filteredBookings.filter(b=>b.paid>0&&b.total-b.paid>0).reduce((s,b)=>s+b.paid,0)), color: 'text-blue-600', bg: 'bg-blue-50/50' },
                  { label: 'Belum Bayar', value: filteredBookings.filter(b=>b.paid===0).length, sub: formatRupiah(filteredBookings.filter(b=>b.paid===0).reduce((s,b)=>s+b.total,0)), color: 'text-red-500', bg: 'bg-red-50/50' },
                ].map(({ label, value, sub, color, bg }) => (
                  <div key={label} className={`${bg} p-5 rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow`}>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">{label}</p>
                    <p className={`text-3xl font-bold tracking-tight mb-1 ${color}`}>{value}</p>
                    {sub && <p className="text-[10px] font-bold text-gray-400">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-5 flex items-center gap-2">
                <CreditCard size={14}/> Preferensi Metode Pembayaran
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map(pm => {
                  const inc = byMethod[`income_${pm.value}`] || 0;
                  const exp = byMethod[`expense_${pm.value}`] || 0;
                  if (inc === 0 && exp === 0) return null;
                  return (
                    <div key={pm.value} className="bg-gray-50 p-5 rounded-2xl border border-gray-100/50 flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <pm.icon size={16} className="text-[#1F2021]"/>
                        </div>
                        <span className="text-xs font-bold text-[#1F2021] uppercase tracking-wide">{pm.label}</span>
                      </div>
                      <div className="space-y-1">
                        {inc > 0 && <div className="flex justify-between items-center text-xs"><span className="text-gray-500">Pemasukan</span><span className="text-green-600 font-bold">+{formatRupiah(inc)}</span></div>}
                        {exp > 0 && <div className="flex justify-between items-center text-xs"><span className="text-gray-500">Pengeluaran</span><span className="text-red-500 font-bold">-{formatRupiah(exp)}</span></div>}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(byMethod).length === 0 && (
                  <div className="col-span-full p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-sm border border-dashed border-gray-200">
                    Belum ada data metode pembayaran.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Main FinanceTab ────────────────────────────────────── */
const FinanceTab: React.FC<FinanceTabProps> = ({ bookings, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'transactions' | 'report'>('invoices');

  const SUB_TABS = [
    { key: 'invoices' as const, label: 'Tagihan Booking', icon: FileText },
    { key: 'transactions' as const, label: 'Pemasukan & Pengeluaran', icon: Wallet },
    { key: 'report' as const, label: 'Laporan Keseluruhan', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveSubTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === key ? 'bg-[#1F2021] text-white shadow-md' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
            <Icon size={14}/> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeSubTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {activeSubTab === 'invoices' && <BookingInvoicesTab bookings={bookings} onRefresh={onRefresh}/>}
          {activeSubTab === 'transactions' && <TransactionsTab/>}
          {activeSubTab === 'report' && <ReportTab bookings={bookings}/>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinanceTab;
