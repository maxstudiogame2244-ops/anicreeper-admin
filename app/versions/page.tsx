'use client';

import React, { useEffect, useState } from 'react';
import { DownloadCloud, Plus, RefreshCw, Smartphone, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VersionsPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [versionCode, setVersionCode] = useState(2);
  const [versionName, setVersionName] = useState('1.0.1');
  const [releaseNotes, setReleaseNotes] = useState('Added Pengu and Max DB dual sources, fixed season episode browsing, instant buffering.');
  const [apkUrl, setApkUrl] = useState('https://anicreeper.bond/download/anicreeper-v1.0.1.apk');
  const [isMandatory, setIsMandatory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('version_code', { ascending: false });
      if (error) throw error;
      setVersions(data || []);
      if (data && data.length > 0) {
        setVersionCode((data[0].version_code || 1) + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionCode || !versionName || !apkUrl) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('app_versions').insert({
        version_code: versionCode,
        version_name: versionName,
        release_notes: releaseNotes,
        apk_url: apkUrl,
        is_mandatory: isMandatory,
      });
      if (error) throw error;
      fetchVersions();
      alert(`Release v${versionName} published! App users will now be prompted to update.`);
    } catch (e: any) {
      alert(e.message || 'Failed to publish release');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <DownloadCloud className="w-6 h-6 text-[#00FF66]" />
          App Versions & APK Release Manager
        </h1>
        <p className="text-sm text-white/50 mt-1">
          When the app version in Supabase is higher than the installed version, the app prompts users with an update modal and direct APK download link.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Release Form */}
        <div className="lg:col-span-6 bg-[#090E14] border border-[#00FF66]/30 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00FF66]" /> Publish New Android Release
          </h2>

          <form onSubmit={handleRelease} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Version Code (Integer)</label>
                <input
                  type="number"
                  value={versionCode}
                  onChange={(e) => setVersionCode(parseInt(e.target.value) || 1)}
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Version Name</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g. 1.0.1"
                  required
                  className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">APK Download URL (Cloudflare R2 / CDN)</label>
              <input
                type="url"
                value={apkUrl}
                onChange={(e) => setApkUrl(e.target.value)}
                placeholder="https://pub-xxxx.r2.dev/AniCreeper-v1.0.1.apk"
                required
                className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#00FF66] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Release Notes</label>
              <textarea
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
                placeholder="List key fixes and features..."
                required
                className="w-full bg-[#111822] border border-white/10 focus:border-[#00FF66] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#111822] border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="mandatory"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 accent-[#00FF66] rounded"
              />
              <label htmlFor="mandatory" className="text-xs text-white/80 cursor-pointer">
                <strong>Mandatory Update</strong> (Prevents users from skipping dialog)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Publishing Release…' : 'Publish Android Release'}
            </button>
          </form>

          {/* Cloudflare R2 Upload Helper */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00FF66]" /> Cloudflare R2 Upload Command
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              To host APKs at zero egress cost on Cloudflare R2, run wrangler CLI:
            </p>
            <div className="p-3 bg-[#05080B] border border-white/10 rounded-lg text-[11px] font-mono text-[#00FF66]/90 select-all overflow-x-auto">
              npx wrangler r2 object put anicreeper-apks/AniCreeper-v1.0.1.apk --file=./AniCreeper.apk
            </div>
          </div>
        </div>

        {/* Existing Releases Table */}
        <div className="lg:col-span-6 bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg h-fit">
          <div className="p-4 bg-[#0E151E] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Release History</h2>
            <button onClick={fetchVersions} className="text-white/40 hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00FF66]' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-white/40 text-xs">Loading releases...</div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-xs">No releases recorded yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {versions.map((v, i) => (
                <div key={v.id} className="p-4 space-y-1 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Version {v.version_name}</span>
                      <span className="text-[10px] font-mono bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
                        code {v.version_code}
                      </span>
                      {i === 0 && (
                        <span className="text-[9px] font-extrabold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 px-1.5 py-0.5 rounded uppercase">
                          LATEST LIVE
                        </span>
                      )}
                    </div>
                    {v.is_mandatory && (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{v.release_notes}</p>
                  <div className="text-[10px] text-[#00FF66]/80 font-mono truncate pt-1">
                    {v.apk_url}
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
