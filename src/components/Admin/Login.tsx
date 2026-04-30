import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg(error.message || 'Gagal masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center">
          <h1 className="text-4xl font-medium tracking-tighter mb-8 italic">moment / admin</h1>
          <p className="text-gray-500 mb-12">Silakan masuk untuk mengakses dasbor.</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2 block">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1F2021] text-white py-4 mt-4 rounded-full font-medium hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <LogIn size={20} />
            {loading ? 'Sedang masuk...' : 'Masuk'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

