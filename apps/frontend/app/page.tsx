'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: '8,400+', label: 'Verified Professionals' },
  { value: '2,100+', label: 'Completed Projects' },
  { value: '5,200+', label: 'Skilled Workers' },
  { value: '1,300+', label: 'Active Jobs' },
];

const TRADES = [
  { icon: '🧭', title: 'Engineers', desc: 'Civil, structural & site engineers', count: '2,400+' },
  { icon: '🏛️', title: 'Architects', desc: 'Award-winning design talent', count: '860+' },
  { icon: '⛑️', title: 'Skilled Workers', desc: 'Masons, welders, electricians', count: '5,200+' },
  { icon: '💼', title: 'Companies', desc: 'Licensed construction firms', count: '320+' },
  { icon: '🚛', title: 'Suppliers', desc: 'Materials & equipment', count: '640+' },
  { icon: '🔧', title: 'Contractors', desc: 'General & specialty contractors', count: '1,100+' },
];

const FEATURED = [
  { name: 'Jean-Paul Habimana', role: 'Structural Engineer', rating: 4.9, reviews: 87, years: 12, location: 'Kigali', skills: ['Structural Design', 'BIM'], verified: true },
  { name: 'Aline Mukamana', role: 'Architect', rating: 5.0, reviews: 64, years: 9, location: 'Musanze', skills: ['Residential', 'Sustainable Design'], verified: true },
  { name: 'Eric Niyongabo', role: 'Master Mason', rating: 4.8, reviews: 142, years: 15, location: 'Huye', skills: ['Stonework', 'Bricklaying'], verified: true },
  { name: 'Diane Uwase', role: 'Quantity Surveyor', rating: 4.9, reviews: 53, years: 8, location: 'Kigali', skills: ['BOQ', 'Cost Planning'], verified: true },
];

