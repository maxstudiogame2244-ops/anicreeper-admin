'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Key, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setAdmins(data || []);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to fetch admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.from('admin_users').insert({
        email: email.trim().toLowerCase(),
        password_hash: password.trim(),
      }).select();

      if (error) throw error;

      setSuccessMsg(`Admin account "${email.trim()}" created successfully!`);
      setEmail('');
      setPassword('');
      fetchAdmins();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: any) => {
    if (admin.email === 'max@anicreeper.bond') {
      alert('The primary Super Admin (max@anicreeper.bond) is permanently protected and cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke admin access for "${admin.email}"?`)) return;

    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', admin.id);
      if (error) throw error;
      setSuccessMsg(`Revoked admin access for "${admin.email}".`);
      fetchAdmins();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to delete admin');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#00FF66]" />
            Admin Accounts & Permissions
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage authorized administrators with access to the AniCreeper master dashboard and cluster controls.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#121B24] hover:bg-[#162330] border border-white/10 hover:border-[#00FF66]/40 rounded-xl text-xs font-semibold text-white transition-all w-fit shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00FF66]' : ''}`} />
          Refresh List
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#00FF66]/10 border border-[#00FF66]/30 rounded-xl flex items-center gap-3 text-[#00FF66] text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Create Admin Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#090E14] border border-[#00FF66]/30 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-[#00FF66]" />
              </div>
              <h2 className="text-base font-bold text-white">Create New Admin Account</h2>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="newadmin@anicreeper.bond"
                    className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter secure password"
                    className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="Admin">Admin (Full Dashboard Access)</option>
                  <option value="Super Admin">Super Admin (Master Privileges)</option>
                  <option value="Moderator">Moderator (Notices & Streams)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#00FF66] hover:bg-[#00FF66]/90 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Authorize & Create Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Active Admins Table */}
        <div className="lg:col-span-7">
          <div className="bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Active Administrators</span>
                <span className="text-xs bg-[#00FF66]/15 text-[#00FF66] px-2 py-0.5 rounded-full font-mono font-bold">
                  {admins.length} Total
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-white/40 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Loading administrators...
              </div>
            ) : admins.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-xs">No admin accounts configured.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {admins.map((admin) => {
                  const isPrimary = admin.email === 'max@anicreeper.bond';
                  return (
                    <div key={admin.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isPrimary 
                            ? 'bg-[#00FF66]/10 border-[#00FF66]/40 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]' 
                            : 'bg-white/5 border-white/10 text-white/70'
                        }`}>
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{admin.email}</span>
                            {isPrimary && (
                              <span className="text-[10px] bg-[#00FF66] text-black font-extrabold px-1.5 py-0.5 rounded">
                                PRIMARY OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/40 mt-0.5">
                            Added {new Date(admin.created_at).toLocaleDateString()} at {new Date(admin.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#111822] border border-white/10 text-[#00FF66] font-mono">
                          {isPrimary ? 'Super Admin' : 'Admin'}
                        </span>

                        {!isPrimary ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="p-2 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-white/20 italic px-2">Protected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
