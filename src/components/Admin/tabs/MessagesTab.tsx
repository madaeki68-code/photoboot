import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { MessageCircle, Filter } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

interface MessagesTabProps {
  messages: Message[];
}

const MessagesTab: React.FC<MessagesTabProps> = ({ messages }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const handleReplyWA = (msg: Message) => {
    const text = `Halo ${msg.name}, terima kasih telah menghubungi kami. Terkait pertanyaan Anda:\n\n"${msg.message}"\n\n`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('messages').update({ status }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (statusFilter !== 'all' && msg.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-gray-700">Filter Pesan</h3>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="unread">Belum Dibaca</option>
          <option value="read">Sudah Dibaca</option>
          <option value="archived">Diarsipkan</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium">Tanggal</th>
              <th className="p-6 font-medium">Nama</th>
              <th className="p-6 font-medium">Pertanyaan</th>
              <th className="p-6 font-medium">Pesan</th>
              <th className="p-6 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  {messages.length === 0 ? 'Belum ada pesan.' : 'Tidak ada pesan yang sesuai dengan filter.'}
                </td>
              </tr>
            ) : (
              filteredMessages.map((msg) => (
                <tr
                  key={msg.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-medium tracking-widest ${
                        msg.status === 'unread'
                          ? 'bg-red-50 text-red-600'
                          : msg.status === 'read'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500">
                    {new Date(msg.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-6">
                    <a
                      href={`mailto:${msg.email}`}
                      className="font-medium inline-flex flex-col hover:text-blue-600"
                    >
                      {msg.name}
                      <span className="text-xs text-gray-400 font-normal">{msg.email}</span>
                    </a>
                  </td>
                  <td className="p-6">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {msg.inquiry_type}
                    </span>
                  </td>
                  <td
                    className="p-6 max-w-xs truncate text-gray-600"
                    title={msg.message}
                  >
                    {msg.message}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => handleReplyWA(msg)}
                        className="text-xs font-medium text-green-600 hover:text-green-800 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex items-center gap-1.5"
                        title="Balas via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WA
                      </button>
                      {msg.status === 'unread' && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'read')}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          Dibaca
                        </button>
                      )}
                      {msg.status === 'read' && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, 'archived')}
                          className="text-xs font-medium text-gray-600 hover:text-gray-800 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          Arsip
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default MessagesTab;
