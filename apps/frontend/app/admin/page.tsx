'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  users: {
    total: number;
    byRole: { role: string; count: number; verifiedCount: number; activeCount: number }[];
  };
  jobs: {
    total: number;
    byStatus: { status: string; count: number }[];
  };
  applications: {
    total: number;
    byStatus: { status: string; count: number }[];
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  verification: {
    byStatus: { status: string; count: number }[];
  };
}

interface Activity {
  recentUsers: { id: string; name: string; role: string; joinedAt: string }[];
  recentJobs: { id: string; title: string; district: string; status: string; postedBy: string; createdAt: string }[];
  recentApplications: { id: string; status: string; jobTitle: string; applicant: string; createdAt: string }[];
  recentReviews: { id: string; rating: number; comment: string | null; author: string; target: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity'),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch {
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  );

  const pendingVerifications = stats?.verification.byStatus.find(
    (s) => s.status === 'PENDING'
  )?.count ?? 0;

  const openJobs = stats?.jobs.byStatus.find(
    (s) => s.status === 'OPEN'
  )?.count ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">BuildConnect Rwanda — Platform Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-orange-600">{stats?.users.total ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-blue-600">{stats?.jobs.total ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Jobs</p>
            <p className="text-xs text-green-600 mt-0.5">{openJobs} open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-green-600">{stats?.applications.total ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-purple-600">{pendingVerifications}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Verifications</p>
            {pendingVerifications > 0 && (
              <button
                onClick={() => router.push('/admin/verification')}
                className="text-xs text-orange-600 hover:underline mt-0.5"
              >
                Review now →
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.users.byRole.map((r) => (
                <div key={r.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-24">{r.role}</span>
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden w-32">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(r.count / (stats?.users.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">{r.count}</span>
                    <span className="text-green-600">{r.verifiedCount} verified</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.jobs.byStatus.map((s) => {
                const colors: Record<string, string> = {
                  OPEN: 'bg-green-500',
                  IN_PROGRESS: 'bg-blue-500',
                  COMPLETED: 'bg-gray-400',
                  CANCELLED: 'bg-red-400',
                };
                return (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-28">
                        {s.status.replace('_', ' ')}
                      </span>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-32">
                        <div
                          className={`h-full rounded-full ${colors[s.status] ?? 'bg-gray-400'}`}
                          style={{ width: `${(s.count / (stats?.jobs.total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.role}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(u.joinedAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.recentJobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{j.title}</p>
                    <p className="text-xs text-gray-400">{j.district} · {j.postedBy}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    j.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity?.recentReviews.map((r) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {r.author} → {r.target}
                    </p>
                    <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-bold text-orange-600">
                  ⭐ {stats?.reviews.averageRating?.toFixed(1) ?? '0.0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="font-bold text-gray-900">{stats?.reviews.total ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accepted Applications</span>
                <span className="font-bold text-green-600">
                  {stats?.applications.byStatus.find((s) => s.status === 'ACCEPTED')?.count ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Jobs</span>
                <span className="font-bold text-blue-600">
                  {stats?.jobs.byStatus.find((s) => s.status === 'COMPLETED')?.count ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}