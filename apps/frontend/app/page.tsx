'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user.role} — {user.district ?? 'Rwanda'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700">Find Professionals</h2>
            <p className="text-sm text-gray-400 mt-1">Search engineers, workers and suppliers</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-4 text-orange-600 text-sm font-medium hover:underline"
            >
              Browse →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700">Job Marketplace</h2>
            <p className="text-sm text-gray-400 mt-1">Post jobs or find work opportunities</p>
            <button
              onClick={() => router.push('/jobs')}
              className="mt-4 text-orange-600 text-sm font-medium hover:underline"
            >
              View Jobs →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700">My Profile</h2>
            <p className="text-sm text-gray-400 mt-1">Update your skills and portfolio</p>
            <button
              onClick={() => router.push('/profile')}
              className="mt-4 text-orange-600 text-sm font-medium hover:underline"
            >
              Edit Profile →
            </button>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/login');
            }}
            className="text-sm text-gray-400 hover:text-red-500"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}