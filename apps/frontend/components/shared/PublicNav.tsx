'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/shared/NotificationBell';

const NAV_LINKS = [
  { label: 'Find Professionals', href: '/search' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Projects', href: '/projects' },
  { label: 'Suppliers', href: '/suppliers' },
];

export function PublicNav({ active }: { active?: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-gray-900 hidden sm:block">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          <span className="font-bold text-gray-900 sm:hidden text-sm">BuildConnect</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors px-3 py-1 rounded-full ${active === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />
          {isAuthenticated && user ? (
            <>
              <button onClick={() => router.push('/dashboard')} className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => router.push('/dashboard')}>Dashboard</Button>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</a>
              <a href="/register">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold">Join free</Button>
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => (
            
              key={item.label}
              href={item.href}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active === item.href ? 'bg-blue-50 text-blue-900' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="border-t pt-3 mt-3 space-y-2">
            {isAuthenticated && user ? (
           <button onClick={() => router.push('/dashboard')} className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200">
  {user?.profilePhoto ? (
    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  )}
</button>
            ) : (
              <>
                <a href="/login" className="block w-full border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-semibold text-center">
                  Sign in
                </a>
                <a href="/register" className="block w-full bg-blue-900 text-white rounded-xl py-3 text-sm font-semibold text-center">
                  Join free
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}