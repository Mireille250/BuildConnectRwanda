'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { SkeletonDashboardStat } from '@/components/shared/Skeletons';
import { NotificationBell } from '@/components/shared/NotificationBell';
interface DashboardStats {
  myApplications?: number;
  myJobs?: number;
  unreadMessages?: number;
}

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentJobs, setRecentJobs] = useState<RecentItem[]>([]);
  const [recentApps, setRecentApps] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
async function fetchData() {
  try {
    const [appsRes, jobsRes, convsRes, allJobsRes, profileRes] = await Promise.all([
      api.get('/applications/my').catch(() => ({ data: [] })),
      api.get('/jobs/my').catch(() => ({ data: [] })),
      api.get('/messaging/conversations').catch(() => ({ data: [] })),
      api.get('/jobs?limit=3&status=OPEN').catch(() => ({ data: { data: [] } })),
      api.get('/users/me/profile').catch(() => ({ data: null })),
    ]);

    const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
    const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
    const convs = Array.isArray(convsRes.data.value ?? convsRes.data) ? (convsRes.data.value ?? convsRes.data) : [];
    const unread = convs.reduce((sum: number, c: any) => sum + (c.unreadCount ?? 0), 0);
    const profile = profileRes.data;
    

    // Update auth store with latest profile data
    if (profile) {
      updateUser({
        district: profile.district,
        profilePhoto: profile.profilePhoto,
        isVerified: profile.isVerified,
      });
    }

    setStats({ myApplications: apps.length, myJobs: jobs.length, unreadMessages: unread });
    setRecentApps(apps.slice(0, 3).map((a: any) => ({
  id: a.id,
  title: a.job?.title ?? a.jobTitle ?? 'Untitled Job',
  subtitle: `${a.job?.district ?? ''} · ${a.job?.postedBy ?? ''}`.trim().replace(/^·\s*/, ''),
  time: new Date(a.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' }),
  status: a.status,
})));

    const openJobs = allJobsRes.data?.data ?? [];
    setRecentJobs(openJobs.map((j: any) => ({
      id: j.id,
      title: j.title,
      subtitle: `${j.district} · ${j.applicationCount ?? 0} applicants`,
      time: new Date(j.createdAt).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' }),
    })));
  } catch (err) {
  console.error('Failed to load dashboard', err);
} finally {
    setLoading(false);
  }
}

  const isClient = user?.role === 'CLIENT' || user?.role === 'COMPANY';
  const canApply = ['ENGINEER', 'WORKER', 'SUPPLIER'].includes(user?.role ?? '');

  function statusColor(status?: string) {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Find Professionals', href: '/search' },
              { label: 'Jobs', href: '/jobs' },
              { label: 'Projects', href: '/projects' },
              { label: 'Suppliers', href: '/suppliers' },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-full">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/messages')} className="relative w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
  💬
  {(stats.unreadMessages ?? 0) > 0 && (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
      {stats.unreadMessages}
    </span>
  )}
</button>
<NotificationBell />
           <button onClick={() => router.push('/profile')} className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-200 shrink-0">
  {user?.profilePhoto ? (
    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  )}
</button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { logout(); router.push('/'); }}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-1">
                {new Date().toLocaleDateString('en-RW', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-3xl font-extrabold text-white mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
             <div className="flex items-center gap-3 text-blue-200 text-sm flex-wrap">
  {user?.district && <span>📍 {user.district}</span>}
  {user?.district && <span>·</span>}
  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-medium">{user?.role}</span>
  {user?.isVerified && (
    <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">✓ Verified</span>
  )}
</div>
            </div>
            <div className="flex gap-3">
              {isClient && (
                <Button className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl px-6" onClick={() => router.push('/jobs/create')}>
                  + Post a Job
                </Button>
              )}
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-6 backdrop-blur-sm" onClick={() => router.push('/search')}>
                Find Professionals
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {canApply && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => router.push('/applications')}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📋</div>
                <span className="text-xs text-gray-400">Applications</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{stats.myApplications ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Active applications</p>
            </div>
          )}
          {isClient && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => router.push('/applications')}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">💼</div>
                <span className="text-xs text-gray-400">Jobs</span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{stats.myJobs ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Jobs posted</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => router.push('/messages')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">💬</div>
              <span className="text-xs text-gray-400">Inbox</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{stats.unreadMessages ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Unread messages</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => router.push('/profile')}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">{user?.isVerified ? '✅' : '⚠️'}</div>
              <span className="text-xs text-gray-400">Status</span>
            </div>
            <p className="text-xl font-extrabold text-gray-900">{user?.isVerified ? 'Verified' : 'Unverified'}</p>
            <p className="text-sm text-gray-500 mt-1">{user?.isVerified ? 'Profile verified' : 'Complete verification'}</p>
          </div>
          {!canApply && !isClient && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" onClick={() => router.push('/profile')}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">👤</div>
                <span className="text-xs text-gray-400">Profile</span>
              </div>
              <p className="text-xl font-extrabold text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-500 mt-1">Update your details</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { icon: '🔍', label: 'Find Professionals', desc: 'Search verified pros', href: '/search' },
                { icon: '💼', label: 'Job Marketplace', desc: 'Browse open jobs', href: '/jobs' },
                ...(isClient ? [{ icon: '➕', label: 'Post a Job', desc: 'Create a listing', href: '/jobs/create' }] : []),
                ...(canApply ? [{ icon: '📋', label: 'My Applications', desc: 'Track your status', href: '/applications' }] : []),
                ...(isClient ? [{ icon: '👥', label: 'Manage Applicants', desc: 'Review candidates', href: '/applications' }] : []),
                { icon: '💬', label: 'Messages', desc: 'Chat with connections', href: '/messages' },
                { icon: '👤', label: 'My Profile', desc: 'Edit your information', href: '/profile' },
                ...(canApply ? [{ icon: '✓', label: 'Verification', desc: 'Upload documents', href: '/verification' }] : []),
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg shrink-0">{action.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Applications */}
            {canApply && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">My Recent Applications</h2>
                  <button onClick={() => router.push('/applications')} className="text-sm text-blue-600 hover:underline font-medium">View all →</button>
                </div>
     {loading ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonDashboardStat key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {/* existing stats */}
  </div>
)}

            {/* Open Jobs / Recommended */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">{isClient ? 'Recently Posted Jobs' : 'Recommended Jobs'}</h2>
                <button onClick={() => router.push('/jobs')} className="text-sm text-blue-600 hover:underline font-medium">View all →</button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No open jobs right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.subtitle} · {job.time}</p>
                      </div>
                      <span className="text-blue-900 text-sm font-semibold">View →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile completion / verification CTA */}
            {!user?.isVerified && canApply && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-gray-900 mb-1">⚡ Get Verified</p>
                  <p className="text-sm text-gray-600">Verified profiles get more job invites and appear higher in search results.</p>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shrink-0" onClick={() => router.push('/verification')}>
                  Upload Documents
                </Button>
              </div>
            )}
          </div>)}
        </div>
      </div>
    </div>
  </div>)}