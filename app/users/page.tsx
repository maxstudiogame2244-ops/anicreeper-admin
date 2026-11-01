'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  History, 
  Bookmark, 
  Clock, 
  ChevronRight, 
  X, 
  RefreshCw,
  Tv,
  Flame,
  Sparkles,
  PlayCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'history'>('profiles');
  const [users, setUsers] = useState<any[]>([]);
  const [streamFeed, setStreamFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // User Details Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTab, setUserTab] = useState<'history' | 'watchlist'>('history');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsersAndHistory = async () => {
    setLoading(true);
    try {
      // 1. Fetch Registered Users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // 2. Fetch Live Stream Feed
      const { data: historyData } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setUsers(profilesData || []);
      setStreamFeed(historyData || []);
    } catch (e) {
      console.error('Failed to fetch users/history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndHistory();

    // Subscribe to realtime stream and user additions
    const channel = supabase
      .channel('users-history-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, () => {
        fetchUsersAndHistory();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsersAndHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openUserDetails = async (user: any) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    try {
      const { data: hist } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setHistoryItems(hist || []);

      const { data: mylist } = await supabase
        .from('mylist')
        .select('*')
        .eq('user_id', user.id)
        .limit(50);
      setWatchlistItems(mylist || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  const filteredStreams = streamFeed.filter((s) => {
    const term = search.toLowerCase();
    return (
      (s.title || '').toLowerCase().includes(term) ||
      (s.user_id || '').toLowerCase().includes(term) ||
      (s.show_title || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#00FF66]" />
            User Activity & Account Management
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Realtime monitoring of registered user accounts, active anime streamers, and watch histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, title, ID..."
              className="w-full bg-[#090E14] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={fetchUsersAndHistory}
            disabled={loading}
            className="p-2.5 bg-[#121B24] hover:bg-[#162330] border border-white/10 hover:border-[#00FF66]/40 rounded-xl text-white transition-all shadow-sm shrink-0"
            title="Refresh Users"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00FF66]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profiles'
              ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Flame className="w-4 h-4" />
          Live Stream Sessions ({streamFeed.length})
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'profiles' ? (
        <div className="bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-12 text-center text-white/40 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Loading user profiles...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs">
              {users.length === 0 
                ? 'No registered profiles in Supabase yet. Users appear here when they sign in.'
                : 'No users matching your search term.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E151E] text-white/50 uppercase font-semibold border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">User ID</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-bold text-xs">
                            {(u.username || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{u.username || 'Anonymous User'}</div>
                            <div className="text-[11px] text-white/40">{u.email || 'No email synced'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-white/60">
                        {u.id.substring(0, 16)}...
                      </td>
                      <td className="px-5 py-4 text-white/50 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="px-3 py-1.5 bg-[#121B24] hover:bg-[#192430] border border-white/10 hover:border-[#00FF66]/40 rounded-lg text-white/80 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00FF66]" />
                          Inspect Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Live Stream Activity Feed */
        <div className="bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 bg-[#0E151E] border-b border-white/10 flex items-center justify-between text-xs text-white/50">
            <span className="font-semibold uppercase tracking-wider">Live Stream Activity</span>
            <span className="flex items-center gap-1.5 text-[#00FF66] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
              Real-time feed
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-white/40 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Loading live activity...
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="p-12 text-center text-white/40 text-xs">
              No stream events logged yet. Plays from the Android and TV apps will appear here live.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredStreams.map((s) => (
                <div key={s.id || Math.random()} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66]">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{s.title || s.show_title || 'Anime Stream'}</span>
                        {s.episode && (
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70">
                            Ep {s.episode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5 flex items-center gap-2">
                        <span>User: {s.user_id ? s.user_id.substring(0, 12) + '...' : 'Guest Session'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.created_at ? new Date(s.created_at).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#111822] border border-[#00FF66]/20 text-[#00FF66] font-mono text-[11px]">
                    1080p Stream
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Details Slide-out / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#090E14] border border-[#00FF66]/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,102,0.15)] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] font-bold text-sm">
                  {(selectedUser.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedUser.username || 'User Profile'}</h2>
                  <p className="text-[11px] text-white/40 font-mono">{selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-white/5 bg-[#0E151E]">
              <button
                onClick={() => setUserTab('history')}
                className={`text-xs font-bold transition-colors pb-1 border-b-2 ${
                  userTab === 'history'
                    ? 'border-[#00FF66] text-[#00FF66]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Watch History ({historyItems.length})
              </button>
              <button
                onClick={() => setUserTab('watchlist')}
                className={`text-xs font-bold transition-colors pb-1 border-b-2 ${
                  userTab === 'watchlist'
                    ? 'border-[#00FF66] text-[#00FF66]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Saved Watchlist ({watchlistItems.length})
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {loadingDetails ? (
                <div className="p-8 text-center text-white/40 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Fetching user activity...
                </div>
              ) : userTab === 'history' ? (
                historyItems.length === 0 ? (
                  <div className="p-8 text-center text-white/40 text-xs">No watch history entries found.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {historyItems.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tv className="w-4 h-4 text-[#00FF66]" />
                          <div>
                            <div className="text-xs font-bold text-white">{item.title || 'Anime'}</div>
                            <div className="text-[11px] text-white/40">Episode {item.episode || 1}</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-white/30 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                watchlistItems.length === 0 ? (
                  <div className="p-8 text-center text-white/40 text-xs">No saved watchlist entries.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {watchlistItems.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bookmark className="w-4 h-4 text-[#00FF66]" />
                          <div className="text-xs font-bold text-white">{item.title || 'Saved Anime'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
