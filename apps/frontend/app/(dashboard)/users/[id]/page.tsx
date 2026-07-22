'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { SkeletonPublicProfile } from '@/components/shared/Skeletons';
interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhoto: string | null;
  bio: string | null;
  district: string | null;
  email: string;
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
    institution: string | null;
    graduationYear: number | null;
    licenseNumber: string | null;
  } | null;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    first_name: string;
    last_name: string;
  }[];
  projects: { id: string; title: string; images: string[] }[];
}

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80',
  'https://images.unsplash.com/photo-1545158539-1b50029b6e35?w=600&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
];

const COVER_IMAGE = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80';
const AVATAR_FALLBACK = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, [userId]);

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
      router.push(`/messages?conv=${data.conversationId}`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please sign in to send a message');
        router.push('/login');
        return;
      }
      toast.error(error.response?.data?.message ?? 'Failed to start conversation');
    }
  }

  if (loading) {
  return <SkeletonPublicProfile />;
}

  if (!profile) return null;

  const isOwnProfile = user?.id === userId;

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
              { label: 'Jobs', href: '/jobs' },
              { label: 'Projects', href: '/projects' },
              { label: 'Suppliers', href: '/suppliers' },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-full">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="outline" className="text-sm rounded-lg" onClick={() => router.push('/dashboard')}>Dashboard</Button>
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

      {/* Cover Image */}
      <div className="h-64 relative">
        <img src={COVER_IMAGE} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/50" />
      </div>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 -mt-20 relative z-10 p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <img
              src={profile.profilePhoto ?? AVATAR_FALLBACK}
              alt={profile.firstName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md -mt-12"
              onError={(e) => { (e.target as HTMLImageElement).src = AVATAR_FALLBACK; }}
            />
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                {profile.isVerified && <span className="text-blue-500 text-lg">✓</span>}
              </div>
              <p className="text-gray-500 mt-0.5">
                {profile.profile?.profession ?? profile.role}
                {profile.profile?.experience !== null && profile.profile?.experience !== undefined && ` · ${profile.profile.experience} years experience`}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                {profile.profile && profile.profile.ratingCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500">⭐</span>
                    <span className="font-bold text-gray-900">{Number(profile.profile.rating).toFixed(1)}</span>
                    <span>({profile.profile.ratingCount} reviews)</span>
                  </span>
                )}
                <span>📍 {profile.district ?? 'Rwanda'}</span>
                <span className="flex items-center gap-1">💼 {profile.projects?.length ?? 0} projects</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 pt-1">
              {isOwnProfile ? (
                <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold" onClick={() => router.push('/profile')}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="rounded-xl border-gray-200 font-medium" onClick={startConversation}>
                    💬 Message
                  </Button>
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold" onClick={startConversation}>
                    Hire Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-12">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Project Gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Project Gallery</h2>
              <div className="grid grid-cols-3 gap-3">
                {GALLERY_IMAGES.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt={`Project ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Reviews</h2>
              {profile.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {profile.reviews.map((review, i) => (
                    <div key={review.id} className={i < profile.reviews.length - 1 ? 'pb-4 border-b border-gray-100' : ''}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm">{review.first_name} {review.last_name[0]}.</p>
                        <span className="text-amber-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      {review.comment && <p className="text-gray-500 text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Skills */}
            {profile.profile?.skills && profile.profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {(profile.profile?.institution || profile.profile?.licenseNumber) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="space-y-3">
                  {profile.profile?.institution && (
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 text-lg shrink-0">🏅</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{profile.profile.institution}</p>
                        {profile.profile.graduationYear && <p className="text-xs text-gray-400">{profile.profile.graduationYear}</p>}
                      </div>
                    </div>
                  )}
                  {profile.profile?.licenseNumber && (
                    <div className="flex items-start gap-3">
                      <span className="text-amber-500 text-lg shrink-0">🏅</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Licensed Professional</p>
                        <p className="text-xs text-gray-400">{profile.profile.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex items-center gap-2">✉️ {profile.email}</p>
                <p className="flex items-center gap-2">📍 {profile.district ?? 'Rwanda'}</p>
              </div>
              {!isOwnProfile && (
                <Button className="w-full mt-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold" onClick={startConversation}>
                  Send Message
                </Button>
              )}
            </div>

            {/* Availability */}
            <div className={`rounded-2xl p-6 text-center ${profile.profile?.availability ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
              <p className="text-2xl mb-1">{profile.profile?.availability ? '🟢' : '🔴'}</p>
              <p className="font-bold text-gray-900 text-sm">{profile.profile?.availability ? 'Available for hire' : 'Currently unavailable'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}