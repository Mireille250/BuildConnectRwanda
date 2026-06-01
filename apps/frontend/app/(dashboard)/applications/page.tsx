'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'mine' | 'received'>('mine');

  // My applications (for workers/engineers)
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [myLoading, setMyLoading] = useState(false);

  // Received applications (for clients)
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [jobApplicants, setJobApplicants] = useState<JobApplicants | null>(null);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string>('');

  const isClient = user?.role === 'CLIENT' || user?.role === 'COMPANY';
  const canApply = ['ENGINEER', 'WORKER', 'SUPPLIER'].includes(user?.role ?? '');

  useEffect(() => {
    if (canApply) {
      fetchMyApplications();
      setActiveTab('mine');
    } else if (isClient) {
      fetchMyJobs();
      setActiveTab('received');
    }
  }, []);

  async function fetchMyApplications() {
    setMyLoading(true);
    try {
      const { data } = await api.get('/applications/my');
      setMyApplications(data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setMyLoading(false);
    }
  }

  async function fetchMyJobs() {
    try {
      const { data } = await api.get('/jobs/my');
      setMyJobs(data);
      if (data.length > 0) {
        setSelectedJob(data[0].id);
        fetchApplicants(data[0].id);
      }
    } catch {
      toast.error('Failed to load jobs');
    }
  }

  async function fetchApplicants(jobId: string) {
    setApplicantsLoading(true);
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setJobApplicants(data);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  }

  async function handleAccept(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/accept`);
      toast.success('Applicant accepted! Job is now in progress.');
      fetchApplicants(selectedJob);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to accept');
    } finally {
      setActionLoading('');
    }
  }

  async function handleReject(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/reject`);
      toast.success('Application rejected.');
      fetchApplicants(selectedJob);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to reject');
    } finally {
      setActionLoading('');
    }
  }

  async function handleWithdraw(applicationId: string) {
    setActionLoading(applicationId);
    try {
      await api.delete(`/applications/${applicationId}`);
      toast.success('Application withdrawn.');
      fetchMyApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to withdraw');
    } finally {
      setActionLoading('');
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {canApply ? 'Track your job applications' : 'Manage applicants for your jobs'}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>← Home</Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs — show both if user is both client and worker (edge case) */}
        {canApply && isClient && (
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            <button
              onClick={() => setActiveTab('mine')}
              className={`py-2 px-6 rounded-md text-sm font-medium transition-colors ${activeTab === 'mine' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              My Applications
            </button>
            <button
              onClick={() => { setActiveTab('received'); fetchMyJobs(); }}
              className={`py-2 px-6 rounded-md text-sm font-medium transition-colors ${activeTab === 'received' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Received Applications
            </button>
          </div>
        )}

        {/* My Applications Tab */}
        {(activeTab === 'mine' && canApply) && (
          <div>
            {myLoading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : myApplications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <p className="text-gray-400 text-lg mb-2">No applications yet</p>
                <p className="text-gray-400 text-sm mb-4">Browse jobs and apply to get started</p>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => router.push('/jobs')}
                >
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <div key={app.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            className="font-semibold text-gray-900 hover:text-orange-600 cursor-pointer"
                            onClick={() => router.push(`/jobs/${app.job.id}`)}
                          >
                            {app.job.title}
                          </h3>
                          <Badge className={statusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          📍 {app.job.district} · Posted by {app.job.postedBy}
                        </p>
                        {app.coverLetter && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 bg-gray-50 p-2 rounded">
                            "{app.coverLetter}"
                          </p>
                        )}
                        {app.proposedRate && (
                          <p className="text-sm text-orange-600 mt-1 font-medium">
                            Your rate: RWF {app.proposedRate.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Applied</p>
                        <p className="text-xs text-gray-600">{formatDate(app.createdAt)}</p>
                        {app.job.deadline && (
                          <>
                            <p className="text-xs text-gray-400 mt-1">Deadline</p>
                            <p className="text-xs text-gray-600">{formatDate(app.job.deadline)}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="mt-4 pt-3 border-t flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:border-red-300"
                          disabled={actionLoading === app.id}
                          onClick={() => handleWithdraw(app.id)}
                        >
                          {actionLoading === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                        </Button>
                      </div>
                    )}

                    {app.status === 'ACCEPTED' && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-green-600 text-sm font-medium">
                          🎉 Congratulations! You have been hired for this job.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received Applications Tab */}
        {(activeTab === 'received' && isClient) && (
          <div>
            {myJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <p className="text-gray-400 text-lg mb-2">No jobs posted yet</p>
                <p className="text-gray-400 text-sm mb-4">Post a job to start receiving applications</p>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => router.push('/jobs/create')}
                >
                  Post a Job
                </Button>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Job selector sidebar */}
                <div className="w-64 shrink-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Your Jobs
                  </p>
                  <div className="space-y-2">
                    {myJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => { setSelectedJob(job.id); fetchApplicants(job.id); }}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          selectedJob === job.id
                            ? 'bg-orange-50 border border-orange-200 text-orange-700'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-200'
                        }`}
                      >
                        <p className="font-medium line-clamp-2">{job.title}</p>
                        <p className="text-xs mt-1 opacity-70">{job.status}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applicants panel */}
                <div className="flex-1">
                  {applicantsLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading applicants...</div>
                  ) : !jobApplicants ? (
                    <div className="text-center py-12 text-gray-400">Select a job to view applicants</div>
                  ) : jobApplicants.applicants.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                      <p className="text-gray-400 text-lg mb-1">No applicants yet</p>
                      <p className="text-gray-400 text-sm">Share your job posting to attract candidates</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        <span className="font-semibold text-gray-900">{jobApplicants.jobTitle}</span>
                        {' '}· {jobApplicants.totalApplicants} applicant{jobApplicants.totalApplicants !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-4">
                        {jobApplicants.applicants.map((app) => (
                          <div key={app.applicationId} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div
                                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600 shrink-0 cursor-pointer"
                                onClick={() => router.push(`/users/${app.applicant.id}`)}
                              >
                                {app.applicant.firstName[0]}{app.applicant.lastName[0]}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3
                                        className="font-semibold text-gray-900 cursor-pointer hover:text-orange-600"
                                        onClick={() => router.push(`/users/${app.applicant.id}`)}
                                      >
                                        {app.applicant.firstName} {app.applicant.lastName}
                                      </h3>
                                      {app.applicant.isVerified && (
                                        <span className="text-blue-500 text-xs">✓</span>
                                      )}
                                      <Badge className={statusColor(app.status)}>
                                        {app.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-orange-600">
                                      {app.applicant.profession ?? 'Professional'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                      {app.applicant.district && <span>📍 {app.applicant.district}</span>}
                                      {app.applicant.experience !== null && (
                                        <span>{app.applicant.experience} yrs exp</span>
                                      )}
                                      {app.applicant.rating > 0 && (
                                        <span>⭐ {app.applicant.rating.toFixed(1)} ({app.applicant.ratingCount})</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    {app.proposedRate && (
                                      <p className="text-sm font-semibold text-orange-600">
                                        RWF {Number(app.proposedRate).toLocaleString()}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {formatDate(app.appliedAt)}
                                    </p>
                                  </div>
                                </div>

                                {/* Skills */}
                                {app.applicant.skills && app.applicant.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {app.applicant.skills.slice(0, 4).map((skill) => (
                                      <span key={skill} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Cover Letter */}
                                {app.coverLetter && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter</p>
                                    <p className="text-sm text-gray-700">{app.coverLetter}</p>
                                  </div>
                                )}

                                {/* Actions */}
                                {app.status === 'PENDING' && (
                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      disabled={actionLoading === app.applicationId}
                                      onClick={() => handleAccept(app.applicationId)}
                                    >
                                      {actionLoading === app.applicationId ? 'Processing...' : '✓ Accept'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-500 hover:text-red-600 hover:border-red-300"
                                      disabled={actionLoading === app.applicationId}
                                      onClick={() => handleReject(app.applicationId)}
                                    >
                                      ✗ Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => router.push(`/users/${app.applicant.id}`)}
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                )}

                                {app.status === 'ACCEPTED' && (
                                  <div className="flex gap-2 mt-3">
                                    <p className="text-green-600 text-sm font-medium">✓ Hired</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => router.push(`/users/${app.applicant.id}`)}
                                    >
                                      View Profile
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}