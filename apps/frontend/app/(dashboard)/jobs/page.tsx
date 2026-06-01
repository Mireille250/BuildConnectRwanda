'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Job {
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
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
}

const DISTRICTS = [
  'All Districts','Gasabo','Kicukiro','Nyarugenge','Bugesera',
  'Gatsibo','Kayonza','Musanze','Huye','Rubavu','Rusizi',
];

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [searchInput, setSearchInput] = useState('');

  async function fetchJobs(p = 1, keyword = search, dist = district) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '10');
      if (keyword) params.set('keyword', keyword);
      if (dist && dist !== 'All Districts') params.set('district', dist);

      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.data);
      setTotal(data.meta.total);
    } catch {
      console.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
    fetchJobs(1, searchInput, district);
  }

  function handleDistrictChange(d: string) {
    setDistrict(d);
    setPage(1);
    fetchJobs(1, search, d);
  }

  function formatBudget(min: number | null, max: number | null) {
    if (!min && !max) return 'Budget negotiable';
    if (min && max) return `RWF ${min.toLocaleString()} – ${max.toLocaleString()}`;
    if (min) return `From RWF ${min.toLocaleString()}`;
    return `Up to RWF ${max!.toLocaleString()}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  const canPost = user?.role === 'CLIENT' || user?.role === 'COMPANY';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Marketplace</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} open jobs in Rwanda</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>← Home</Button>
          {canPost && (
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => router.push('/jobs/create')}
            >
              + Post a Job
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-3 flex gap-3 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-64">
          <Input
            placeholder="Search jobs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">Search</Button>
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={district}
          onChange={(e) => handleDistrictChange(e.target.value)}
        >
          {DISTRICTS.map((d) => (
            <option key={d} value={d === 'All Districts' ? '' : d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Jobs List */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No jobs found. {canPost && (
              <button
                onClick={() => router.push('/jobs/create')}
                className="text-orange-600 hover:underline"
              >
                Post the first one!
              </button>
            )}
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-orange-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    {job.status === 'OPEN' && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Open</Badge>
                    )}
                    {job.status === 'IN_PROGRESS' && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">In Progress</Badge>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      📍 {job.district}
                    </span>
                    {job.profession && (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                        {job.profession}
                      </span>
                    )}
                    {job.requiredSkills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-xs text-gray-400">+{job.requiredSkills.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-orange-600">
                    {formatBudget(job.budgetMin, job.budgetMax)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                  </p>
                  {job.deadline && (
                    <p className="text-xs text-gray-400 mt-1">
                      Deadline: {formatDate(job.deadline)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                  {job.postedBy.isVerified && ' ✓'}
                </p>
                <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); fetchJobs(page - 1); }}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / 10)}
              onClick={() => { setPage(p => p + 1); fetchJobs(page + 1); }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}