import React from 'react';
import { 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User, 
  Package, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Booking {
  id: string;
  name: string;
  package_name: string;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  name: string;
  inquiry_type: string;
  created_at: string;
}

interface TimelineTabProps {
  bookings: Booking[];
  messages: Message[];
}

const TimelineTab: React.FC<TimelineTabProps> = ({ bookings, messages }) => {
  // Combine and sort activities
  const activities = [
    ...bookings.map(b => ({
      id: b.id,
      type: 'booking',
      title: 'Booking Baru',
      description: `${b.name} memesan paket ${b.package_name}`,
      status: b.status,
      date: new Date(b.created_at),
      icon: Calendar,
      color: 'bg-blue-500'
    })),
    ...messages.map(m => ({
      id: m.id,
      type: 'message',
      title: 'Pesan Masuk',
      description: `Inquiry baru dari ${m.name} (${m.inquiry_type})`,
      status: 'unread',
      date: new Date(m.created_at),
      icon: MessageSquare,
      color: 'bg-purple-500'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F2021] uppercase">Garis Waktu Aktivitas</h2>
          <p className="text-sm text-gray-500">Pantau semua interaksi dan transaksi secara kronologis</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          <Clock size={14} /> Terakhir diperbarui: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100" />

        {activities.map((activity, i) => (
          <motion.div
            key={`${activity.type}-${activity.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-14"
          >
            {/* Dot */}
            <div className={`absolute left-0 top-0 w-11 h-11 rounded-full ${activity.color} flex items-center justify-center text-white shadow-lg border-4 border-white z-10`}>
              <activity.icon size={18} />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-[#1F2021]">{activity.title}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {activity.type === 'booking' ? 'E-Commerce' : 'Contact'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#1F2021]">
                      {activity.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {activity.date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-[#1F2021] group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {activity.type === 'booking' && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{activity.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Package size={14} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Layanan Foto</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Clock className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-medium">Belum ada aktivitas terekam.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineTab;
