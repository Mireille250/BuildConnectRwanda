'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ROLES = [
  { value: 'CLIENT', label: 'Client / Property Owner' },
  { value: 'ENGINEER', label: 'Engineer / Architect' },
  { value: 'WORKER', label: 'Skilled Worker' },
  { value: 'COMPANY', label: 'Construction Company' },
  { value: 'SUPPLIER', label: 'Material Supplier' },
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
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', role: 'CLIENT', district: '',
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 15}`;
      toast.success(`Welcome to BuildConnect, ${data.user.firstName}!`);
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Join Rwanda&apos;s construction platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input placeholder="Jean" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input placeholder="Mutesi" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">I am a</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={form.district}
              onChange={(e) => set('district', e.target.value)}
            >
              <option value="">Select your district</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}