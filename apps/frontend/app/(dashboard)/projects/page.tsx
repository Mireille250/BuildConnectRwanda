'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Infrastructure', 'Hospitality', 'Public', 'Educational'];

const PROJECTS = [
  { title: 'Kigali Heights Tower', by: 'Jean-Paul Habimana', category: 'Commercial', likes: 412, views: 1648, image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', size: 'tall' },
  { title: '', by: '', category: '', likes: 0, views: 0, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', size: 'tall', placeholder: true },
  { title: '', by: '', category: '', likes: 0, views: 0, image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80', size: 'tall', placeholder: true },
  { title: 'Nyamirambo Residences', by: 'Aline Mukamana', category: 'Residential', likes: 287, views: 1148, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', size: 'normal' },
  { title: 'Kimironko Market', by: 'BuildRight Co.', category: 'Public', likes: 156, views: 624, image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', size: 'normal' },
  { title: 'Rwanda Conference Centre', by: 'BuildRight Co.', category: 'Commercial', likes: 489, views: 1956, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', size: 'normal' },
  { title: 'Lake Kivu Resort', by: 'Lake Kivu Co.', category: 'Hospitality', likes: 524, views: 2096, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', size: 'normal' },
  { title: 'UR Campus Extension', by: 'Kigali Developments', category: 'Educational', likes: 211, views: 844, image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80', size: 'normal' },
  { title: 'Musanze Highway Bridge', by: 'RTDA Contractor', category: 'Infrastructure', likes: 198, views: 792, image: 'https://images.unsplash.com/photo-1545158539-1b50029b6e35?w=800&q=80', size: 'wide' },
  { title: 'Green Hills Villa', by: 'Aline Mukamana', category: 'Residential', likes: 342, views: 1368, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', size: 'wide' },
];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? PROJECTS.filter((p) => !p.placeholder)
    : PROJECTS.filter((p) => p.category === activeCategory);

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
              { label: 'Projects', href: '/projects', active: true },
              { label: 'Suppliers', href: '/suppliers' },
            ].map((item) => (
              <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors px-3 py-1 rounded-full ${item.active ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</a>
            <a href="/register">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold">Join free</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center py-16 px-6 max-w-3xl mx-auto">
        <p className="text-amber-500 font-semibold text-sm uppercase tracking-widest mb-3">Built in Rwanda</p>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Project Showcase</h1>
        <p className="text-gray-500 text-lg mb-8">Real projects delivered by professionals on the BuildConnect network.</p>

        {/* Category pills */}
        <div className="flex gap-2 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {filtered.map((project, i) => (
            <div
              key={project.title + i}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                project.size === 'tall' ? 'row-span-2' : project.size === 'wide' ? 'md:col-span-2' : ''
              }`}
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {project.title && (
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block text-xs bg-amber-500 text-white px-2.5 py-1 rounded-full font-semibold mb-2">
                    {project.category}
                  </span>
                  <h3 className="text-white font-bold text-lg leading-tight">{project.title}</h3>
                  <p className="text-gray-300 text-sm mt-0.5">by {project.by}</p>
                  <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
                    <span className="flex items-center gap-1">♡ {project.likes}</span>
                    <span className="flex items-center gap-1">👁 {project.views}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="font-bold text-gray-900">BuildConnect <span className="text-amber-500">Rwanda</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">The digital ecosystem connecting Rwanda's construction industry. Trusted professionals, verified workers, and quality suppliers — all in one place.</p>
              <div className="flex gap-3">
                {['f', 'X', 'in', '📷'].map((icon) => (
                  <div key={icon} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors">{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Platform</p>
              <div className="space-y-2 text-sm text-gray-500">
                {['Find Professionals', 'Job Marketplace', 'Project Showcase', 'Suppliers'].map((item) => (
                  <p key={item} className="hover:text-blue-900 cursor-pointer transition-colors">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Company</p>
              <div className="space-y-2 text-sm text-gray-500">
                {['About', 'Verification', 'Pricing', 'Careers'].map((item) => (
                  <p key={item} className="hover:text-blue-900 cursor-pointer transition-colors">{item}</p>
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
                <span key={item} className="hover:text-gray-600 cursor-pointer transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}