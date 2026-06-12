'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const ROLES = [
  { value: 'ENGINEER', label: 'Engineer', desc: 'Civil, structural, site', icon: '🧭' },
  { value: 'WORKER', label: 'Skilled Worker', desc: 'Mason, welder, electrician...', icon: '⛑️' },
  { value: 'COMPANY', label: 'Company', desc: 'Construction firm', icon: '🏛️' },
  { value: 'SUPPLIER', label: 'Supplier', desc: 'Materials & equipment', icon: '🚛' },
  { value: 'CLIENT', label: 'Client', desc: 'Hiring professionals', icon: '💼' },
];

const DISTRICTS = [
  'Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo','Kayonza',
  'Kirehe','Ngoma','Nyagatare','Rwamagana','Burera','Gakenke',
  'Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi',
  'Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Karongi',
  'Ngororero','Nyabihu','Rubavu','Rusizi','Rutsiro',
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    district: '',
    phone: '',
  });

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!selectedRole) { toast.error('Please select your role'); return; }
    if (!form.firstName || !form.lastName) { toast.error('Please enter your full name'); return; }
    if (!form.email.includes('@')) { toast.error('Please enter a valid email'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!form.district) { toast.error('Please select your district'); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role: selectedRole });
      setAuth(data.user, data.accessToken, data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 15}`;
      toast.success(`Welcome to BuildConnect, ${data.user.firstName}!`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — Role selection */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Join the network</h1>
          <p className="text-gray-500 mb-8">Tell us who you are. You can update this later.</p>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
                  selectedRole === role.value
                    ? 'border-blue-900 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl ${
                  selectedRole === role.value ? 'bg-blue-900 text-white' : 'bg-gray-100'
                }`}>
                  {role.icon}
                </div>
                <p className={`font-bold text-sm ${selectedRole === role.value ? 'text-blue-900' : 'text-gray-900'}`}>
                  {role.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

          {/* Social */}
          <button
            type="button"
            onClick={() => toast.info('Google login coming soon')}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
          >
            <span>🌐</span> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">👤</span>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={`${form.firstName}${form.lastName ? ' ' + form.lastName : ''}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setField('firstName', parts[0] ?? '');
                    setField('lastName', parts.slice(1).join(' ') ?? '');
                  }}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">🔒</span>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password)].map((met, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${met ? 'bg-green-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-blue-500 transition-colors">
                <span className="text-gray-400 text-sm">📍</span>
                <select
                  value={form.district}
                  onChange={(e) => setField('district', e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                >
                  <option value="">Select your district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}