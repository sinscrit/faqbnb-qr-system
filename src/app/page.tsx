import Link from 'next/link';
import Image from 'next/image';
import { QrCode, Smartphone, Zap, Shield, Clock, Settings, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import MailingListSignup from '@/components/MailingListSignup';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQBNB - Instant Access to Product Information via QR Codes | SaaS Platform',
  description: 'Transform customer support with FAQBNB. Provide instant access to manuals, videos, and product information through QR codes. No apps required.',
  keywords: 'QR code platform, product support, customer service, digital manuals, SaaS, product information, mobile support',
  openGraph: {
    title: 'FAQBNB - Instant Access to Product Information',
    description: 'Professional QR code platform for businesses. Transform how customers access product information and support.',
    url: 'https://faqbnb.com',
    siteName: 'FAQBNB',
    type: 'website',
    images: [
      {
        url: '/faqbnb_logolong_alt.png',
        width: 500,
        height: 167,
        alt: 'FAQBNB Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQBNB - Instant Access to Product Information',
    description: 'Professional QR code platform for businesses. Transform how customers access product information and support.',
    images: ['/faqbnb_logolong_alt.png'],
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://faqbnb.com',
  },
};

// Schema.org JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FAQBNB',
  description: 'Professional QR code platform that provides instant access to product information, manuals, and support resources.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Currently in private beta for select clients',
  },
  creator: {
    '@type': 'Organization',
    name: 'FAQBNB',
    url: 'https://faqbnb.com',
  },
  featureList: [
    'QR Code Generation',
    'Content Management',
    'Analytics & Insights',
    'Mobile Optimized',
    'No App Required',
    'Real-time Updates',
  ],
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-white">
      {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                  width={32}
                  height={32}
                className="rounded-lg"
              />
                <div className="text-xl font-bold text-gray-900">FAQBNB</div>
            </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <Link href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Benefits
                </Link>
                <Link href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Demo
                </Link>
                <Link href="#beta" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Beta Access
                </Link>
              </nav>
            <Link
                href="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
                Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
        <section className="relative pt-16 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Hero Content */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Instant Access to
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Any Item&apos;s Instructions</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                Transform how your customers access product information. No apps required—just scan a QR code 
                for instant access to manuals, videos, and support resources.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link
                  href="#beta"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Join Beta Program
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  See Live Demo
                </Link>
              </div>

              {/* Hero Image/Logo */}
              <div className="flex justify-center mb-16">
            <Image
              src="/faqbnb_logolong_alt.png"
                  alt="FAQBNB Platform Preview"
                  width={500}
                  height={167}
                  className="max-w-full h-auto opacity-90"
              priority
            />
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-60"></div>
            <div className="absolute top-32 right-20 w-32 h-32 bg-indigo-100 rounded-full opacity-40"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-100 rounded-full opacity-50"></div>
          </div>
        </section>

        {/* Road Testing Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
                <CheckCircle className="w-4 h-4 mr-2" />
                Currently in Private Beta
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Road Testing with Select Enterprise Clients
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                FAQBNB is currently being tested by forward-thinking companies who want to revolutionize 
                their customer support experience. Our beta partners are seeing remarkable results.
              </p>
              
              {/* Beta Stats */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <p className="text-gray-600">Beta Partners</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                  <p className="text-gray-600">Customer Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">60%</div>
                  <p className="text-gray-600">Reduction in Support Calls</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonials */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Forward-Thinking Companies
              </h2>
              <p className="text-xl text-gray-600">
                See what our beta partners are saying about FAQBNB
          </p>
        </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  &ldquo;FAQBNB transformed how our customers access product information. 
                  The instant access to manuals and videos has significantly reduced our support workload.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Miller</p>
                    <p className="text-sm text-gray-500">Customer Success Manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  &ldquo;The QR code approach is brilliant. Our customers love the instant access, 
                  and we love how easy it is to update content without reprinting anything.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold text-sm">DL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">David Lee</p>
                    <p className="text-sm text-gray-500">Head of Product Support</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  &ldquo;Implementation was seamless, and the results were immediate. 
                  Our customer satisfaction scores improved dramatically within the first month.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold text-sm">RJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Rachel Johnson</p>
                    <p className="text-sm text-gray-500">Operations Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose FAQBNB?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Deliver exceptional customer experience with instant access to product information
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Apps Required</h3>
                <p className="text-gray-600">
                  Customers access information instantly through their mobile browser. No downloads, no friction.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Content</h3>
                <p className="text-gray-600">
                  Videos, PDFs, images, and interactive guides all accessible from a single QR code.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Access</h3>
            <p className="text-gray-600">
                  Your customers get instant support anytime, anywhere, reducing helpdesk calls.
            </p>
          </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Management</h3>
                <p className="text-gray-600">
                  Update content instantly through our admin panel. Changes reflect immediately across all QR codes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to provide exceptional product support and information access
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">QR Code Generation</h3>
                <p className="text-gray-600 mb-4">
                  Automatically generate QR codes for any product or item. Customize and download high-resolution codes for printing.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• High-resolution download</li>
                  <li>• Multiple format support</li>
                  <li>• Batch generation</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Management</h3>
                <p className="text-gray-600 mb-4">
                  Easily upload and organize manuals, videos, images, and links. Update content anytime without reprinting QR codes.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Drag & drop uploads</li>
                  <li>• Version control</li>
                  <li>• Instant updates</li>
                </ul>
        </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Insights</h3>
                <p className="text-gray-600 mb-4">
                  Track QR code scans, popular content, and user engagement to optimize your customer support strategy.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Scan tracking</li>
                  <li>• Usage analytics</li>
                  <li>• Performance insights</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See FAQBNB in Action
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Experience the instant access your customers will enjoy with these live examples
            </p>
          </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: '8d678bd0-e4f7-495f-b4cd-43756813e23a', name: 'Washing Machine', desc: 'Samsung front-loading washer', category: 'Appliances' },
                  { id: '9659f771-6f3b-40cc-a906-57bbb451788f', name: 'Smart TV', desc: '65" QLED with streaming apps', category: 'Electronics' },
                  { id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5', name: 'Coffee Maker', desc: 'Keurig single-serve system', category: 'Kitchen' },
                  { id: '0d92cbeb-a61f-4492-9346-6ab03363fdab', name: 'Smart Thermostat', desc: 'Nest learning thermostat', category: 'Home' },
                  { id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb', name: 'Dishwasher', desc: 'Bosch 800 series built-in', category: 'Appliances' },
            ].map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                    className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <QrCode className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                    <p className="text-xs text-blue-600 font-mono">ID: {item.id.substring(0, 8)}...</p>
              </Link>
            ))}
          </div>
        </div>
          </div>
        </section>

        {/* Mailing List / Beta Access Section */}
        <section id="beta" className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Be First to Access FAQBNB
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join our mailing list to be notified when FAQBNB opens to the public. 
                Get early access, exclusive updates, and special launch pricing.
              </p>
            </div>

            <MailingListSignup
              variant="hero"
              title="Join the Waitlist"
              description="Get notified when we launch publicly and receive exclusive early access."
              buttonText="Notify Me"
              placeholder="Enter your business email"
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src="/faqbnb_logoshort.png"
                    alt="FAQBNB Logo"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span className="text-xl font-bold text-gray-900">FAQBNB</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Professional QR code platform for instant access to product information and customer support.
                </p>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="sr-only">Twitter</span>
                    {/* Social icons would go here */}
          </Link>
        </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Product</h3>
                <ul className="space-y-3">
                  <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                  <li><Link href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Live Demo</Link></li>
                  <li><Link href="#beta" className="text-gray-600 hover:text-gray-900 transition-colors">Beta Access</Link></li>
                  <li><Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Admin Login</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Security</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Compliance</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-12">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">
                  © 2024 FAQBNB.com - All rights reserved. Professional QR code platform for businesses.
                </p>
                <p className="text-gray-400 text-sm mt-4 md:mt-0">
                  Built with Next.js, TypeScript, and Supabase
                </p>
              </div>
            </div>
        </div>
      </footer>
    </div>
    </>
  );
}

