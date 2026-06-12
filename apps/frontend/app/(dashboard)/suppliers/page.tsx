'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const SUPPLIERS = [
  { name: 'Kigali Steel & Iron', category: 'Steel & Rebar', rating: 4.8, products: 142, location: 'Kigali', verified: true, image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
  { name: 'Rwanda Cement Co.', category: 'Cement & Aggregates', rating: 4.9, products: 28, location: 'Musanze', verified: true, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { name: 'EastAfrica Glass', category: 'Glass & Aluminum', rating: 4.6, products: 89, location: 'Kigali', verified: true, image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80' },
  { name: 'Heavy Lift Rwanda', category: 'Equipment Rental', rating: 4.7, products: 56, location: 'Kigali', verified: true, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80' },
  { name: 'Akagera Lumber', category: 'Wood & Timber', rating: 4.5, products: 73, location: 'Nyagatare', verified: true, image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80' },
  { name: 'BuildPaint Rwanda', category: 'Paints & Finishes', rating: 4.8, products: 210, location: 'Kigali', verified: true, image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80' },
  { name: 'Kigali Tiles & Marble', category: 'Tiles & Flooring', rating: 4.7, products: 95, location: 'Kigali', verified: true, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80' },
  { name: 'RwandaBuild Electricals', category: 'Electrical Supplies', rating: 4.6, products: 180, location: 'Huye', verified: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { name: 'Volcano Stone Works', category: 'Stone & Masonry', rating: 4.9, products: 44, location: 'Musanze', verified: true, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
];

const CATEGORIES = [
  'All Categories', 'Steel & Rebar', 'Cement & Aggregates', 'Glass & Aluminum',
  'Equipment Rental', 'Wood & Timber', 'Paints & Finishes', 'Tiles & Flooring',
  'Electrical Supplies', 'Stone & Masonry', 'Plumbing Supplies',
];

export default function SuppliersPage() {
  const router = useRouter();

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
              { label: 'Suppliers', href: '/suppliers', active: true },
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

      {/* Hero */}
      <div className="bg-blue-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-2">Supplier Marketplace</h1>
          <p className="text-blue-200 mb-8">Verified material suppliers and equipment rentals across Rwanda</p>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPLIERS.map((supplier) => (
            <div key={supplier.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all">
              {/* Cover image */}
              <div className="h-48 overflow-hidden">
                <img src={supplier.image} alt={supplier.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                    {supplier.verified && <span className="text-blue-500 text-sm">✓</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-sm">⭐</span>
                    <span className="text-sm font-semibold text-gray-900">{supplier.rating}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-3">{supplier.category}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">🗂️ {supplier.products} products</span>
                  <span>·</span>
                  <span>📍 {supplier.location}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl" onClick={() => router.push('/register')}>
                    Request Quote
                  </Button>
                  <Button variant="outline" className="border-gray-200 text-gray-700 text-sm rounded-xl px-4" onClick={() => router.push('/register')}>
                    Catalog
                  </Button>
                </div>
              </div>
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