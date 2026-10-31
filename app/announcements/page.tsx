'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle, AlertTriangle, Info, Bell, RefreshCw, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('info');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('View Details');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('app_announcements').insert({
        title,
        description,
        priority,
        action_url: actionUrl || null,
        action_label: actionLabel || 'View Details',
        is_active: true,
      });
      if (error) throw error;
      setTitle('');
      setDescription('');
      setActionUrl('');
      fetchAnnouncements();
    } catch (e: any) {
      alert(e.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await supabase.from('app_announcements').update({ is_active: !currentState }).eq('id', id);
      fetchAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await supabase.from('app_announcements').delete().eq('id', id);
      fetchAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Megaphone className="w-6 h-6 text-[#00FF66]" />
          In-App Announcement Notices
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Broadcast popups that appear upon opening the Android application, complete with a "Do not show again" checkbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Create Form & Live Mobile Mockup */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#090E14] border border-[#00FF66]/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#00FF66]" /> Create New Broadcast Notice
            </h2>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dual Source Engine Live!"
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Description / Message</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Write notice details that users will read..."
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Priority Style</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="info">Info (Green)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="update">Update Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="e.g. Learn More"
                    className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Action URL (Optional)</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://anicreeper.bond/news"
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Broadcasting…' : 'Publish Notice to Mobile App'}
              </button>
            </form>
          </div>

          {/* Live Mobile Dialog Preview */}
          <div className="bg-[#090E14] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-[#00FF66]" /> Live In-App Dialog Preview
            </div>

            <div className="p-4 bg-[#141419] border border-white/15 rounded-xl shadow-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#00FF66]/10 text-[#00FF66]">
                  {priority === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Megaphone className="w-4 h-4" />}
                </div>
                <div className="font-bold text-white text-sm">{title || 'Preview Title'}</div>
              </div>
              <div className="text-xs text-white/80 leading-relaxed">
                {description || 'This is how your notice will appear directly to users on startup.'}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px] text-white/60">
                <div className="w-3.5 h-3.5 rounded border border-white/30 flex items-center justify-center text-[8px] text-[#00FF66]">✓</div>
                <span>Do not show again</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-[11px] font-bold text-[#00FF66]">{actionLabel}</span>
                <span className="px-3 py-1 rounded bg-[#00FF66] text-black font-extrabold text-[11px]">Got it</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Existing Announcements Table */}
        <div className="lg:col-span-7 bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-[#0E151E] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Broadcast History</h2>
            <button onClick={fetchAnnouncements} className="text-white/40 hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00FF66]' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-white/40 text-xs">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs">No active notices found.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{a.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          a.is_active ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30' : 'bg-white/5 text-white/30'
                        }`}
                      >
                        {a.is_active ? 'LIVE ON APP' : 'MUTED'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed max-w-lg">{a.description}</p>
                    <div className="text-[10px] text-white/40 font-mono mt-1">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(a.id, a.is_active)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        a.is_active
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/20'
                      }`}
                    >
                      {a.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
