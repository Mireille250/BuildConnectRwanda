'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface PendingDoc {
  id: string;
  docType: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    district: string | null;
  };
}

export default function AdminVerificationPage() {
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const { data } = await api.get('/verification/pending?limit=20');
      setDocs(data.data);
      setTotal(data.meta.total);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(docId: string, decision: 'APPROVED' | 'REJECTED') {
    setActionLoading(docId);
    try {
      await api.patch(`/verification/${docId}/review`, {
        decision,
        adminNote: adminNote[docId] || undefined,
      });
      toast.success(`Document ${decision.toLowerCase()} successfully`);
      fetchPending();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} document{total !== 1 ? 's' : ''} pending review</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading documents...</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending documents to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                {/* User info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {doc.user.firstName} {doc.user.lastName}
                    </h3>
                    <Badge className="bg-gray-100 text-gray-600 text-xs">{doc.user.role}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{doc.user.email}</p>
                  {doc.user.district && (
                    <p className="text-xs text-gray-400 mt-0.5">📍 {doc.user.district}</p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <Badge className="bg-orange-100 text-orange-700 text-xs capitalize">
                      {doc.docType.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-400">Submitted {formatDate(doc.createdAt)}</span>
                  </div>

                  {/* Document preview link */}
                  
                   <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-orange-600 hover:underline">📄 View Document →</a>

                  {/* Admin note */}
                  <div className="mt-3">
                    <Textarea
                      placeholder="Add a note (optional, shown to user if rejected)..."
                      rows={2}
                      className="text-sm"
                      value={adminNote[doc.id] ?? ''}
                      onChange={(e) => setAdminNote((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading === doc.id}
                      onClick={() => handleReview(doc.id, 'APPROVED')}
                    >
                      {actionLoading === doc.id ? 'Processing...' : '✓ Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:border-red-300"
                      disabled={actionLoading === doc.id}
                      onClick={() => handleReview(doc.id, 'REJECTED')}
                    >
                      ✗ Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}