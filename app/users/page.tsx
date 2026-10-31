'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, History, Bookmark, BookOpen, Clock, ChevronRight, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTab, setUserTab] = useState<'history' | 'watchlist' | 'reading'>('history');

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const [readingItems, setReadingItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(50);
      if (error) throw error;
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUserDetails = async (user: any) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    try {
      // 1. Fetch Watch History
      const { data: hist } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);
      setHistoryItems(hist || []);

      // 2. Fetch Watchlist
      const { data: mylist } = await supabase
        .from('mylist')
        .select('*')
        .eq('user_id', user.id)
        .limit(25);
      setWatchlistItems(mylist || []);

      // 3. Fetch Reading History
      const { data: read } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .limit(25);
      setReadingItems(read || []);
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
      (u.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#00FF66]" />
            User Management & Activity
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Browse registered anime watchers, monitor watch history, saved lists, and reading sessions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or ID..."
            className="w-full bg-[#090E14] border border-white/10 focus:border-[#00FF66] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#090E14] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-white/40 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Loading user profiles...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">No users found.</div>
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
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openUserDetails(u)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#121B24] border border-[#00FF66]/30 flex items-center justify-center font-bold text-[#00FF66]">
                        {(u.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{u.username || 'Anonymous User'}</div>
                        <div className="text-[11px] text-white/40">{u.email || 'Registered User'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-white/40">{u.id}</td>
                    <td className="px-5 py-4 text-white/50">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="px-3 py-1.5 bg-[#121B24] hover:bg-[#1A2633] border border-white/10 hover:border-[#00FF66]/40 rounded-lg text-[11px] font-semibold text-[#00FF66] inline-flex items-center gap-1 transition-all">
                        View Activity <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#090E14] border border-[#00FF66]/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0E151E]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00FF66]/10 border border-[#00FF66] flex items-center justify-center font-bold text-[#00FF66]">
                  {(selectedUser.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedUser.username || 'User Profile'}</h2>
                  <div className="font-mono text-[11px] text-white/40">{selectedUser.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-5 pt-3 bg-[#090E14] gap-4">
              <button
                onClick={() => setUserTab('history')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  userTab === 'history'
                    ? 'border-[#00FF66] text-[#00FF66]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Watch History ({historyItems.length})
              </button>
              <button
                onClick={() => setUserTab('watchlist')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  userTab === 'watchlist'
                    ? 'border-[#00FF66] text-[#00FF66]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" /> Watchlist ({watchlistItems.length})
              </button>
              <button
                onClick={() => setUserTab('reading')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  userTab === 'reading'
                    ? 'border-[#00FF66] text-[#00FF66]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Reading History ({readingItems.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {loadingDetails ? (
                <div className="py-12 text-center text-white/40 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00FF66]" /> Fetching user activity...
                </div>
              ) : userTab === 'history' ? (
                historyItems.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">No watch history recorded for this user.</div>
                ) : (
                  <div className="space-y-2">
                    {historyItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0E151E] border border-white/5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{item.title || item.media_id || 'Anime Stream'}</div>
                          <div className="text-white/40 text-[11px] mt-0.5">
                            Episode {item.episode_number || item.episode || 1} • {item.position ? `${Math.round(item.position / 60)} min` : 'Watched'}
                          </div>
                        </div>
                        <div className="text-[11px] text-white/40 font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : userTab === 'watchlist' ? (
                watchlistItems.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">No saved watchlist entries.</div>
                ) : (
                  <div className="space-y-2">
                    {watchlistItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0E151E] border border-white/5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{item.title || item.media_id}</span>
                        <span className="px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] font-mono text-[10px]">
                          {item.status || 'Saved'}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                readingItems.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs">No reading history available.</div>
                ) : (
                  <div className="space-y-2">
                    {readingItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0E151E] border border-white/5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{item.title || 'Manga'}</span>
                        <span className="text-white/40">Chapter {item.chapter || 1}</span>
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
