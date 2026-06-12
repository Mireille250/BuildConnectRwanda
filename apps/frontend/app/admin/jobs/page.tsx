'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminJob {
  id: string;
  title: string;
  district: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  profession: string | null;
  createdAt: string;
  applicationCount: number;
  postedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/jobs?${params.toString()}`);
      setJobs(data.data);
      setTotal(data.meta.total);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(jobId: string, title: string) {
    if (!confirm(`Remove job: "${title}"? This cannot be undone.`)) return;
    setActionLoading(jobId);
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job removed successfully');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to delete job');
    } finally {
      setActionLoading('');
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function statusColor(status: string) {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-gray-100 text-gray-600';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total jobs</p>
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Posted By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Apps</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p
                    className="font-medium text-sm text-gray-900 hover:text-orange-600 cursor-pointer line-clamp-1 max-w-48"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    {job.title}
                  </p>
                  {job.profession && (
                    <p className="text-xs text-orange-500 mt-0.5">{job.profession}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700">{job.postedBy.firstName} {job.postedBy.lastName}</p>
                  <p className="text-xs text-gray-400">{job.postedBy.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{job.district}</td>
                <td className="px-4 py-3 text-sm text-orange-600">
                  {job.budgetMin || job.budgetMax
                    ? `RWF ${(job.budgetMin ?? job.budgetMax)!.toLocaleString()}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${statusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.applicationCount}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(job.createdAt)}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-500 hover:border-red-300"
                    disabled={actionLoading === job.id}
                    onClick={() => handleDelete(job.id, job.title)}
                  >
                    {actionLoading === job.id ? '...' : 'Remove'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 15 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / 15)}</span>
          <Button variant="outline" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}