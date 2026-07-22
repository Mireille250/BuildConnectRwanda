'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { SkeletonJobCard } from '@/components/shared/Skeletons';
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
    id: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    district: string | null;
  };
}

const JOB_TYPES = ['All Jobs', 'Civil Engineering', 'Architecture', 'Electrical', 'Plumbing', 'Masonry', 'Carpentry', 'Welding', 'Painting', 'Roofing'];
const DISTRICTS = ['All Districts', 'Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Huye', 'Rubavu', 'Rusizi', 'Kayonza', 'Rwamagana', 'Bugesera'];
const BUDGETS = [
  { label: 'Any Budget', min: 0, max: 0 },
  { label: 'Under 500K RWF', min: 0, max: 500000 },
  { label: '500K – 1M RWF', min: 500000, max: 1000000 },
  { label: '1M – 5M RWF', min: 1000000, max: 5000000 },
  { label: '5M+ RWF', min: 5000000, max: 0 },
];

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    district: '',
    profession: '',
    keyword: '',
    status: 'OPEN',
    minBudget: 0,
    maxBudget: 0,
  });

  useEffect(() => { fetchJobs(1); }, [filters]);

  function setFilter(key: string, value: string | number) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  async function fetchJobs(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '10');
      if (filters.status) params.set('status', filters.status);
      if (filters.district && filters.district !== 'All Districts') params.set('district', filters.district);
      if (filters.profession && filters.profession !== 'All Jobs') params.set('profession', filters.profession);
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.minBudget) params.set('minBudget', String(filters.minBudget));
      if (filters.maxBudget) params.set('maxBudget', String(filters.maxBudget));

      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.data);
      setTotal(data.meta.total);
      setPage(p);
    } catch { console.error('Failed to fetch jobs'); }
    finally { setLoading(false); }
  }

  function formatBudget(min: number | null, max: number | null) {
    if (!min && !max) return 'Negotiable';
    if (min && max) return `RWF ${(min / 1000).toFixed(0)}K – ${(max / 1000).toFixed(0)}K`;
    if (min) return `From RWF ${(min / 1000).toFixed(0)}K`;
    return `Up to RWF ${(max! / 1000).toFixed(0)}K`;
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 7) return new Date(date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  const isClient = user?.role === 'CLIENT' || user?.role === 'COMPANY';
  const canApply = ['ENGINEER', 'WORKER', 'SUPPLIER'].includes(user?.role ?? '');

  return (
    <div className="min-h-screen bg-white">
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
              { label: 'Jobs', href: '/jobs', active: true },
              { label: 'Projects', href: '/projects' },
              { label: 'Suppliers', href: '/suppliers' },
            ].map((item) => (
              <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors px-3 py-1 rounded-full ${item.active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isClient && (
                  <Button className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg" onClick={() => router.push('/jobs/create')}>
                    + Post a Job
                  </Button>
                )}
                <Button variant="outline" className="text-sm rounded-lg" onClick={() => router.push('/dashboard')}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</a>
                <a href="/register">
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold">Join free</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-blue-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">Construction Jobs</h1>
              <p className="text-blue-200">{total} open jobs across Rwanda</p>
            </div>
            {isClient && (
              <Button className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 rounded-xl" onClick={() => router.push('/jobs/create')}>
                + Post a Job
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-3 px-4 py-3 shadow-lg">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search jobs by title, skill or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setFilter('keyword', searchInput); } }}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <Button onClick={() => setFilter('keyword', searchInput)} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 rounded-xl">
              Search
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter('status', status)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.status === status ? 'bg-white text-blue-900' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⚙️</span>
                <h2 className="font-bold text-gray-900">Filters</h2>
              </div>
              {(filters.district || filters.profession || filters.minBudget) && (
                <button onClick={() => setFilters({ district: '', profession: '', keyword: '', status: 'OPEN', minBudget: 0, maxBudget: 0 })} className="text-xs text-red-500 hover:text-red-600">
                  Clear
                </button>
              )}
            </div>

            {/* Job Type */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Profession</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {JOB_TYPES.map((type) => {
                  const val = type === 'All Jobs' ? '' : type;
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => setFilter('profession', val)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${filters.profession === val ? 'border-blue-900 bg-blue-900' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.profession === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* District */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">District</p>
              <div className="space-y-2">
                {DISTRICTS.map((d) => {
                  const val = d === 'All Districts' ? '' : d;
                  return (
                    <label key={d} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => setFilter('district', val)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${filters.district === val ? 'border-blue-900 bg-blue-900' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.district === val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{d}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Budget */}
            <div className="mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Budget</p>
              <div className="space-y-2">
                {BUDGETS.map((b) => (
                  <label key={b.label} className="flex items-center gap-2 cursor-pointer group">
                    <div onClick={() => { setFilter('minBudget', b.min); setFilter('maxBudget', b.max); }} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${filters.minBudget === b.min && filters.maxBudget === b.max ? 'border-blue-900 bg-blue-900' : 'border-gray-300 group-hover:border-blue-400'}`}>
                      {filters.minBudget === b.min && filters.maxBudget === b.max && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{b.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700 font-medium">
              <span className="font-bold text-gray-900">{total}</span> jobs found
            </p>
            {isClient && (
              <Button className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl" onClick={() => router.push('/jobs/create')}>
                + Post a Job
              </Button>
            )}
          </div>

          {loading ? (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonJobCard key={i} />
    ))}
  </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">💼</p>
              <p className="text-xl font-bold text-gray-900 mb-2">No jobs found</p>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              {isClient && (
                <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl" onClick={() => router.push('/jobs/create')}>
                  Post the First Job
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Company avatar */}
                    <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {job.postedBy.firstName[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{job.title}</h3>
                            {job.status === 'OPEN' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Open</span>
                            )}
                            {job.status === 'IN_PROGRESS' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">In Progress</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mt-0.5">
                            {job.postedBy.firstName} {job.postedBy.lastName}
                            {job.postedBy.isVerified && ' ✓'} · {job.district}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-blue-900">{formatBudget(job.budgetMin, job.budgetMax)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(job.createdAt)}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">{job.description}</p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {job.profession && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">{job.profession}</span>
                        )}
                        {job.requiredSkills.slice(0, 3).map((skill) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{skill}</span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-xs text-gray-400">+{job.requiredSkills.length - 3} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>👥 {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                          {job.deadline && (
                            <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          )}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {canApply && job.status === 'OPEN' && (
                            <Button className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg px-4 py-1.5 h-auto" onClick={() => router.push(`/jobs/${job.id}`)}>
                              Apply Now
                            </Button>
                          )}
                          <Button variant="outline" className="text-xs rounded-lg px-4 py-1.5 h-auto border-gray-200" onClick={() => router.push(`/jobs/${job.id}`)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 10 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page === 1} onClick={() => fetchJobs(page - 1)} className="rounded-xl">Previous</Button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / 10)}</span>
              <Button variant="outline" disabled={page >= Math.ceil(total / 10)} onClick={() => fetchJobs(page + 1)} className="rounded-xl">Next</Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-16 px-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">The digital ecosystem connecting Rwanda's construction industry.</p>
              <div className="flex gap-3">
                {['f', 'X', 'in', '📷'].map((icon) => (
                  <div key={icon} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors">{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Platform</p>
              <div className="space-y-2 text-sm text-gray-500">
                {['Find Professionals', 'Job Marketplace', 'Project Showcase', 'Suppliers'].map((item) => (
                  <p key={item} className="hover:text-blue-900 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Company</p>
              <div className="space-y-2 text-sm text-gray-500">
                {['About', 'Verification', 'Pricing', 'Careers'].map((item) => (
                  <p key={item} className="hover:text-blue-900 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Contact</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex items-center gap-2"><span className="text-amber-500">📍</span> Kigali, Rwanda</p>
                <p className="flex items-center gap-2"><span className="text-amber-500">✉️</span> hello@buildconnect.rw</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} BuildConnect Rwanda. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <span key={item} className="hover:text-gray-600 cursor-pointer transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}