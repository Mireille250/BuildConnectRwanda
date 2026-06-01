'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    district: '',
    budgetMin: '',
    budgetMax: '',
    profession: '',
    requiredSkills: [] as string[],
    deadline: '',
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSkill() {
    const skill = skillInput.trim();
    if (skill && !form.requiredSkills.includes(skill)) {
      setForm((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, skill] }));
      setSkillInput('');
    }
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.title || !form.description || !form.district) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        district: form.district,
        requiredSkills: form.requiredSkills,
      };
      if (form.profession) payload.profession = form.profession;
      if (form.budgetMin) payload.budgetMin = Number(form.budgetMin);
      if (form.budgetMax) payload.budgetMax = Number(form.budgetMax);
      if (form.deadline) payload.deadline = form.deadline;

      const { data } = await api.post('/jobs', payload);
      toast.success('Job posted successfully!');
      router.push(`/jobs/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Failed to post job');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push('/jobs')}>← Back</Button>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title *</label>
                <Input
                  placeholder="e.g. Need a Civil Engineer for house foundation"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe the work needed, requirements, timeline..."
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">District *</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.district}
                    onChange={(e) => set('district', e.target.value)}
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profession Needed</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={form.profession}
                    onChange={(e) => set('profession', e.target.value)}
                  >
                    <option value="">Any profession</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Budget (RWF)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 500000"
                    value={form.budgetMin}
                    onChange={(e) => set('budgetMin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Budget (RWF)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1500000"
                    value={form.budgetMax}
                    onChange={(e) => set('budgetMax', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Application Deadline</label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set('deadline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Required Skills</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. AutoCAD"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                </div>
                {form.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/jobs')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}