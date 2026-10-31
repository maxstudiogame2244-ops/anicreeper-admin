'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2, Check, X, Play, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RapidApiPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string; ms?: number }>>({});

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rapidapi_keys').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setKeys(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyValue) return;

    try {
      const { error } = await supabase.from('rapidapi_keys').insert({
        name: newKeyName,
        key: newKeyValue.trim(),
        is_active: true,
        request_count: 0,
      });
      if (error) throw error;
      setShowAddModal(false);
      setNewKeyName('');
      setNewKeyValue('');
      fetchKeys();
    } catch (e: any) {
      alert(e.message || 'Failed to add RapidAPI key');
    }
  };

  const handleToggleKey = async (id: string, currentState: boolean) => {
    try {
      await supabase.from('rapidapi_keys').update({ is_active: !currentState }).eq('id', id);
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to remove this key?')) return;
    try {
      await supabase.from('rapidapi_keys').delete().eq('id', id);
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestKey = async (id: string, apiKey: string) => {
    setTestingKeyId(id);
    const start = Date.now();
    try {
      const res = await fetch(`https://animeify-api.p.rapidapi.com/api/anime/search?q=Naruto`, {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'animeify-api.p.rapidapi.com',
        },
      });
      const ms = Date.now() - start;
      if (res.ok) {
        setTestResults((prev) => ({
          ...prev,
          [id]: { ok: true, message: `Healthy (${ms}ms) • 200 OK`, ms },
        }));
      } else {
        const text = await res.text();
        setTestResults((prev) => ({
          ...prev,
          [id]: { ok: false, message: `Failed (${res.status}): ${text.substring(0, 45)}` },
        }));
      }
    } catch (e: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: false, message: e.message || 'Connection timeout' },
      }));
    } finally {
      setTestingKeyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-[#00FF66]" />
            RapidAPI Key Management
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Manage the pool of keys powering Max DB. Requests auto-rotate between active keys to eliminate rate limits.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.35)] transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add RapidAPI Key
        </button>
      </div>

      {/* Keys List */}
      <div className="bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-white/40 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Loading RapidAPI keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">No keys found in database. Add one above.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {keys.map((k) => {
              const test = testResults[k.id];
              const isTesting = testingKeyId === k.id;
              return (
                <div key={k.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-white">{k.name}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          k.is_active
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        {k.is_active ? 'ACTIVE IN POOL' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-white/60 flex items-center gap-2">
                      <span className="text-[#00FF66]/80">{k.key.substring(0, 14)}••••••••••••••••••••••••</span>
                    </div>

                    {test && (
                      <div className={`text-xs mt-1 flex items-center gap-1.5 ${test.ok ? 'text-[#00FF66]' : 'text-red-400'}`}>
                        {test.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {test.message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => handleTestKey(k.id, k.key)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121B24] hover:bg-[#182430] border border-white/10 hover:border-[#00FF66]/40 rounded-lg text-xs font-semibold text-white transition-all"
                    >
                      <Play className={`w-3 h-3 ${isTesting ? 'animate-spin text-[#00FF66]' : 'text-[#00FF66]'}`} />
                      {isTesting ? 'Testing…' : 'Ping Test'}
                    </button>

                    <button
                      onClick={() => handleToggleKey(k.id, k.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        k.is_active
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/20 hover:bg-[#00FF66]/20'
                      }`}
                    >
                      {k.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#090E14] border border-[#00FF66]/30 rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-4">Add RapidAPI Key to Pool</h2>
            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Key Label</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. RapidAPI Key 3 (Backup)"
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">RapidAPI Token</label>
                <input
                  type="text"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Paste your key here..."
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  Add Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
