import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Trash2, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Payment {
  id: string;
  invoice_id?: string;
  amount: number;
  payment_method: string;
  payment_proof_url?: string;
  payment_date: string;
  verified: boolean;
}

interface PaymentHistoryProps {
  bookingId: string;
  bookingName: string;
  totalPrice: number;
  paidAmount: number;
  onClose: () => void;
  onUpdate: () => void;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val);
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  bookingId,
  bookingName,
  totalPrice,
  paidAmount,
  onClose,
  onUpdate
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'transfer',
    payment_date: new Date().toISOString().split('T')[0],
    verified: true
  });

  useEffect(() => {
    fetchPayments();
  }, [bookingId]);

  const fetchPayments = async () => {
    try {
      // Query payments using booking_id
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        setPayments([]);
      } else {
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(newPayment.amount.replace(/\D/g, ''));
    if (amount <= 0) {
      alert('Jumlah pembayaran harus lebih dari 0');
      return;
    }

    try {
      const { error } = await supabase.from('payments').insert([{
        booking_id: bookingId, // Use booking_id instead of invoice_id
        amount,
        payment_method: newPayment.payment_method,
        payment_date: new Date(newPayment.payment_date).toISOString(),
        verified: newPayment.verified
      }]);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Update booking paid_amount
      const newTotalPaid = paidAmount + amount;
      const { error: updateError } = await supabase.from('bookings').update({
        paid_amount: formatRupiah(newTotalPaid),
        paid_amount_numeric: newTotalPaid
      }).eq('id', bookingId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      setNewPayment({
        amount: '',
        payment_method: 'transfer',
        payment_date: new Date().toISOString().split('T')[0],
        verified: true
      });
      setShowAddForm(false);
      fetchPayments();
      onUpdate();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(`Gagal menambahkan pembayaran: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (!window.confirm('Hapus catatan pembayaran ini?')) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id);

      if (error) throw error;

      // Update booking paid_amount
      const newTotalPaid = paidAmount - payment.amount;
      await supabase.from('bookings').update({
        paid_amount: formatRupiah(newTotalPaid),
        paid_amount_numeric: newTotalPaid
      }).eq('id', bookingId);

      fetchPayments();
      onUpdate();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Gagal menghapus pembayaran');
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalPrice - totalPayments;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1F2021]">
              Riwayat Pembayaran
            </h2>
            <p className="text-sm text-gray-600 mt-1">{bookingName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-[#1F2021] bg-white rounded-full shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
              <p className="text-lg font-bold text-[#1F2021]">{formatRupiah(totalPrice)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Terbayar</p>
              <p className="text-lg font-bold text-green-600">{formatRupiah(totalPayments)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Sisa</p>
              <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remaining > 0 ? formatRupiah(remaining) : 'LUNAS'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F2021] mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Add Payment Button */}
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl hover:bg-blue-100 transition-all mb-6 font-bold text-sm"
                >
                  <Plus size={18} />
                  Tambah Pembayaran Baru
                </button>
              )}

              {/* Add Payment Form */}
              {showAddForm && (
                <form onSubmit={handleAddPayment} className="bg-blue-50 p-6 rounded-xl mb-6 space-y-4">
                  <h3 className="font-bold text-[#1F2021] mb-4">Catat Pembayaran Baru</h3>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-2">Jumlah (Rp)</label>
                    <input
                      required
                      type="text"
                      value={newPayment.amount}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, '');
                        setNewPayment({ ...newPayment, amount: formatRupiah(Number(numeric)) });
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-2">Metode</label>
                      <select
                        value={newPayment.payment_method}
                        onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="transfer">Transfer Bank</option>
                        <option value="cash">Tunai</option>
                        <option value="qris">QRIS</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-2">Tanggal</label>
                      <input
                        required
                        type="date"
                        value={newPayment.payment_date}
                        onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={newPayment.verified}
                      onChange={(e) => setNewPayment({ ...newPayment, verified: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="verified" className="text-sm text-gray-700">
                      Pembayaran sudah diverifikasi
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm"
                    >
                      <Save size={18} />
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              {/* Payment List */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
                  Riwayat Transaksi ({payments.length})
                </h3>
                
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada catatan pembayaran</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg text-[#1F2021]">
                              {formatRupiah(payment.amount)}
                            </span>
                            {payment.verified ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <Clock size={16} className="text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(payment.payment_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-lg font-medium">
                              {payment.payment_method === 'transfer' ? 'Transfer' :
                               payment.payment_method === 'cash' ? 'Tunai' :
                               payment.payment_method === 'qris' ? 'QRIS' : 'Lainnya'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePayment(payment)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentHistory;
