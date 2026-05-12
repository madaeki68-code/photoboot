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
      <div className="bg-white border border-primary/5 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="w-20 h-20 bg-bg-soft rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="text-accent w-10 h-10" />
        </div>
        <h3 className="text-3xl font-medium tracking-tighter italic text-primary mb-4">Message Received</h3>
        <p className="text-primary/60 font-medium tracking-tighter italic">Thank you for reaching out. We will respond shortly.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-primary/5 p-8 md:p-12 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">Your Name</label>
            <input 
              required
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-transparent border-b border-primary/10 py-4 text-primary focus:outline-none focus:border-accent transition-colors font-medium tracking-tighter italic text-lg"
              placeholder="e.g. Julianne Moore"
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">Email Address</label>
            <input 
              required
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent border-b border-primary/10 py-4 text-primary focus:outline-none focus:border-accent transition-colors font-medium tracking-tighter italic text-lg"
              placeholder="e.g. julianne@archive.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label htmlFor="inquiry_type" className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">Subject of Inquiry</label>
          <select 
            id="inquiry_type"
            name="inquiry_type"
            value={formData.inquiry_type}
            onChange={handleChange}
            className="bg-transparent border-b border-primary/10 py-4 text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none font-medium tracking-tighter italic text-lg"
          >
            <option value="Pertanyaan Umum">General Inquiry</option>
            <option value="Komisi / Pemesanan">Booking / Commission</option>
            <option value="Pembelian Cetak">Print Acquisition</option>
            <option value="Kolaborasi">Collaboration</option>
          </select>
        </div>

        <div className="flex flex-col gap-4">
          <label htmlFor="message" className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">Your Vision</label>
          <textarea 
            required
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="bg-transparent border-b border-primary/10 py-4 text-primary focus:outline-none focus:border-accent transition-colors resize-none font-medium tracking-tighter italic text-lg"
            placeholder="Tell us about your story..."
          />
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-xs italic font-medium tracking-tighter">{errorMessage}</p>
        )}

        <div className="mt-8">
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="group w-full flex items-center justify-between border border-primary/10 px-8 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-primary hover:text-white transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span>{status === 'submitting' ? 'Transmitting...' : 'Send Message'}</span>
            <div className={`transition-transform duration-500 ${status === 'submitting' ? 'animate-spin' : 'group-hover:translate-x-2'}`}>
              {status === 'submitting' ? <Loader2 size={16} /> : <ArrowRight size={16} />}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
