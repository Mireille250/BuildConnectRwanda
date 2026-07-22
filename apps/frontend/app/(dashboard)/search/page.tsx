'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SkeletonProfileCard } from '@/components/shared/Skeletons';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhoto: string | null;
  district: string | null;
  isVerified: boolean;
  profession: string | null;
  skills: string[];
  experience: number | null;
  availability: boolean;
  rating: number;
  ratingCount: number;
  companyName: string | null;
}

const PROFESSIONS = [
  'Civil Engineer','Structural Engineer','Architect','Quantity Surveyor',
  'Site Engineer','Surveyor','Contractor','Mason','Electrician',
  'Plumber','Carpenter','Welder','Painter','Roofer','Steel Fixer',
];

const DISTRICTS = [
  'Kigali','Musanze','Huye','Rubavu','Nyagatare','Muhanga',
  'Rusizi','Kayonza','Rwamagana','Bugesera',
];

const EXPERIENCE_OPTIONS = [
  { label: '0–2 yrs', min: 0, max: 2 },
  { label: '3–5 yrs', min: 3, max: 5 },
  { label: '6–10 yrs', min: 6, max: 10 },
  { label: '10+ yrs', min: 10, max: 99 },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Most relevant' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'createdAt', label: 'Newest' },
];

// Placeholder photos for demo
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80',
];

