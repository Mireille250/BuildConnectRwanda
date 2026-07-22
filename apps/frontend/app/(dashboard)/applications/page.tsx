'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

interface MyApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    district: string;
    status: string;
    deadline: string | null;
    postedBy: string;
  };
}

interface Applicant {
  applicationId: string;
  status: string;
  coverLetter: string | null;
  proposedRate: number | null;
  appliedAt: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    district: string | null;
    isVerified: boolean;
    profession: string | null;
    skills: string[];
    experience: number | null;
    rating: number;
    ratingCount: number;
  };
}

interface JobApplicants {
  jobTitle: string;
  totalApplicants: number;
  applicants: Applicant[];
}

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'received'>('mine');
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [jobApplicants, setJobApplicants] = useState<JobApplicants | null>(null);
  const [myLoading, setMyLoading] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const isClient = user?.role === 'CLIENT' || user?.role === 'COMPANY';
  const canApply = ['ENGINEER', 'WORKER', 'SUPPLIER'].includes(user?.role ?? '');

  useEffect(() => {
    if (canApply) { fetchMyApplications(); setActiveTab('mine'); }
    else if (isClient) { fetchMyJobs(); setActiveTab('received'); }
  }, []);

  async function fetchMyApplications() {
    setMyLoading(true);
    try {
      const { data } = await api.get('/applications/my');
      setMyApplications(data);
    } catch { toast.error('Failed to load applications'); }
    finally { setMyLoading(false); }
  }

  async function fetchMyJobs() {
    try {
      const { data } = await api.get('/jobs/my');
      setMyJobs(data);
      if (data.length > 0) { setSelectedJob(data[0].id); setSelectedJobTitle(data[0].title); fetchApplicants(data[0].id); }
    } catch { toast.error('Failed to load jobs'); }
  }

  async function fetchApplicants(jobId: string) {
    setApplicantsLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setJobApplicants(data);
    } catch { toast.error('Failed to load applicants'); }
    finally { setApplicantsLoading(false); }
  }

  async function handleAccept(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/accept`);
      toast.success('Applicant accepted! Job is now in progress.');
      fetchApplicants(selectedJob);
    } catch (error: any) { toast.error(error.response?.data?.message ?? 'Failed to accept'); }
    finally { setActionLoading(''); }
  }

  async function handleReject(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/reject`);
      toast.success('Application rejected.');
      fetchApplicants(selectedJob);
    } catch (error: any) { toast.error(error.response?.data?.message ?? 'Failed to reject'); }
    finally { setActionLoading(''); }
  }

  async function handleWithdraw(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.delete(`/applications/${applicationId}`);
      toast.success('Application withdrawn.');
      fetchMyApplications();
    } catch (error: any) { toast.error(error.response?.data?.message ?? 'Failed to withdraw'); }
    finally { setActionLoading(''); }
  }

  function statusConfig(status: string) {
    switch (status) {
      case 'PENDING': return { color: 'bg-amber-100 text-amber-700', icon: '⏳', label: 'Pending' };
      case 'ACCEPTED': return { color: 'bg-green-100 text-green-700', icon: '✓', label: 'Accepted' };
      case 'REJECTED': return { color: 'bg-red-100 text-red-700', icon: '✗', label: 'Rejected' };
      case 'WITHDRAWN': return { color: 'bg-gray-100 text-gray-500', icon: '↩', label: 'Withdrawn' };
      default: return { color: 'bg-gray-100 text-gray-600', icon: '•', label: status };
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getAvatar(index: number) {
    return AVATARS[index % AVATARS.length];
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
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => router.push('/dashboard')}>← Dashboard</Button>
            {isClient && (
              <Button className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg" onClick={() => router.push('/jobs/create')}>
                + Post a Job
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Applications</h1>
          <p className="text-gray-500">{canApply ? 'Track and manage your job applications' : 'Review and manage applicants for your jobs'}</p>
        </div>

        {/* Tabs */}
        {canApply && isClient && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
            <button onClick={() => setActiveTab('mine')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              My Applications
            </button>
            <button onClick={() => { setActiveTab('received'); fetchMyJobs(); }} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'received' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Received Applications
            </button>
          </div>
        )}

        {/* MY APPLICATIONS TAB */}
        {activeTab === 'mine' && canApply && (
          <div>
            {myLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-64 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-40" />
                  </div>
                ))}
              </div>
            ) : myApplications.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-xl font-bold text-gray-900 mb-2">No applications yet</p>
                <p className="text-gray-500 mb-6">Browse jobs and apply to get started</p>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-6" onClick={() => router.push('/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total', count: myApplications.length, color: 'text-gray-900' },
                    { label: 'Pending', count: myApplications.filter(a => a.status === 'PENDING').length, color: 'text-amber-600' },
                    { label: 'Accepted', count: myApplications.filter(a => a.status === 'ACCEPTED').length, color: 'text-green-600' },
                    { label: 'Rejected', count: myApplications.filter(a => a.status === 'REJECTED').length, color: 'text-red-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.count}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {myApplications.map((app) => {
                  const sc = statusConfig(app.status);
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3
                              className="font-bold text-gray-900 text-lg cursor-pointer hover:text-blue-900 transition-colors"
                              onClick={() => router.push(`/jobs/${app.job.id}`)}
                            >
                              {app.job.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${sc.color}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                            <span>📍 {app.job.district}</span>
                            <span>·</span>
                            <span>👤 {app.job.postedBy}</span>
                            <span>·</span>
                            <span>Applied {formatDate(app.createdAt)}</span>
                            {app.job.deadline && (
                              <>
                                <span>·</span>
                                <span className="text-red-500">Deadline {formatDate(app.job.deadline)}</span>
                              </>
                            )}
                          </div>

                          {app.proposedRate && (
                            <p className="text-sm font-semibold text-blue-900 mt-2">
                              💰 Your rate: RWF {Number(app.proposedRate).toLocaleString()}
                            </p>
                          )}

                          {app.coverLetter && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Your cover letter</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{app.coverLetter}</p>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col gap-2">
                          {app.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:border-red-300 rounded-lg text-xs"
                              disabled={actionLoading === app.id}
                              onClick={() => handleWithdraw(app.id)}
                            >
                              {actionLoading === app.id ? '...' : 'Withdraw'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs"
                            onClick={() => router.push(`/jobs/${app.job.id}`)}
                          >
                            View Job
                          </Button>
                        </div>
                      </div>

                      {app.status === 'ACCEPTED' && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">🎉</div>
                          <p className="text-green-700 text-sm font-medium">Congratulations! You have been hired for this job.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RECEIVED APPLICATIONS TAB */}
        {activeTab === 'received' && isClient && (
          <div className="flex gap-6">
            {/* Job selector */}
            <div className="w-72 shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Jobs</p>
              {myJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">No jobs posted yet</p>
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg" onClick={() => router.push('/jobs/create')}>
                    Post a Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {myJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => { setSelectedJob(job.id); setSelectedJobTitle(job.title); fetchApplicants(job.id); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        selectedJob === job.id
                          ? 'border-blue-900 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <p className={`font-semibold text-sm line-clamp-2 ${selectedJob === job.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        {job.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Applicants panel */}
            <div className="flex-1">
              {!jobApplicants ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400">Select a job to view applicants</p>
                </div>
              ) : applicantsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-200" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                          <div className="h-3 bg-gray-100 rounded w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobApplicants.applicants.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-4xl mb-4">👥</p>
                  <p className="font-bold text-gray-900 mb-1">No applicants yet</p>
                  <p className="text-gray-400 text-sm">Share your job posting to attract candidates</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedJobTitle}</h2>
                      <p className="text-sm text-gray-500">{jobApplicants.totalApplicants} applicant{jobApplicants.totalApplicants !== 1 ? 's' : ''}</p>
                    </div>
                    {/* Stats */}
                    <div className="flex gap-2">
                      {[
                        { label: 'Pending', count: jobApplicants.applicants.filter(a => a.status === 'PENDING').length, color: 'bg-amber-100 text-amber-700' },
                        { label: 'Accepted', count: jobApplicants.applicants.filter(a => a.status === 'ACCEPTED').length, color: 'bg-green-100 text-green-700' },
                      ].map((s) => (
                        <span key={s.label} className={`text-xs px-3 py-1 rounded-full font-semibold ${s.color}`}>
                          {s.count} {s.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {jobApplicants.applicants.map((app, index) => {
                      const sc = statusConfig(app.status);
                      return (
                        <div key={app.applicationId} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <img
                              src={app.applicant.profilePhoto ?? getAvatar(index)}
                              alt={app.applicant.firstName}
                              className="w-14 h-14 rounded-full object-cover cursor-pointer shrink-0"
                              onClick={() => router.push(`/users/${app.applicant.id}`)}
                              onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(index); }}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <h3
                                      className="font-bold text-gray-900 cursor-pointer hover:text-blue-900 transition-colors"
                                      onClick={() => router.push(`/users/${app.applicant.id}`)}
                                    >
                                      {app.applicant.firstName} {app.applicant.lastName}
                                    </h3>
                                    {app.applicant.isVerified && <span className="text-blue-500 text-sm">✓</span>}
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.color}`}>
                                      {sc.label}
                                    </span>
                                  </div>
                                  <p className="text-amber-600 font-medium text-sm">{app.applicant.profession ?? 'Professional'}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                                    {app.applicant.district && <span>📍 {app.applicant.district}</span>}
                                    {app.applicant.experience !== null && <span>🏗️ {app.applicant.experience} yrs exp</span>}
                                    {app.applicant.rating > 0 && <span>⭐ {app.applicant.rating.toFixed(1)} ({app.applicant.ratingCount})</span>}
                                    <span>Applied {formatDate(app.appliedAt)}</span>
                                  </div>
                                </div>
                                {app.proposedRate && (
                                  <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-400">Proposed Rate</p>
                                    <p className="font-bold text-blue-900">RWF {Number(app.proposedRate).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>

                              {/* Skills */}
                              {app.applicant.skills && app.applicant.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {app.applicant.skills.slice(0, 4).map((skill) => (
                                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{skill}</span>
                                  ))}
                                </div>
                              )}

                              {/* Cover Letter */}
                              {app.coverLetter && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Cover Letter</p>
                                  <p className="text-sm text-gray-600 leading-relaxed">{app.coverLetter}</p>
                                </div>
                              )}

                              {/* Actions */}
                              {app.status === 'PENDING' && (
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
                                    disabled={actionLoading === app.applicationId}
                                    onClick={() => handleAccept(app.applicationId)}
                                  >
                                    {actionLoading === app.applicationId ? 'Processing...' : '✓ Accept & Hire'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 hover:border-red-300 rounded-xl"
                                    disabled={actionLoading === app.applicationId}
                                    onClick={() => handleReject(app.applicationId)}
                                  >
                                    ✗ Decline
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => router.push(`/users/${app.applicant.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              )}

                              {app.status === 'ACCEPTED' && (
                                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                                  <span className="text-green-600 font-semibold text-sm">🎉 Hired</span>
                                  <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => router.push(`/users/${app.applicant.id}`)}>
                                    View Profile
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}