'use client';

import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'info' | 'professional' | 'security'>('info');
  const [skillInput, setSkillInput] = useState('');

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    district: '',
    bio: '',
    profession: '',
    skills: [] as string[],
    experience: '',
    availability: true,
    portfolioUrl: '',
    linkedinUrl: '',
    licenseNumber: '',
    institution: '',
    graduationYear: '',
    companyName: '',
    registrationNo: '',
    website: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data } = await api.get('/users/me/profile');
      setProfileData(data);
      // Populate form
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
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
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
    setSaving(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed. Please login again.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading profile...</p>
    </div>
  );

  const isEngineer = ['ENGINEER'].includes(user?.role ?? '');
  const isCompany = ['COMPANY', 'SUPPLIER'].includes(user?.role ?? '');
  const isWorker = user?.role === 'WORKER';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push('/')}>← Home</Button>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600">
                {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profileData?.firstName} {profileData?.lastName}
                  </h2>
                  {profileData?.isVerified && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">✓ Verified</Badge>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{profileData?.role} · {profileData?.district ?? 'Rwanda'}</p>
                {profileData?.profile?.rating !== null && (
                  <p className="text-sm text-orange-600 mt-0.5">
                    ⭐ {Number(profileData?.profile?.rating).toFixed(1)} ({profileData?.profile?.ratingCount} reviews)
                  </p>
                )}
              </div>
              <Badge className="bg-gray-100 text-gray-600">
                {profileData?.profile?.availability ? '🟢 Available' : '🔴 Unavailable'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { key: 'info', label: 'Personal Info' },
            { key: 'professional', label: 'Professional' },
            { key: 'security', label: 'Security' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
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
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={profileData?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-400">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    placeholder="+250 7XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.district}
                    onChange={(e) => setField('district', e.target.value)}
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  placeholder="Tell clients about yourself, your experience and what you do..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profession</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.profession}
                    onChange={(e) => setField('profession', e.target.value)}
                  >
                    <option value="">Select profession</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience</label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    placeholder="e.g. 5"
                    value={form.experience}
                    onChange={(e) => setField('experience', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setField('availability', true)}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                      form.availability
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    🟢 Available for work
                  </button>
                  <button
                    type="button"
                    onClick={() => setField('availability', false)}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                      !form.availability
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white text-gray-500'
                    }`}
                  >
                    🔴 Not available
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill or select below"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  />
                  <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                    Add
                  </Button>
                </div>
                {/* Quick add from list */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {SKILLS_LIST.filter((s) => !form.skills.includes(s)).slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
                {/* Selected skills */}
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Engineer-specific fields */}
              {(isEngineer || isWorker) && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Credentials</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">License / Certificate Number</label>
                        <Input
                          placeholder="e.g. ENG-2019-00234"
                          value={form.licenseNumber}
                          onChange={(e) => setField('licenseNumber', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Institution</label>
                          <Input
                            placeholder="e.g. University of Rwanda"
                            value={form.institution}
                            onChange={(e) => setField('institution', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Graduation Year</label>
                          <Input
                            type="number"
                            placeholder="e.g. 2018"
                            value={form.graduationYear}
                            onChange={(e) => setField('graduationYear', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Company-specific fields */}
              {isCompany && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Company Details</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        placeholder="e.g. Kigali Construction Ltd"
                        value={form.companyName}
                        onChange={(e) => setField('companyName', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Registration Number</label>
                        <Input
                          placeholder="e.g. RDB-2020-12345"
                          value={form.registrationNo}
                          onChange={(e) => setField('registrationNo', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Website</label>
                        <Input
                          placeholder="https://yourcompany.rw"
                          value={form.website}
                          onChange={(e) => setField('website', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">Links</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Portfolio URL</label>
                  <Input
                    placeholder="https://yourportfolio.com"
                    value={form.portfolioUrl}
                    onChange={(e) => setField('portfolioUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    placeholder="https://linkedin.com/in/yourname"
                    value={form.linkedinUrl}
                    onChange={(e) => setField('linkedinUrl', e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Professional Details'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
                <p className="text-xs text-gray-400">
                  Must be 8+ characters with uppercase, lowercase and a number
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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