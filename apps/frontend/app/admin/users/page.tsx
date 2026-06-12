'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  district: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  profession: string | null;
  rating: number;
  applicationCount: number;
  jobCount: number;
}

const ROLES = ['', 'CLIENT', 'ENGINEER', 'WORKER', 'COMPANY', 'SUPPLIER', 'ADMIN'];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.data);
      setTotal(data.meta.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(userId: string, currentStatus: boolean) {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Action failed');
    } finally {
      setActionLoading('');
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-64">
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
          />
          <Button variant="outline" onClick={() => { setSearch(searchInput); setPage(1); }}>
            Search
          </Button>
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r || 'All Roles'}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">District</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stats</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    <p className="font-medium text-sm text-gray-900 hover:text-orange-600">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {user.profession && (
                      <p className="text-xs text-orange-500">{user.profession}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'ENGINEER' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'WORKER' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {user.district ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {user.rating > 0 && <p>⭐ {user.rating.toFixed(1)}</p>}
                    {user.jobCount > 0 && <p>{user.jobCount} jobs posted</p>}
                    {user.applicationCount > 0 && <p>{user.applicationCount} applications</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Badge className={user.isActive ? 'bg-green-100 text-green-700 text-xs' : 'bg-red-100 text-red-700 text-xs'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {user.isVerified && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">✓ Verified</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {user.role !== 'ADMIN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`text-xs ${!user.isActive ? 'text-green-600 hover:border-green-300' : 'text-red-500 hover:border-red-300'}`}
                      disabled={actionLoading === user.id}
                      onClick={() => toggleStatus(user.id, user.isActive)}
                    >
                      {actionLoading === user.id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 15)}
          </span>
          <Button variant="outline" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}