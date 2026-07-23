'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      router.push('/forgot-password');
    }
  }, [token]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('Password must contain uppercase and a number');
      return;
    }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white text-lg">🏗️</span>
            </div>
            <span className="font-bold text-white">BuildConnect <span className="text-amber-400">Rwanda</span></span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Create a new password
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Choose a strong password to keep your BuildConnect account secure.
          </p>
          <div className="mt-6 space-y-3">
            {['At least 8 characters', 'One uppercase letter', 'One number'].map((rule) => (
              <div key={rule} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">✓</div>
                <p className="text-blue-100 text-sm">{rule}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-blue-400 text-sm">© {new Date().getFullYear()} BuildConnect Rwanda</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Password reset!</h1>
              <p className="text-gray-500 mb-6">Your password has been changed successfully. You can now sign in with your new password.</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                Sign In Now →
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">New password</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                    <span className="text-gray-400 text-sm">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 text-sm">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((met, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${met ? 'bg-green-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                    <span className="text-gray-400 text-sm">🔒</span>
                    <input
                      type="password"
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                    />
                    {confirm && (
                      <span className="text-sm">{password === confirm ? '✅' : '❌'}</span>
                    )}
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
                      Resetting...
                    </>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">← Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}