'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DISTRICTS = [
  'Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo','Kayonza',
  'Kirehe','Ngoma','Nyagatare','Rwamagana','Burera','Gakenke',
  'Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi',
  'Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Karongi',
  'Ngororero','Nyabihu','Rubavu','Rusizi','Rutsiro',
];

const PROFESSIONS = [
  'Civil Engineer','Structural Engineer','Architect','Quantity Surveyor',
  'Site Engineer','Land Surveyor','Electrician','Plumber','Mason',
  'Carpenter','Welder','Painter','Roofer','Steel Fixer','Tiler',
  'Construction Company','Contractor','Material Supplier','Equipment Rental',
];

const SKILLS_LIST = [
  'AutoCAD','Revit','SketchUp','Structural Analysis','Cost Estimation',
  'Project Management','Building Inspection','Concrete Work','Steel Fabrication',
  'Electrical Wiring','Plumbing Installation','Roofing','Painting & Finishing',
  'Carpentry','Welding','Tile Setting','Site Supervision','Safety Management',
];

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhoto: string | null;
  bio: string | null;
  phone: string | null;
  district: string | null;
  isVerified: boolean;
  profile: {
    profession: string | null;
    skills: string[];
    experience: number | null;
    availability: boolean;
    portfolioUrl: string | null;
    linkedinUrl: string | null;
    rating: number | null;
    ratingCount: number;
    licenseNumber: string | null;
    institution: string | null;
    graduationYear: number | null;
    companyName: string | null;
    registrationNo: string | null;
    website: string | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'professional' | 'security'>('info');
  const [skillInput, setSkillInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', district: '', bio: '',
    profession: '', skills: [] as string[], experience: '',
    availability: true, portfolioUrl: '', linkedinUrl: '',
    licenseNumber: '', institution: '', graduationYear: '',
    companyName: '', registrationNo: '', website: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const { data } = await api.get('/users/me/profile');
      setProfileData(data);
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        district: data.district ?? '',
        bio: data.bio ?? '',
        profession: data.profile?.profession ?? '',
        skills: data.profile?.skills ?? [],
        experience: data.profile?.experience?.toString() ?? '',
        availability: data.profile?.availability ?? true,
        portfolioUrl: data.profile?.portfolioUrl ?? '',
        linkedinUrl: data.profile?.linkedinUrl ?? '',
        licenseNumber: data.profile?.licenseNumber ?? '',
        institution: data.profile?.institution ?? '',
        graduationYear: data.profile?.graduationYear?.toString() ?? '',
        companyName: data.profile?.companyName ?? '',
        registrationNo: data.profile?.registrationNo ?? '',
        website: data.profile?.website ?? '',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  }

  async function handlePhotoUpload(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/users/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfileData((prev) => prev ? { ...prev, profilePhoto: data.profilePhoto } : null);
      updateUser({ profilePhoto: data.profilePhoto });
      toast.success('Profile photo updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function setField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill(skill: string) {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
      setSkillInput('');
    }
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        district: form.district || undefined,
        bio: form.bio || undefined,
        profession: form.profession || undefined,
        skills: form.skills,
        experience: form.experience ? Number(form.experience) : undefined,
        availability: form.availability,
        portfolioUrl: form.portfolioUrl || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        licenseNumber: form.licenseNumber || undefined,
        institution: form.institution || undefined,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        companyName: form.companyName || undefined,
        registrationNo: form.registrationNo || undefined,
        website: form.website || undefined,
      };

      const { data } = await api.patch('/users/me/profile', payload);
      setProfileData(data);
      updateUser({ firstName: form.firstName, lastName: form.lastName });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
      </div>
    );
  }

  const isEngineer = user?.role === 'ENGINEER';
  const isCompany = ['COMPANY', 'SUPPLIER'].includes(user?.role ?? '');
  const isWorker = user?.role === 'WORKER';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="font-bold text-gray-900 hidden sm:block">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          </a>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => router.push('/dashboard')}>
            ← Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Photo Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              {profileData?.profilePhoto ? (
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-900 flex items-center justify-center text-3xl font-bold text-white">
                  {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                </div>
              )}
              {/* Upload overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-lg">📷</span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData?.firstName} {profileData?.lastName}
                </h2>
                {profileData?.isVerified && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">✓ Verified</Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">{profileData?.role} · {profileData?.district ?? 'Rwanda'}</p>
              {profileData?.profile?.rating !== null && profileData?.profile?.ratingCount ? (
                <p className="text-amber-500 text-sm mt-1">
                  ⭐ {Number(profileData?.profile?.rating).toFixed(1)} ({profileData?.profile?.ratingCount} reviews)
                </p>
              ) : null}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="mt-2 text-xs text-blue-600 hover:underline font-medium"
              >
                {uploadingPhoto ? 'Uploading...' : '📷 Change profile photo'}
              </button>
            </div>

            <Badge className={profileData?.profile?.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
              {profileData?.profile?.availability ? '🟢 Available' : '🔴 Unavailable'}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { key: 'info', label: 'Personal Info' },
            { key: 'professional', label: 'Professional' },
            { key: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'info' && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">First Name</label>
                  <Input value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Last Name</label>
                  <Input value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} className="rounded-xl border-gray-200" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <Input value={profileData?.email ?? ''} disabled className="bg-gray-50 text-gray-400 rounded-xl border-gray-200" />
                <p className="text-xs text-gray-400">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <Input placeholder="+250 7XX XXX XXX" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">District</label>
                  <select
                    className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500"
                    value={form.district}
                    onChange={(e) => setField('district', e.target.value)}
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Bio</label>
                <Textarea
                  placeholder="Tell clients about yourself..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                  className="rounded-xl border-gray-200 resize-none"
                />
              </div>

              <Button
                className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Profession</label>
                  <select
                    className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm bg-white outline-none focus:border-blue-500"
                    value={form.profession}
                    onChange={(e) => setField('profession', e.target.value)}
                  >
                    <option value="">Select profession</option>
                    {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Years of Experience</label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    placeholder="e.g. 5"
                    value={form.experience}
                    onChange={(e) => setField('experience', e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Availability</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setField('availability', true)}
                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${form.availability ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 bg-white'}`}
                  >
                    🟢 Available for work
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('availability', false)}
                    className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${!form.availability ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 bg-white'}`}
                  >
                    🔴 Not available
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Skills</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                    className="rounded-xl border-gray-200"
                  />
                  <Button type="button" variant="outline" onClick={() => addSkill(skillInput)} className="rounded-xl">Add</Button>
                </div>
                {/* Quick add */}
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS_LIST.filter((s) => !form.skills.includes(s)).slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
                {/* Selected */}
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                    {form.skills.map((skill) => (
                      <span key={skill} className="flex items-center gap-1 text-sm bg-blue-900 text-white px-3 py-1 rounded-full">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-300 ml-0.5 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Engineer credentials */}
              {(isEngineer || isWorker) && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-sm font-bold text-gray-700">Credentials</p>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">License / Certificate Number</label>
                    <Input placeholder="e.g. ENG-2019-00234" value={form.licenseNumber} onChange={(e) => setField('licenseNumber', e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Institution</label>
                      <Input placeholder="e.g. University of Rwanda" value={form.institution} onChange={(e) => setField('institution', e.target.value)} className="rounded-xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Graduation Year</label>
                      <Input type="number" placeholder="e.g. 2018" value={form.graduationYear} onChange={(e) => setField('graduationYear', e.target.value)} className="rounded-xl border-gray-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* Company fields */}
              {isCompany && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-sm font-bold text-gray-700">Company Details</p>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Company Name</label>
                    <Input placeholder="e.g. Kigali Construction Ltd" value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} className="rounded-xl border-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Registration No.</label>
                      <Input placeholder="e.g. RDB-2020-12345" value={form.registrationNo} onChange={(e) => setField('registrationNo', e.target.value)} className="rounded-xl border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Website</label>
                      <Input placeholder="https://yourcompany.rw" value={form.website} onChange={(e) => setField('website', e.target.value)} className="rounded-xl border-gray-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-sm font-bold text-gray-700">Links</p>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Portfolio URL</label>
                  <Input placeholder="https://yourportfolio.com" value={form.portfolioUrl} onChange={(e) => setField('portfolioUrl', e.target.value)} className="rounded-xl border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">LinkedIn URL</label>
                  <Input placeholder="https://linkedin.com/in/yourname" value={form.linkedinUrl} onChange={(e) => setField('linkedinUrl', e.target.value)} className="rounded-xl border-gray-200" />
                </div>
              </div>

              <Button
                className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Save Professional Details'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="rounded-xl border-gray-200"
                />
                <p className="text-xs text-gray-400">Min 8 characters with uppercase, lowercase and number</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <Button
                className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold"
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}