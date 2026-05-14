import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Typography from './Typography';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    inquiry_type: 'Pertanyaan Umum',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // 1. Prepare data for Supabase (merging location into message since location column doesn't exist)
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        inquiry_type: formData.inquiry_type,
        message: `Lokasi: ${formData.location}\n\n${formData.message}`
      };

      // 2. Save to Supabase
      const { error } = await supabase
        .from('messages')
        .insert([dataToSave]);

      if (error) throw error;

      // 3. Format WA message
      const waNumber = '62895406181407';
      const text = `Halo Admin,\n\nNama: ${formData.name}\nEmail: ${formData.email}\nLokasi: ${formData.location}\nTipe: ${formData.inquiry_type}\n\nPesan:\n${formData.message}`;
      const encodedText = encodeURIComponent(text);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

      // 4. Update status
      setStatus('success');

      // 5. Redirect to WhatsApp after a short delay
      setTimeout(() => {
        window.open(waUrl, '_blank');
        setIsOpen(false);
        setStatus('idle');
        setFormData({ name: '', email: '', location: '', inquiry_type: 'Pertanyaan Umum', message: '' });
      }, 2000);

    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-white text-[#1F2021] px-4 py-2 rounded-lg text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hubungi kami di WhatsApp
        </span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-24 right-6 z-[120] w-[90vw] md:w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-[#1F2021] text-white flex justify-between items-center">
                <div>
                  <Typography variant="label" className="text-gray-400 mb-1">WhatsApp Chat</Typography>
                  <Typography variant="h3" className="text-xl">Kirim Pesan</Typography>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {status === 'success' ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="text-[#25D366] w-8 h-8" />
                    </div>
                    <Typography variant="h3" className="mb-2">Berhasil!</Typography>
                    <Typography variant="p" className="text-sm">Pesan telah tersimpan. Membuka WhatsApp...</Typography>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Nama</label>
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Lokasi</label>
                      <input
                        required
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Jakarta"
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Tipe Pertanyaan</label>
                      <select
                        name="inquiry_type"
                        value={formData.inquiry_type}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors appearance-none cursor-pointer"
                      >
                        <option>Pertanyaan Umum</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Pesan</label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ceritakan tentang proyek Anda..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#25D366] transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full bg-[#25D366] text-white py-4 rounded-lg text-sm font-medium hover:bg-[#1eb954] transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                    >
                      {status === 'submitting' ? 'Mengirim...' : 'Kirim Ke WhatsApp'}
                      {status === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppWidget;
