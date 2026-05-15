import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import RevenueChart from '../RevenueChart';
import StatusPieChart from '../StatusPieChart';

interface Booking {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  event_category: string;
  event_date: string;
  package_name: string;
  status: string;
  total_price?: string;
  paid_amount?: string;
  total_price_numeric?: number;
  paid_amount_numeric?: number;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface OverviewTabProps {
  bookings: Booking[];
  messages: Message[];
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

const OverviewTab: React.FC<OverviewTabProps> = ({ bookings, messages }) => {
  // Calculations
  const totalRevenue = bookings.reduce((acc, curr) => acc + parseCurrency(curr.total_price_numeric ?? curr.total_price), 0);
  const totalPaid = bookings.reduce((acc, curr) => acc + parseCurrency(curr.paid_amount_numeric ?? curr.paid_amount), 0);
  const pendingReceivables = totalRevenue - totalPaid;
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const unreadMessages = messages.filter(m => m.status === 'unread').length;

  const stats = [
    {
      label: 'Total Omzet',
      value: formatRupiah(totalRevenue),
      subValue: 'Dari semua booking',
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Total Pendapatan',
      value: formatRupiah(totalPaid),
      subValue: 'Uang masuk',
      icon: Wallet,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'Piutang (Unpaid)',
      value: formatRupiah(pendingReceivables),
      subValue: 'Tagihan tersisa',
      icon: Clock,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      label: 'Total Booking',
      value: bookings.length.toString(),
      subValue: `${activeBookings} terkonfirmasi`,
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const recentBookings = [...bookings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 ${stat.textColor}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} className="mr-1" />
                +12%
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#1F2021]">{stat.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart bookings={bookings} />
        </div>
        <div>
          <StatusPieChart bookings={bookings} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#1F2021] uppercase">Booking Terbaru</h2>
            <button className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#1F2021] transition-colors">Lihat Semua</button>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="px-6 py-4">Klien</th>
                    <th className="px-6 py-4">Paket</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {recentBookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#1F2021]">{bk.name}</div>
                        <div className="text-[10px] text-gray-400">{bk.whatsapp}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{bk.package_name}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(bk.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter ${
                          bk.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                          bk.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-[#1F2021] uppercase">Notifikasi</h2>
          <div className="space-y-4">
            {unreadMessages > 0 && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-4">
                <div className="p-2 bg-red-500 rounded-xl text-white h-fit">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900">Pesan Belum Dibaca</h4>
                  <p className="text-xs text-red-700 mt-1">Ada {unreadMessages} pesan baru dari calon klien yang belum Anda respon.</p>
                </div>
              </div>
            )}
            
            {pendingBookings > 0 && (
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-4">
                <div className="p-2 bg-orange-500 rounded-xl text-white h-fit">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-orange-900">Booking Menunggu</h4>
                  <p className="text-xs text-orange-700 mt-1">Ada {pendingBookings} booking baru yang memerlukan konfirmasi pembayaran.</p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tips Vendor</h4>
              <p className="text-sm text-[#1F2021] leading-relaxed">
                Pastikan Anda selalu memperbarui status pembayaran di tab <span className="font-bold">Keuangan</span> untuk menjaga akurasi laporan pendapatan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
