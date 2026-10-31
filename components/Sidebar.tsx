'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  KeyRound, 
  Users, 
  Megaphone, 
  DownloadCloud, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'RapidAPI Keys', href: '/rapidapi', icon: KeyRound },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'In-App Notices', href: '/announcements', icon: Megaphone },
    { name: 'App Releases (APK)', href: '/versions', icon: DownloadCloud },
  ];

  const handleLogout = () => {
    localStorage.removeItem('anicreeper_admin_auth');
    router.push('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-[#070B0F] border-r border-[#00FF66]/20 flex flex-col justify-between p-4 select-none fixed top-0 left-0 z-40">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#00FF66]/10 border border-[#00FF66] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            <ShieldCheck className="w-6 h-6 text-[#00FF66]" />
          </div>
          <div>
            <div className="text-white font-black text-lg tracking-wider flex items-center gap-1.5">
              ANICREEPER
              <span className="text-[10px] bg-[#00FF66] text-black font-extrabold px-1.5 py-0.5 rounded tracking-normal">
                ADMIN
              </span>
            </div>
            <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
              Live Gateway Active
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00FF66]' : 'text-white/40'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Info & Logout */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="p-3 bg-[#0D141C] border border-white/5 rounded-xl">
          <div className="text-xs text-white/40 font-medium">Logged in as</div>
          <div className="text-xs font-semibold text-white truncate mt-0.5">max@anicreeper.bond</div>
          <div className="flex items-center gap-1 text-[11px] text-[#00FF66] mt-1 font-mono">
            <Sparkles className="w-3 h-3" /> Super Admin
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
