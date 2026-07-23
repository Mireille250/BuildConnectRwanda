'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 15}`;
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Dark blue branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot grid pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white text-lg">🏗️</span>
            </div>
            <span className="font-bold text-white">BuildConnect <span className="text-amber-400">Rwanda</span></span>
          </Link>
        </div>

        {/* Center text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Welcome back to Rwanda's construction network.
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Sign in to manage projects, connect with verified pros, and grow your business.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-400 text-sm">© {new Date().getFullYear()} BuildConnect Rwanda</p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">B</div>
              <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">Welcome back. Let's get you back to work.</p>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => toast.info('Google login coming soon')}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🌐</span> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => toast.info('GitHub login coming soon')}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🐙</span> Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot?</Link>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Demo Access</p>
            <div className="space-y-1.5">
              {[
                { role: 'CLIENT', email: 'jean@buildconnect.rw', pwd: 'Test1234!', color: 'bg-blue-100 text-blue-700' },
                { role: 'ENGINEER', email: 'david@buildconnect.rw', pwd: 'Test1234!', color: 'bg-green-100 text-green-700' },
                { role: 'ADMIN', email: 'admin@buildconnect.rw', pwd: 'Admin1234!', color: 'bg-purple-100 text-purple-700' },
              ].map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword(a.pwd); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs text-gray-600">{a.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.color}`}>{a.role}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New here?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}