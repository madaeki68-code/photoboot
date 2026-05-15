import React, { useState } from 'react';
import { CalendarCheck, X, Edit2, Trash2, Save, ExternalLink, MessageCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabase';

const formatRupiah = (val: string) => {
  if (!val) return '';
  const numeric = val.replace(/\D/g, '');
  if (!numeric) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(numeric));
};

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  event_category: string;
  event_date: string;
  package_name: string;
  promo_code: string;
  notes: string;
  payment_proof_url: string;
  status: string;
  created_at: string;
  addons?: string[];
  total_price?: string;
  paid_amount?: string;
}

interface BookingsTabProps {
  bookings: Booking[];
  onRefresh?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-600',
  confirmed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-600',
};

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onRefresh }) => {
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const filteredBookings = bookings.filter((bk) => {
    // Filter status
    const isCompleted = bk.status === 'completed';
    if (activeTab === 'active' && isCompleted) return false;
    if (activeTab === 'completed' && !isCompleted) return false;

    // Filter tanggal
    if (filterStartDate && new Date(bk.event_date) < new Date(filterStartDate)) return false;
    if (filterEndDate && new Date(bk.event_date) > new Date(filterEndDate)) return false;

    return true;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus data booking ini?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  const openModal = (bk: Booking) => {
    setEditingBooking({ ...bk });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingBooking(null);
    setIsModalOpen(false);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setIsSaving(true);
    try {
      const numericTotalPrice = editingBooking.total_price ? Number(editingBooking.total_price.replace(/\D/g, '')) : 0;
      const numericPaidAmount = editingBooking.paid_amount ? Number(editingBooking.paid_amount.replace(/\D/g, '')) : 0;

      const { error } = await supabase.from('bookings').update({
        status: editingBooking.status,
        name: editingBooking.name,
        whatsapp: editingBooking.whatsapp,
        package_name: editingBooking.package_name,
        event_date: editingBooking.event_date,
        location: editingBooking.location,
        notes: editingBooking.notes,
        total_price: editingBooking.total_price || null,
        paid_amount: editingBooking.paid_amount || null,
        total_price_numeric: numericTotalPrice,
        paid_amount_numeric: numericPaidAmount,
      }).eq('id', editingBooking.id);
      
      if (error) throw error;
      closeModal();
      onRefresh?.();
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateWaLink = (bk: Booking, templateType: 'konfirmasi' | 'followup' | 'pelunasan') => {
    if (!bk.whatsapp) return '#';
    let phone = bk.whatsapp.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    
    let message = '';
    if (templateType === 'konfirmasi') {
      message = `Halo Kak ${bk.name}, kami dari Photobooth.\n\nKami telah menerima pembayaran untuk booking paket *${bk.package_name}* pada tanggal *${bk.event_date}*.\n\nStatus booking kakak saat ini telah kami *Konfirmasi*. Tim kami akan segera berkoordinasi lebih lanjut menjelang hari H. Terima kasih!`;
    } else if (templateType === 'pelunasan') {
      const total = Number((bk.total_price || '').replace(/\D/g, ''));
      const paid = Number((bk.paid_amount || '').replace(/\D/g, ''));
      const sisa = total - paid;
      message = `Halo Kak ${bk.name} 👋\n\nTerima kasih atas pelunasan pembayaran untuk paket *${bk.package_name}* pada tanggal *${bk.event_date}*.\n\nPembayaran Anda sebesar *${formatRupiah(bk.total_price || '0')}* telah kami terima dan booking Anda sudah berstatus *LUNAS* ✅\n\nKami akan segera berkoordinasi menjelang hari H. Sampai jumpa! 🎉`;
    } else {
      message = `Halo Kak ${bk.name}, kami dari Photobooth.\n\nKami melihat ada booking untuk paket *${bk.package_name}* pada tanggal *${bk.event_date}*. Apakah kakak memiliki kendala terkait pembayaran? Jika ada pertanyaan, silakan hubungi kami ya.`;
    }
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const stats = [
    { label: 'Total Booking', value: bookings.length, color: 'bg-blue-500' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-orange-500' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-[#1F2021] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            Booking Aktif
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-[#1F2021] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          >
            Selesai
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Dari Tanggal</label>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Sampai Tanggal</label>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#1F2021] outline-none"
            />
          </div>
          {(filterStartDate || filterEndDate) && (
            <button 
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
              className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <CalendarCheck className="text-[#1F2021]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1F2021] uppercase">
                {activeTab === 'active' ? 'Data Booking Aktif' : 'Arsip Booking Selesai'}
              </h2>
              <p className="text-sm text-gray-500">Kelola pesanan dan status pembayaran</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-[#1F2021]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Masuk</th>
                <th className="p-6 font-bold">Nama</th>
                <th className="p-6 font-bold">WhatsApp</th>
                <th className="p-6 font-bold">Paket</th>
                <th className="p-6 font-bold">Tgl Acara</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarCheck className="text-gray-200" size={48} />
                      <p className="text-gray-400 font-medium">Tidak ada data ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => (
                  <tr
                    key={bk.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest ${
                          STATUS_STYLES[bk.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {bk.status}
                      </span>
                    </td>
                    <td className="p-6 text-gray-500 whitespace-nowrap font-medium">
                      {new Date(bk.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-6 font-bold whitespace-nowrap">{bk.name}</td>
                    <td className="p-6">
                      <a
                        href={generateWaLink(bk, 'followup')}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1F2021] hover:underline font-medium flex items-center gap-2"
                      >
                        {bk.whatsapp}
                      </a>
                    </td>
                    <td className="p-6">
                      <div className="text-xs">
                        <div className="font-bold mb-0.5 text-sm">{bk.package_name || '-'}</div>
                        {bk.addons && bk.addons.length > 0 && (
                          <div className="text-gray-400 truncate max-w-[150px]">+ {bk.addons.join(', ')}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 whitespace-nowrap text-gray-600 font-medium">{bk.event_date}</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {bk.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(bk.id, 'confirmed')}
                            className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#1F2021] px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                          >
                            Konfirmasi
                          </button>
                        )}
                        <button
                          onClick={() => openModal(bk)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Detail / Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(bk.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                        <a
                          href={`/invoice/${bk.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Lihat Invoice"
                        >
                          <ExternalLink size={16} />
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

      {/* ── Modal Edit Booking ── */}
      <AnimatePresence>
        {isModalOpen && editingBooking && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold tracking-tight text-[#1F2021]">
                  Detail Booking
                </h2>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
                {/* Form Sebelah Kiri */}
                <form id="booking-form" onSubmit={handleSaveBooking} className="flex-1 p-8 space-y-6 lg:border-r border-gray-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Status Booking</label>
                      <select
                        value={editingBooking.status}
                        onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-bold"
                      >
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="cancelled">CANCELLED</option>
                        <option value="completed">SELESAI</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Paket Utama</label>
                      <input
                        type="text"
                        value={editingBooking.package_name || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, package_name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Nama Klien</label>
                      <input
                        type="text"
                        value={editingBooking.name}
                        onChange={(e) => setEditingBooking({ ...editingBooking, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">No WhatsApp</label>
                      <input
                        type="text"
                        value={editingBooking.whatsapp}
                        onChange={(e) => setEditingBooking({ ...editingBooking, whatsapp: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Tanggal Acara</label>
                      <input
                        type="text"
                        value={editingBooking.event_date}
                        onChange={(e) => setEditingBooking({ ...editingBooking, event_date: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Lokasi</label>
                      <input
                        type="text"
                        value={editingBooking.location}
                        onChange={(e) => setEditingBooking({ ...editingBooking, location: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Catatan Khusus</label>
                    <textarea
                      rows={3}
                      value={editingBooking.notes || ''}
                      onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all"
                    />
                  </div>

                  <hr className="border-gray-100" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Total Biaya (Rp)</label>
                      <input
                        type="text"
                        value={editingBooking.total_price || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, total_price: formatRupiah(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-mono"
                        placeholder="Contoh: Rp 2.500.000"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Sudah Dibayar / DP (Rp)</label>
                      <input
                        type="text"
                        value={editingBooking.paid_amount || ''}
                        onChange={(e) => setEditingBooking({ ...editingBooking, paid_amount: formatRupiah(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1F2021] transition-all font-mono text-green-600"
                        placeholder="Contoh: Rp 500.000"
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Aksi Cepat</label>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBooking({ 
                              ...editingBooking, 
                              paid_amount: editingBooking.total_price,
                              status: 'confirmed'
                            });
                          }}
                          className="w-full bg-green-50 text-green-700 border border-green-100 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest font-black hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          SET LUNAS
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBooking({ 
                              ...editingBooking, 
                              status: 'completed'
                            });
                          }}
                          className="w-full bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-4 py-3 text-[10px] uppercase tracking-widest font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          SELESAIKAN BOOKING
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Sidebar Kanan (Info & Aksi) */}
                <div className="w-full lg:w-80 bg-gray-50 p-8 space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Ringkasan Pembayaran</h3>
                      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Total Biaya</span>
                          <span className="font-bold text-[#1F2021]">{editingBooking.total_price || 'Rp 0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 font-medium">Sudah Dibayar</span>
                          <span className="font-bold text-green-600">{editingBooking.paid_amount || 'Rp 0'}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sisa Tagihan</span>
                          <span className="font-bold text-xl text-red-500">
                            {(() => {
                              const total = Number((editingBooking.total_price || '').replace(/\D/g, ''));
                              const paid = Number((editingBooking.paid_amount || '').replace(/\D/g, ''));
                              const sisa = total - paid;
                              if (sisa <= 0 && total > 0) return 'LUNAS';
                              return formatRupiah(sisa.toString()) || 'Rp 0';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Bukti Pembayaran</h3>
                      {editingBooking.payment_proof_url ? (
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm relative group">
                          <img 
                            src={editingBooking.payment_proof_url} 
                            alt="Bukti Transfer" 
                            className="w-full aspect-auto max-h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a 
                              href={editingBooking.payment_proof_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-white flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/30"
                            >
                              <ExternalLink size={16} /> Buka Penuh
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-white rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-400 italic">
                          Belum ada bukti yang diunggah
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Addons Tambahan</h3>
                      {editingBooking.addons && editingBooking.addons.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-[#1F2021] font-medium space-y-1">
                          {editingBooking.addons.map((ad, i) => <li key={i}>{ad}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Tanpa Addons</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chat Klien</h3>
                    <a
                      href={generateWaLink(editingBooking, 'konfirmasi')}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-sm"
                    >
                      <MessageCircle size={16} /> WA Konfirmasi
                    </a>
                    {/* WA Pelunasan — tampil jika ada sisa tagihan */}
                    {(() => {
                      const total = Number((editingBooking.total_price || '').replace(/\D/g, ''));
                      const paid = Number((editingBooking.paid_amount || '').replace(/\D/g, ''));
                      const sisa = total - paid;
                      if (sisa > 0 && paid > 0) {
                        return (
                          <a
                            href={generateWaLink(editingBooking, 'pelunasan')}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-orange-100 transition-all shadow-sm"
                          >
                            <MessageCircle size={16} /> WA Tagih Sisa
                          </a>
                        );
                      }
                      if (sisa <= 0 && total > 0) {
                        return (
                          <a
                            href={generateWaLink(editingBooking, 'pelunasan')}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-green-100 transition-all shadow-sm"
                          >
                            <CheckCircle2 size={16} /> WA Konfirmasi Lunas
                          </a>
                        );
                      }
                      return null;
                    })()}
                    <a
                      href={generateWaLink(editingBooking, 'followup')}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#1F2021] px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <MessageCircle size={16} /> WA Follow-Up
                    </a>

                    <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-6">Aksi Tambahan</h3>
                    <a
                      href={`/invoice/${editingBooking.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-blue-100 transition-all shadow-sm"
                    >
                      <ExternalLink size={16} /> Lihat / Cetak Invoice
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white">
                <button
                  form="booking-form"
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-[#1F2021] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsTab;
