'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VerificationDoc {
  id: string;
  docType: string;
  fileUrl: string;
  status: string;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const DOC_TYPES = [
  { value: 'degree', label: 'University Degree' },
  { value: 'certificate', label: 'Professional Certificate' },
  { value: 'license', label: 'License' },
  { value: 'national_id', label: 'National ID' },
  { value: 'company_registration', label: 'Company Registration' },
];

export default function VerificationPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    try {
      const { data } = await api.get('/verification/my');
      setDocs(data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('docType', docType);

      await api.post('/verification/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document uploaded successfully! Pending admin review.');
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchDocs();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-RW', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>← Dashboard</Button>
          <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 font-medium">Why get verified?</p>
          <p className="text-sm text-blue-600 mt-1">
            Verified professionals appear higher in search results, get more job applications accepted, and build more client trust.
          </p>
        </div>

        {/* Upload form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Upload Document</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">File (JPG, PNG or PDF — max 5MB)</label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {selectedFile ? (
                  <div>
                    <p className="text-green-600 font-medium">✓ {selectedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-2">📄</p>
                    <p className="text-gray-500 text-sm">Click to select a file</p>
                    <p className="text-gray-400 text-xs mt-1">JPG, PNG or PDF</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>

        {/* Uploaded documents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            My Documents ({docs.length})
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
          ) : docs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {doc.docType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Uploaded {formatDate(doc.createdAt)}
                    </p>
                    {doc.adminNote && (
                      <p className="text-xs text-red-500 mt-0.5">Note: {doc.adminNote}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${statusColor(doc.status)}`}>
                      {doc.status}
                    </Badge>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline">View</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}