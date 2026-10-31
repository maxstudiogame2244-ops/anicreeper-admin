'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('max@anicreeper.bond');
  const [password, setPassword] = useState('ayat2244');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Direct verify against admin_users table in Supabase
      const { data, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (dbError) throw dbError;

      if (data && data.length > 0 && data[0].password_hash === password) {
        localStorage.setItem('anicreeper_admin_auth', JSON.stringify({ email, timestamp: Date.now() }));
        router.push('/');
        return;
      }

      // Fallback hardcoded validation
      if (email === 'max@anicreeper.bond' && password === 'ayat2244') {
        localStorage.setItem('anicreeper_admin_auth', JSON.stringify({ email, timestamp: Date.now() }));
        router.push('/');
        return;
      }

      setError('Invalid admin credentials. Please check your email and password.');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080B] flex items-center justify-center p-4">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00FF66]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#090E14] border border-[#00FF66]/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,255,102,0.15)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00FF66]/10 border border-[#00FF66] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,102,0.4)]">
            <ShieldCheck className="w-8 h-8 text-[#00FF66]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider flex items-center justify-center gap-2">
            ANICREEPER <span className="text-[#00FF66]">ADMIN</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">Authenticate to access AniCreeper Master Control</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                placeholder="admin@anicreeper.bond"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(0,255,102,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating…</span>
            ) : (
              <>
                Enter Master Control <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          AniCreeper Core Infrastructure • Neon v1.0
        </div>
      </div>
    </div>
  );
}
