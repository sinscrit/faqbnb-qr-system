import Link from 'next/link';
import { QrCode, Smartphone, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">QR Item Display</h1>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Instant Access to
            <span className="text-blue-600"> Item Instructions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Scan QR codes to instantly access detailed instructions, manuals, videos, and resources 
            for any appliance or item. No apps, no logins, just instant information.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Optimized</h3>
            <p className="text-gray-600">
              Perfectly designed for mobile devices with touch-friendly interfaces and fast loading times.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Access</h3>
            <p className="text-gray-600">
              No downloads, no accounts needed. Scan and access information immediately from any device.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Media</h3>
            <p className="text-gray-600">
              Support for videos, PDFs, images, and web links with automatic thumbnail generation.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Try It Out</h2>
            <p className="text-gray-600">
              Click on any of these sample items to see how the system works:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: '8d678bd0-e4f7-495f-b4cd-43756813e23a', name: 'Washing Machine', desc: 'Samsung front-loading washer' },
              { id: '9659f771-6f3b-40cc-a906-57bbb451788f', name: 'Smart TV', desc: '65" QLED with streaming' },
              { id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5', name: 'Coffee Maker', desc: 'Keurig single-serve' },
              { id: '0d92cbeb-a61f-4492-9346-6ab03363fdab', name: 'Smart Thermostat', desc: 'Nest learning thermostat' },
              { id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb', name: 'Dishwasher', desc: 'Bosch 800 series' },
            ].map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
                <p className="text-xs text-blue-600 mt-2">ID: {item.id.substring(0, 8)}...</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Set up your own QR code system and provide instant access to item information.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Access Admin Panel
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 QR Item Display System. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

