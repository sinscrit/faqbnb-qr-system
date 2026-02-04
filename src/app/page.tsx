import Link from 'next/link';
import Image from 'next/image';
import { QrCode, Smartphone, Zap, Shield, Clock, Settings, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import MailingListSignup from '@/components/MailingListSignup';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');
  const locale = await getLocale();

  return {
    metadataBase: new URL(
      process.env.NODE_ENV === 'production'
        ? 'https://faqbnb.com'
        : 'http://localhost:3000'
    ),
    title: t('title'),
    description: t('description'),
    keywords: 'QR code platform, product support, customer service, digital manuals, SaaS, product information, mobile support',
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://faqbnb.com',
      siteName: 'FAQBNB',
      type: 'website',
      locale: locale,
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
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/faqbnb_logolong_alt.png'],
    },
    robots: 'index, follow',
    alternates: {
      canonical: 'https://faqbnb.com',
    },
  };
}

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

export default async function HomePage() {
  const t = await getTranslations('homepage');

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
                <div className="text-xl font-bold text-gray-900">{t('header.logo')}</div>
            </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t('header.features')}
                </Link>
                <Link href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t('header.benefits')}
                </Link>
                <Link href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t('header.demo')}
                </Link>
                <Link href="#beta" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {t('header.betaAccess')}
                </Link>
              </nav>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher
                variant="compact"
                size="sm"
                className="w-32"
              />
              <Link
                href="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {t('header.login')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
        <section className="relative pt-16 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Hero Content */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {t('hero.title')}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link
                  href="#beta"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {t('hero.joinBeta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="#demo"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  {t('hero.seeDemo')}
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
                {t('betaBanner.badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('betaBanner.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {t('betaBanner.description')}
              </p>

              {/* Beta Stats */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <p className="text-gray-600">{t('betaBanner.stats.partners')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                  <p className="text-gray-600">{t('betaBanner.stats.satisfaction')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">60%</div>
                  <p className="text-gray-600">{t('betaBanner.stats.reduction')}</p>
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
                {t('testimonials.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('testimonials.subtitle')}
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
                  &ldquo;{t('testimonials.testimonial1')}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.name1')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.role1')}</p>
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
                  &ldquo;{t('testimonials.testimonial2')}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold text-sm">DL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.name2')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.role2')}</p>
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
                  &ldquo;{t('testimonials.testimonial3')}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold text-sm">RJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('testimonials.name3')}</p>
                    <p className="text-sm text-gray-500">{t('testimonials.role3')}</p>
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
                {t('benefits.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('benefits.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('benefits.noApps.title')}</h3>
                <p className="text-gray-600">
                  {t('benefits.noApps.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('benefits.richContent.title')}</h3>
                <p className="text-gray-600">
                  {t('benefits.richContent.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('benefits.access24_7.title')}</h3>
            <p className="text-gray-600">
                  {t('benefits.access24_7.description')}
            </p>
          </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('benefits.easyManagement.title')}</h3>
                <p className="text-gray-600">
                  {t('benefits.easyManagement.description')}
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
                {t('features.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('features.qrGeneration.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('features.qrGeneration.description')}
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• {t('features.qrGeneration.feature1')}</li>
                  <li>• {t('features.qrGeneration.feature2')}</li>
                  <li>• {t('features.qrGeneration.feature3')}</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('features.contentManagement.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('features.contentManagement.description')}
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• {t('features.contentManagement.feature1')}</li>
                  <li>• {t('features.contentManagement.feature2')}</li>
                  <li>• {t('features.contentManagement.feature3')}</li>
                </ul>
        </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('features.analytics.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('features.analytics.description')}
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• {t('features.analytics.feature1')}</li>
                  <li>• {t('features.analytics.feature2')}</li>
                  <li>• {t('features.analytics.feature3')}</li>
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
                {t('demo.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('demo.subtitle')}
            </p>
          </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: '8d678bd0-e4f7-495f-b4cd-43756813e23a', nameKey: 'item1.name', descKey: 'item1.description', categoryKey: 'categoryAppliances' },
                  { id: '9659f771-6f3b-40cc-a906-57bbb451788f', nameKey: 'item2.name', descKey: 'item2.description', categoryKey: 'categoryElectronics' },
                  { id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5', nameKey: 'item3.name', descKey: 'item3.description', categoryKey: 'categoryKitchen' },
                  { id: '0d92cbeb-a61f-4492-9346-6ab03363fdab', nameKey: 'item4.name', descKey: 'item4.description', categoryKey: 'categoryHome' },
                  { id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb', nameKey: 'item5.name', descKey: 'item5.description', categoryKey: 'categoryAppliances' },
            ].map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                    className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {t(`demo.${item.categoryKey}`)}
                      </span>
                      <QrCode className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t(`demo.${item.nameKey}`)}</h3>
                    <p className="text-sm text-gray-600 mb-3">{t(`demo.${item.descKey}`)}</p>
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
                {t('beta.title')}
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                {t('beta.description')}
              </p>
            </div>

            <MailingListSignup
              variant="hero"
              title={t('beta.waitlistTitle')}
              description={t('beta.waitlistDescription')}
              buttonText={t('beta.buttonText')}
              placeholder={t('beta.placeholder')}
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
                  <span className="text-xl font-bold text-gray-900">{t('header.logo')}</span>
                </div>
                <p className="text-gray-600 mb-6">
                  {t('footer.tagline')}
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
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t('footer.product.title')}</h3>
                <ul className="space-y-3">
                  <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.product.features')}</Link></li>
                  <li><Link href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.product.demo')}</Link></li>
                  <li><Link href="#beta" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.product.beta')}</Link></li>
                  <li><Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.product.login')}</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t('footer.company.title')}</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.company.about')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.company.blog')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.company.careers')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.company.contact')}</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t('footer.legal.title')}</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.legal.privacy')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.legal.terms')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.legal.security')}</Link></li>
                  <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">{t('footer.legal.compliance')}</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-12">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">
                  {t('footer.copyright')}
                </p>
                <p className="text-gray-400 text-sm mt-4 md:mt-0">
                  {t('footer.builtWith')}
                </p>
              </div>
            </div>
        </div>
      </footer>
    </div>
    </>
  );
}

