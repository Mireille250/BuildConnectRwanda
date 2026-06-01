'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhoto: string | null;
  bio: string | null;
  district: string | null;
  isVerified: boolean;
  createdAt: string;
  profile: {
    profession: string | null;
    skills: string[];
    experience: number | null;
    availability: boolean;
    portfolioUrl: string | null;
    linkedinUrl: string | null;
    rating: number | null;
    ratingCount: number;
    companyName: string | null;
    website: string | null;
  } | null;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    first_name: string;
    last_name: string;
  }[];
  projects: {
    id: string;
    title: string;
    description: string | null;
    images: string[];
  }[];
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    try {
      const { data } = await api.get(`/users/${userId}/profile`);
      setProfile(data);
    } catch {
      toast.error('Profile not found');
      router.push('/search');
    } finally {
      setLoading(false);
    }
  }

  async function startConversation() {
    try {
      const { data } = await api.post('/messaging/conversations', { otherUserId: userId });
      toast.success('Conversation started!');
      router.push(`/messages?conv=${data.conversationId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to start conversation');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">← Back</Button>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-4">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600 shrink-0">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                {profile.isVerified && <Badge className="bg-blue-100 text-blue-700">✓ Verified</Badge>}
              </div>
              <p className="text-orange-600 font-medium">{profile.profile?.profession ?? profile.role}</p>
              {profile.profile?.companyName && <p className="text-gray-500 text-sm">{profile.profile.companyName}</p>}
              <p className="text-gray-400 text-sm mt-1">📍 {profile.district ?? 'Rwanda'}</p>
              {profile.profile && profile.profile.ratingCount > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{Number(profile.profile.rating).toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({profile.profile.ratingCount} review{profile.profile.ratingCount !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {isOwnProfile ? (
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/profile')}>Edit Profile</Button>
              ) : (
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={startConversation}>💬 Message</Button>
              )}
              <Badge className={profile.profile?.availability ? 'bg-green-100 text-green-700 text-center' : 'bg-gray-100 text-gray-500 text-center'}>
                {profile.profile?.availability ? '🟢 Available' : '🔴 Busy'}
              </Badge>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About</h2>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">{profile.profile?.experience ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Years Experience</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{profile.profile?.ratingCount ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{profile.projects?.length ?? 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Projects</p>
            </div>
          </div>
        </div>

        {profile.profile?.skills && profile.profile.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.profile.skills.map((skill) => (
                <span key={skill} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {profile.reviews && profile.reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews ({profile.reviews.length})</h2>
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{review.first_name} {review.last_name}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">⭐</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile.profile?.portfolioUrl || profile.profile?.linkedinUrl || profile.profile?.website) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Links</h2>
            <div className="space-y-2">
              {profile.profile?.portfolioUrl && (
                <a href={profile.profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:underline text-sm">🔗 Portfolio</a>
              )}
              {profile.profile?.linkedinUrl && (
                <a href={profile.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:underline text-sm">💼 LinkedIn</a>
              )}
              {profile.profile?.website && (
                <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:underline text-sm">🌐 Website</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}