export default function SearchPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState({
    profession: '',
    district: '',
    minExperience: '',
    minRating: '',
    available: false,
    verified: false,
    sortBy: 'rating',
    order: 'desc',
  });

  useEffect(() => {
    fetchProfessionals(1);
  }, [filters]);

  function setFilter(key: string, value: string | boolean) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  async function fetchProfessionals(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '12');
      params.set('sortBy', filters.sortBy);
      params.set('order', filters.order);
      if (searchInput) params.set('skill', searchInput);
      if (filters.profession) params.set('profession', filters.profession);
      if (filters.district) params.set('district', filters.district);
      if (filters.minExperience) params.set('minExperience', filters.minExperience);
      if (filters.minRating) params.set('minRating', filters.minRating);
      if (filters.available) params.set('available', 'true');
      if (filters.verified) params.set('verified', 'true');

      const { data } = await api.get(`/search/professionals?${params.toString()}`);
      setProfessionals(data.data);
      setTotal(data.meta.total);
      setPage(p);
    } catch {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  }

  function getPhoto(index: number) {
    return DEMO_PHOTOS[index % DEMO_PHOTOS.length];
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
          {[
  { label: 'Find Professionals', href: '/search', active: true },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Projects', href: '/projects' },
  { label: 'Suppliers', href: '/suppliers' },
].map((item) => (
  <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors px-3 py-1 rounded-full ${item.active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
    {item.label}
  </a>
))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</a>
            <a href="/register">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold">Join free</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Search Bar */}
      <div className="bg-blue-900 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-2">Find Professionals</h1>
          <p className="text-blue-200 mb-8">Discover trusted talent across Rwanda</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-3 px-4 py-3 shadow-lg">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by name, skill or profession..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProfessionals(1)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <Button
              onClick={() => fetchProfessionals(1)}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 rounded-xl"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* Sidebar Filters */}
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-400">⚙️</span>
              <h2 className="font-bold text-gray-900">Filters</h2>
            </div>

            {/* Profession */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Profession</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {PROFESSIONS.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFilter('profession', filters.profession === p ? '' : p)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        filters.profession === p
                          ? 'border-blue-900 bg-blue-900'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {filters.profession === p && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* District */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">District</p>
              <div className="space-y-2">
                {DISTRICTS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFilter('district', filters.district === d ? '' : d)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        filters.district === d
                          ? 'border-blue-900 bg-blue-900'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {filters.district === d && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Experience */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Experience</p>
              <div className="space-y-2">
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <label key={exp.label} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFilter('minExperience', filters.minExperience === String(exp.min) ? '' : String(exp.min))}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        filters.minExperience === String(exp.min)
                          ? 'border-blue-900 bg-blue-900'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {filters.minExperience === String(exp.min) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600">{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Rating */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Rating</p>
              <div className="space-y-2">
                {[{ label: '4.5+ stars', value: '4' }, { label: '4.0+ stars', value: '4' }].map((r) => (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => setFilter('minRating', filters.minRating === r.value ? '' : r.value)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        filters.minRating === r.value
                          ? 'border-blue-900 bg-blue-900'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {filters.minRating === r.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Verified / Available */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFilter('verified', !filters.verified)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    filters.verified ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                  }`}
                >
                  {filters.verified && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-gray-600">Verified only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFilter('available', !filters.available)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    filters.available ? 'border-blue-900 bg-blue-900' : 'border-gray-300'
                  }`}
                >
                  {filters.available && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-gray-600">Available now</span>
              </label>
            </div>

            {/* Reset */}
            {(filters.profession || filters.district || filters.minExperience || filters.minRating || filters.verified || filters.available) && (
              <button
                onClick={() => setFilters({ profession: '', district: '', minExperience: '', minRating: '', available: false, verified: false, sortBy: 'rating', order: 'desc' })}
                className="w-full mt-6 text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Results header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700 font-medium">
              <span className="text-gray-900 font-bold">{total}</span> professionals found
            </p>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none bg-white"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonProfileCard key={i} />
    ))}
  </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-bold text-gray-900 mb-2">No professionals found</p>
              <p className="text-gray-500 mb-4">Try adjusting your filters</p>
              <Button variant="outline" onClick={() => setFilters({ profession: '', district: '', minExperience: '', minRating: '', available: false, verified: false, sortBy: 'rating', order: 'desc' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionals.map((pro, index) => (
                <div key={pro.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-gray-200 transition-all">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative shrink-0">
                      <img
                        src={pro.profilePhoto ?? getPhoto(index)}
                        alt={`${pro.firstName} ${pro.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPhoto(index);
                        }}
                      />
                      {pro.availability && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-bold text-gray-900 text-base">
                              {pro.firstName} {pro.lastName}
                            </h3>
                            {pro.isVerified && (
                              <span className="text-blue-500 text-sm">✓</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">{pro.profession ?? pro.role}</p>
                        </div>
                        {pro.availability && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="text-amber-500">⭐</span>
                        <span className="font-semibold text-gray-900">{pro.rating > 0 ? pro.rating.toFixed(1) : 'New'}</span>
                        {pro.ratingCount > 0 && <span>({pro.ratingCount})</span>}
                        {pro.experience !== null && (
                          <>
                            <span>·</span>
                            <span>{pro.experience} yrs</span>
                          </>
                        )}
                        {pro.district && (
                          <>
                            <span>·</span>
                            <span>📍 {pro.district}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {pro.skills && pro.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {pro.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{skill}</span>
                      ))}
                      {pro.skills.length > 4 && (
                        <span className="text-xs text-gray-400 px-1 py-1">+{pro.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl"
                      onClick={() => router.push(`/users/${pro.id}`)}
                    >
                      Hire Now
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 text-gray-700 hover:border-gray-300 text-sm rounded-xl"
                      onClick={() => router.push(`/users/${pro.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page === 1} onClick={() => fetchProfessionals(page - 1)} className="rounded-xl">
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <Button variant="outline" disabled={page >= Math.ceil(total / 12)} onClick={() => fetchProfessionals(page + 1)} className="rounded-xl">
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-16 px-6 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                The digital ecosystem connecting Rwanda's construction industry. Trusted professionals, verified workers, and quality suppliers — all in one place.
              </p>
              <div className="flex gap-3">
                {['f', 'X', 'in', '📷'].map((icon) => (
                  <div key={icon} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors">
                    {icon}
                  </div>
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