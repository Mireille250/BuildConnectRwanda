'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  portfolioUrl: string | null;
}

const DISTRICTS = [
  'All Districts','Gasabo','Kicukiro','Nyarugenge','Bugesera',
  'Gatsibo','Kayonza','Musanze','Huye','Rubavu','Rusizi',
  'Rwamagana','Burera','Gakenke','Gicumbi','Rulindo',
];

const PROFESSIONS = [
  'All Professions','Civil Engineer','Structural Engineer','Architect',
  'Quantity Surveyor','Site Engineer','Land Surveyor','Electrician',
  'Plumber','Mason','Carpenter','Welder','Painter','Roofer',
  'Steel Fixer','Tiler','Construction Company','Contractor',
  'Material Supplier','Equipment Rental',
];

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'ENGINEER', label: 'Engineers' },
  { value: 'WORKER', label: 'Skilled Workers' },
  { value: 'COMPANY', label: 'Companies' },
  { value: 'SUPPLIER', label: 'Suppliers' },
];

export default function SearchPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    profession: '',
    district: '',
    skill: '',
    minExperience: '',
    minRating: '',
    available: false,
    verified: false,
    sortBy: 'rating',
    order: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchProfessionals(1);
  }, []);

  function setFilter(key: string, value: string | boolean) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchProfessionals(p = 1, customFilters = filters) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '12');
      params.set('sortBy', customFilters.sortBy);
      params.set('order', customFilters.order);

      if (customFilters.profession && customFilters.profession !== 'All Professions') {
        params.set('profession', customFilters.profession);
      }
      if (customFilters.district && customFilters.district !== 'All Districts') {
        params.set('district', customFilters.district);
      }
      if (searchInput) params.set('skill', searchInput);
      if (customFilters.skill) params.set('skill', customFilters.skill);
      if (customFilters.minExperience) params.set('minExperience', customFilters.minExperience);
      if (customFilters.minRating) params.set('minRating', customFilters.minRating);
      if (customFilters.available) params.set('available', 'true');
      if (customFilters.verified) params.set('verified', 'true');

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

  function handleSearch() {
    fetchProfessionals(1);
  }

  function handleApplyFilters() {
    setPage(1);
    fetchProfessionals(1);
    setShowFilters(false);
  }

  function handleResetFilters() {
    const reset = {
      profession: '',
      district: '',
      skill: '',
      minExperience: '',
      minRating: '',
      available: false,
      verified: false,
      sortBy: 'rating',
      order: 'desc',
    };
    setFilters(reset);
    setSearchInput('');
    fetchProfessionals(1, reset);
  }

  function renderStars(rating: number) {
    return '⭐'.repeat(Math.round(rating)) || '☆☆☆☆☆';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Professionals</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {total} professional{total !== 1 ? 's' : ''} found in Rwanda
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>← Home</Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-3 flex-wrap">
          <div className="flex gap-2 flex-1 min-w-64">
            <Input
              placeholder="Search by skill (e.g. AutoCAD, Concrete Work...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={filters.district}
            onChange={(e) => {
              setFilter('district', e.target.value);
              fetchProfessionals(1, { ...filters, district: e.target.value });
            }}
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d === 'All Districts' ? '' : d}>{d}</option>
            ))}
          </select>

          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={filters.profession}
            onChange={(e) => {
              setFilter('profession', e.target.value);
              fetchProfessionals(1, { ...filters, profession: e.target.value });
            }}
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p === 'All Professions' ? '' : p}>{p}</option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-orange-300 text-orange-600' : ''}
          >
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="max-w-6xl mx-auto mt-3 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Min Experience (years)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={filters.minExperience}
                  onChange={(e) => setFilter('minExperience', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Min Rating</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={filters.minRating}
                  onChange={(e) => setFilter('minRating', e.target.value)}
                >
                  <option value="">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="5">5 stars only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Sort By</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={filters.sortBy}
                  onChange={(e) => setFilter('sortBy', e.target.value)}
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="createdAt">Newest</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Order</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={filters.order}
                  onChange={(e) => setFilter('order', e.target.value)}
                >
                  <option value="desc">Highest first</option>
                  <option value="asc">Lowest first</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilter('available', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Available now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilter('verified', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Searching...</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No professionals found</p>
            <p className="text-sm">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleResetFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((pro) => (
              <div
                key={pro.id}
                onClick={() => router.push(`/users/${pro.id}`)}
                className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all hover:border-orange-200 border border-transparent"
              >
                {/* Avatar + Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600 shrink-0">
                    {pro.firstName[0]}{pro.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {pro.firstName} {pro.lastName}
                      </h3>
                      {pro.isVerified && (
                        <span className="text-blue-500 text-xs shrink-0">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-orange-600 truncate">
                      {pro.profession ?? pro.role}
                    </p>
                    {pro.companyName && (
                      <p className="text-xs text-gray-400 truncate">{pro.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Rating & Experience */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {pro.rating > 0 ? (
                      <>
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm font-medium">{pro.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({pro.ratingCount})</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews yet</span>
                    )}
                  </div>
                  {pro.experience !== null && (
                    <span className="text-xs text-gray-500">
                      {pro.experience} yr{pro.experience !== 1 ? 's' : ''} exp
                    </span>
                  )}
                </div>

                {/* Skills */}
                {pro.skills && pro.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pro.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {pro.skills.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{pro.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-400">
                    📍 {pro.district ?? 'Rwanda'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pro.availability
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {pro.availability ? '🟢 Available' : '🔴 Busy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 pt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => fetchProfessionals(page - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(total / 12)}
              onClick={() => fetchProfessionals(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}