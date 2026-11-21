'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  CheckSquare,
  BarChart3,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Compass },
    { href: '/checklist', label: 'Checklist', icon: CheckSquare },
    { href: '/weekly/1', label: 'Weekly', icon: BarChart3 },
    { href: '/monthly', label: 'Life Stage', icon: Award },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-slate-900 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm group-hover:shadow transition-shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base tracking-tight font-extrabold text-slate-900 leading-none">
                  StudentLife
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase mt-0.5">
                  Self-Observation
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User badge & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase">
                {user?.name ? user.name.charAt(0) : 'S'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.name || 'Student'}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {user?.university || 'University'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              type="button"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
