'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  district: string;
  budgetMin: number | null;
  budgetMax: number | null;
  requiredSkills: string[];
  profession: string | null;
  status: string;
  deadline: string | null;
  createdAt: string;
  applicationCount: number;
  postedBy: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    isVerified: boolean;
    district: string | null;
  };
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    try {
      const { data } = await api.get(`/jobs/${jobId}`);
      setJob(data);
    } catch {
      toast.error('Job not found');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    setApplying(true);
    try {
      await api.post(`/applications/${jobId}`, {
        coverLetter: coverLetter || undefined,
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
      });
      toast.success('Application submitted successfully!');
      setShowApplyForm(false);
      fetchJob();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  async function handleSave() {
    try {
      await api.post(`/jobs/${jobId}/save`);
      toast.success('Job saved!');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to save job');
    }
  }

  function formatBudget(min: number | null, max: number | null) {
    if (!min && !max) return 'Budget negotiable';
    if (min && max) return `RWF ${min.toLocaleString()} – ${max.toLocaleString()}`;
    if (min) return `From RWF ${min.toLocaleString()}`;
    return `Up to RWF ${max!.toLocaleString()}`;
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading job...</p>
    </div>
  );

  if (!job) return null;

  const isOwner = user?.id === job.postedBy.id;
  const canApply = ['ENGINEER', 'WORKER', 'SUPPLIER'].includes(user?.role ?? '');
  const isOpen = job.status === 'OPEN';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/jobs')} className="mb-6">
          ← Back to Jobs
        </Button>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <Badge className={
                  job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                  job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }>
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm">
                Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                {job.postedBy.isVerified && ' ✓'} · {job.postedBy.district}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-orange-600">
                {formatBudget(job.budgetMin, job.budgetMax)}
              </p>
              <p className="text-sm text-gray-400">
                {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">District</p>
              <p className="text-sm font-medium mt-0.5">📍 {job.district}</p>
            </div>
            {job.profession && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Profession</p>
                <p className="text-sm font-medium mt-0.5">{job.profession}</p>
              </div>
            )}
            {job.deadline && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Deadline</p>
                <p className="text-sm font-medium mt-0.5">
                  {new Date(job.deadline).toLocaleDateString('en-RW', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Posted</p>
              <p className="text-sm font-medium mt-0.5">
                {new Date(job.createdAt).toLocaleDateString('en-RW', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.requiredSkills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isOwner && isOpen && canApply && (
            <div className="border-t pt-6">
              {!showApplyForm ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => setShowApplyForm(true)}
                  >
                    Apply Now
                  </Button>
                  <Button variant="outline" onClick={handleSave}>
                    Save Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Submit Application</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Letter</label>
                    <Textarea
                      placeholder="Tell the client why you are the best person for this job..."
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rate (RWF)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 800000"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleApply}
                      disabled={applying}
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isOwner && (
            <div className="border-t pt-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/applications/job/${jobId}`)}
              >
                View Applicants ({job.applicationCount})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}