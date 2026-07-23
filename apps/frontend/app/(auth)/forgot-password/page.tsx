'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email.includes('@')) { toast.error('Please enter a valid email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setSent(true); // Still show success to prevent enumeration
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
            Forgot your password?
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-blue-400 text-sm">© {new Date().getFullYear()} BuildConnect Rwanda</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">B</div>
              <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
            </Link>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h1>
              <p className="text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="text-blue-600 font-semibold hover:underline text-sm">
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Forgot password</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}