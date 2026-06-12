'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Wait for hydration
  if (!hydrated) return null;

  // Not admin
  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 text-white flex flex-col shrink-0 fixed h-full">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-orange-400">BuildConnect</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', label: '📊 Dashboard' },
            { href: '/admin/users', label: '👥 Users' },
            { href: '/admin/jobs', label: '💼 Jobs' },
            { href: '/admin/verification', label: '✓ Verification' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Site
          </Link>
          <button
            onClick={() => { useAuthStore.getState().logout(); router.push('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-56 overflow-auto">
        {children}
      </div>
    </div>
  );
}