const PROJECTS = [
  { title: 'Nyamirambo Residences', category: 'Residential', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },
  { title: 'Musanze Highway Bridge', category: 'Infrastructure', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80' },
  { title: 'Kigali Business Park', category: 'Commercial', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
];

const TESTIMONIALS = [
  { text: 'BuildConnect helped us assemble a vetted team in days, not months. The verification badges gave our investors immediate confidence.', name: 'Patrick K.', role: 'Project Director, Kigali Developments' },
  { text: 'As a quantity surveyor, this platform has tripled my client base. The job marketplace is unmatched in Rwanda.', name: 'Diane U.', role: 'Quantity Surveyor' },
  { text: 'Finding reliable masons used to be word-of-mouth. Now I just open the app and hire verified skilled workers same-day.', name: 'Emmanuel R.', role: 'Property Owner' },
];

const TRUST_FEATURES = [
  'Degree & certification checks',
  'Government-issued ID verification',
  'Verified company licensing',
  'Authentic reviews from real clients',
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('All Rwanda');

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAuthenticated) return null;

  function handleSearch() {
    router.push(`/register`);
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">B</div>
            <span className="text-lg font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Find Professionals', 'Jobs', 'Projects', 'Suppliers'].map((item) => (
              <Link key={item} href="/register" className="text-sm text-gray-600 hover:text-blue-900 font-medium transition-colors">{item}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-900">Sign in</Link>
            <Link href="/register">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold px-5">Join free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-20 min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80"
            alt="Construction"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/75" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="inline-flex items-center gap-2 border border-amber-400/50 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
             Rwanda's #1 construction network
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-4xl">
            Connecting Rwanda's{' '}
            <span className="text-amber-500">Construction</span>{' '}
            Industry
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
            Find trusted engineers, skilled workers, suppliers, and construction companies — all in one place.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 flex-1 px-4 py-2">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search engineer, mason, architect, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t md:border-t-0 md:border-l border-gray-100">
              <span className="text-gray-400">📍</span>
              <select
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="outline-none text-sm text-gray-600 bg-transparent"
              >
                <option>All Rwanda</option>
                <option>Kigali</option>
                <option>Gasabo</option>
                <option>Musanze</option>
                <option>Huye</option>
                <option>Rubavu</option>
              </select>
            </div>
            <Button
              onClick={handleSearch}
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl px-8 py-3"
            >
              Search
            </Button>
          </div>

          <div className="flex gap-4 mt-6">
            <Link href="/register">
              <Button className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl px-6">
                Find Professionals →
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl px-6 backdrop-blur-sm">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-blue-900">{s.value}</p>
              <p className="text-gray-500 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Every Trade ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Explore</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Every trade. One platform.</h2>
          <p className="text-gray-500 mb-12 max-w-xl">From licensed engineers to master craftsmen, find the right talent for every stage of your build.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRADES.map((trade) => (
              <Link href="/register" key={trade.title}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors">
                      {trade.icon}
                    </div>
                    <span className="text-amber-500 font-bold text-sm">{trade.count}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{trade.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{trade.desc}</p>
                  <span className="text-blue-900 font-semibold text-sm group-hover:underline">Browse →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Professionals ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Top Talent</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Featured professionals</h2>
          <p className="text-gray-500 mb-12">Hand-picked, verified, and ready to take on your next project.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED.map((pro) => (
              <div key={pro.name} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {pro.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-gray-900 text-sm">{pro.name}</p>
                      {pro.verified && <span className="text-blue-500 text-xs">✓</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{pro.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="text-amber-500">⭐</span>
                  <span className="font-semibold text-gray-900">{pro.rating}</span>
                  <span>({pro.reviews})</span>
                  <span>·</span>
                  <span>{pro.years} yrs</span>
                  <span>·</span>
                  <span>📍 {pro.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {pro.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href="/register" className="flex-1">
                    <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white text-xs py-1.5 rounded-lg">Hire Now</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="text-xs py-1.5 rounded-lg px-3">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built in Rwanda (Portfolio) ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Portfolio</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Built in Rwanda</h2>
          <p className="text-gray-500 mb-12">Real projects delivered by professionals on the platform.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROJECTS.map((project, i) => (
              <div key={project.title} className={`relative rounded-2xl overflow-hidden ${i === 0 ? 'md:row-span-2 md:col-span-1' : ''}`}>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  style={{ minHeight: i === 0 ? '400px' : '180px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">{project.category}</span>
                  <p className="text-white font-bold mt-1">{project.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-24 bg-blue-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-amber-400/50 text-amber-400 px-3 py-1 rounded-full text-xs font-medium mb-6">
                Trust & Safety
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                Every professional verified.<br />Every project protected.
              </h2>
              <p className="text-blue-200 mb-8 leading-relaxed">
                Our verification system checks degrees, licenses, and certifications before a badge is awarded — so you hire with confidence.
              </p>
              <div className="space-y-3">
                {TRUST_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🛡️', label: 'Verified' },
                { icon: '⭐', label: 'Top Rated' },
                { icon: '👥', label: '8,400+ Pros' },
                { icon: '💼', label: '1,300 Jobs' },
              ].map((item) => (
                <div key={item.label} className="bg-blue-800/50 rounded-2xl p-6 border border-blue-700/50 text-center">
                  <span className="text-3xl text-amber-400">{item.icon}</span>
                  <p className="text-white font-semibold mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Loved by Builders</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">What Rwanda is saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-5xl text-amber-200 font-serif mb-4">"</div>
                <p className="text-gray-700 leading-relaxed mb-6">{t.text}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-white mb-4">Ready to build something great?</h2>
              <p className="text-blue-200 mb-8 text-lg">Join thousands of Rwandan professionals and clients shaping the future of construction.</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl text-base">
                    Get started free
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-xl text-base backdrop-blur-sm">
                    Browse professionals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
              </Link>
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
                  <Link key={item} href="/register" className="block hover:text-blue-900 transition-colors">{item}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-4">Company</p>
              <div className="space-y-2 text-sm text-gray-500">
                {['About', 'Verification', 'Pricing', 'Careers'].map((item) => (
                  <Link key={item} href="/register" className="block hover:text-blue-900 transition-colors">{item}</Link>
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
                <Link key={item} href="/register" className="hover:text-gray-600 transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}