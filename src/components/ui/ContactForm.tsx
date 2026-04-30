import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: 'Pertanyaan Umum',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert([formData]);

      if (error) throw error;
      
      setStatus('success');
      setFormData({ name: '', email: '', inquiry_type: 'Pertanyaan Umum', message: '' });
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      console.error('Error submitting message:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-white w-8 h-8" />
        </div>
        <h3 className="text-2xl md:text-3xl font-medium text-white mb-4 tracking-tight">Pesan Terkirim</h3>
        <p className="text-gray-400">Terima kasih telah menghubungi saya. Saya akan segera membalas pesan Anda.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-2xl max-w-xl w-full">
      <h3 className="text-2xl md:text-3xl font-medium text-white mb-8 tracking-tight">Kirim pesan</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-400 font-medium">Nama</label>
            <input 
              required
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-transparent border-b border-gray-700 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="John Doe"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-400 font-medium">Email</label>
            <input 
              required
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent border-b border-gray-700 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="inquiry_type" className="text-xs uppercase tracking-widest text-gray-400 font-medium">Tipe Pertanyaan</label>
          <select 
            id="inquiry_type"
            name="inquiry_type"
            value={formData.inquiry_type}
            onChange={handleChange}
            className="bg-[#1a1a1a] border-b border-gray-700 py-3 text-white focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none"
          >
            <option value="Pertanyaan Umum">Pertanyaan Umum</option>
            <option value="Komisi / Pemesanan">Komisi / Pemesanan</option>
            <option value="Pembelian Cetak">Pembelian Cetak</option>
            <option value="Kolaborasi">Kolaborasi</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-xs uppercase tracking-widest text-gray-400 font-medium">Pesan</label>
          <textarea 
            required
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="bg-transparent border-b border-gray-700 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
            placeholder="Ceritakan tentang proyek Anda..."
          />
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
        )}

        <div className="mt-8">
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="group w-full inline-flex items-center justify-between gap-4 bg-white text-[#1F2021] px-8 py-5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Mengirim...' : 'Kirim Pesan'}
            <div className={`w-8 h-8 rounded-full bg-[#1F2021]/10 flex items-center justify-center transition-transform ${status === 'submitting' ? 'animate-spin' : 'group-hover:translate-x-1'}`}>
              {status === 'submitting' ? <Loader2 size={16} /> : <ArrowRight size={16} />}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
