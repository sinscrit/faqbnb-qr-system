'use client';

/**
 * Moved from /dashboard2/instructions on 2026-01-12 for REQ-212
 * Last Modified: 2026-01-12
 *
 * Help Page - Dashboard2
 *
 * REQ-207: Create Instructions Page for User Guidance
 * Phase 4, Task 4.3
 *
 * Provides comprehensive user guidance for key application workflows:
 * - Getting Started
 * - Property Management
 * - Item Creation
 * - QR Code Generation
 * - Item Management
 *
 * @route /dashboard2/help
 * @see docs/REQ-207-create-instructions-page-detailed.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  FileText,
  Loader2,
  Shield,
  Building2,
  Package,
  QrCode,
  Settings,
  PlusCircle,
  ChevronDown,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Instruction section for organizing help content
 */
interface InstructionSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  steps: InstructionStep[];
}

/**
 * Individual instruction step or subsection
 */
interface InstructionStep {
  step?: number;
  title: string;
  content: string;
  tip?: string;
  link?: {
    href: string;
    label: string;
  };
}

// ============================================================================
// InstructionCard Component
// ============================================================================

function InstructionCard({ section }: { section: InstructionSection }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = section.icon;

  return (
    <div
      id={`section-${section.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-6"
    >
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`content-${section.id}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFEEEF]">
            <Icon className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-500">{section.description}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div id={`content-${section.id}`} className="px-6 pb-6 space-y-4">
          {section.steps.map((step, index) => (
            <div
              key={index}
              className="pl-4 border-l-2 border-[#FF385C]/20 hover:border-[#FF385C] transition-colors"
            >
              <div className="flex items-start gap-3">
                {step.step !== undefined && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF385C] text-white text-sm font-medium flex items-center justify-center">
                    {step.step}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.content}</p>
                  {step.tip && (
                    <p className="text-sm text-[#00A699] mt-2 flex items-start gap-1">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Tip: {step.tip}</span>
                    </p>
                  )}
                  {step.link && (
                    <Link
                      href={step.link.href}
                      className="inline-flex items-center gap-1 text-sm text-[#FF385C] hover:text-[#E31C5F] mt-2 font-medium"
                    >
                      {step.link.label}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function HelpPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);
  const t = useTranslations('settings.help');

  const canViewItems = useCanAccess('view_items');

  // Instruction sections - must be inside component to access t()
  const INSTRUCTION_SECTIONS: InstructionSection[] = [
    {
      id: 'getting-started',
      title: t('gettingStarted.title'),
      icon: PlusCircle,
      description: t('gettingStarted.description'),
      steps: [
        {
          step: 1,
          title: t('gettingStarted.step1.title'),
          content: t('gettingStarted.step1.content'),
          tip: t('gettingStarted.step1.tip'),
          link: { href: '/dashboard2/properties', label: t('gettingStarted.step1.linkLabel') },
        },
        {
          step: 2,
          title: t('gettingStarted.step2.title'),
          content: t('gettingStarted.step2.content'),
          link: { href: '/dashboard2/create', label: t('gettingStarted.step2.linkLabel') },
        },
        {
          step: 3,
          title: t('gettingStarted.step3.title'),
          content: t('gettingStarted.step3.content'),
          tip: t('gettingStarted.step3.tip'),
        },
      ],
    },
    {
      id: 'property-management',
      title: t('propertyManagement.title'),
      icon: Building2,
      description: t('propertyManagement.description'),
      steps: [
        {
          title: t('propertyManagement.step1.title'),
          content: t('propertyManagement.step1.content'),
          tip: t('propertyManagement.step1.tip'),
          link: { href: '/dashboard2/properties', label: t('propertyManagement.step1.linkLabel') },
        },
        {
          title: t('propertyManagement.step2.title'),
          content: t('propertyManagement.step2.content'),
          link: { href: '/dashboard2/properties', label: t('propertyManagement.step2.linkLabel') },
        },
        {
          title: t('propertyManagement.step3.title'),
          content: t('propertyManagement.step3.content'),
          tip: t('propertyManagement.step3.tip'),
        },
      ],
    },
    {
      id: 'item-creation',
      title: t('itemCreation.title'),
      icon: Package,
      description: t('itemCreation.description'),
      steps: [
        {
          step: 1,
          title: t('itemCreation.step1.title'),
          content: t('itemCreation.step1.content'),
          link: { href: '/dashboard2/create', label: t('itemCreation.step1.linkLabel') },
        },
        {
          step: 2,
          title: t('itemCreation.step2.title'),
          content: t('itemCreation.step2.content'),
          tip: t('itemCreation.step2.tip'),
        },
        {
          step: 3,
          title: t('itemCreation.step3.title'),
          content: t('itemCreation.step3.content'),
        },
        {
          step: 4,
          title: t('itemCreation.step4.title'),
          content: t('itemCreation.step4.content'),
        },
        {
          step: 5,
          title: t('itemCreation.step5.title'),
          content: t('itemCreation.step5.content'),
          tip: t('itemCreation.step5.tip'),
        },
        {
          step: 6,
          title: t('itemCreation.step6.title'),
          content: t('itemCreation.step6.content'),
        },
      ],
    },
    {
      id: 'qr-codes',
      title: t('qrCodes.title'),
      icon: QrCode,
      description: t('qrCodes.description'),
      steps: [
        {
          title: t('qrCodes.step1.title'),
          content: t('qrCodes.step1.content'),
          tip: t('qrCodes.step1.tip'),
        },
        {
          title: t('qrCodes.step2.title'),
          content: t('qrCodes.step2.content'),
        },
        {
          title: t('qrCodes.step3.title'),
          content: t('qrCodes.step3.content'),
          tip: t('qrCodes.step3.tip'),
        },
        {
          title: t('qrCodes.step4.title'),
          content: t('qrCodes.step4.content'),
        },
      ],
    },
    {
      id: 'item-management',
      title: t('itemManagement.title'),
      icon: Settings,
      description: t('itemManagement.description'),
      steps: [
        {
          title: t('itemManagement.step1.title'),
          content: t('itemManagement.step1.content'),
          link: { href: '/dashboard2/items', label: t('itemManagement.step1.linkLabel') },
        },
        {
          title: t('itemManagement.step2.title'),
          content: t('itemManagement.step2.content'),
          tip: t('itemManagement.step2.tip'),
        },
        {
          title: t('itemManagement.step3.title'),
          content: t('itemManagement.step3.content'),
        },
        {
          title: t('itemManagement.step4.title'),
          content: t('itemManagement.step4.content'),
          tip: t('itemManagement.step4.tip'),
        },
      ],
    },
  ];

  // Loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-label={t('page.loadingAriaLabel')} />
          <p className="text-gray-600">{t('page.loadingAriaLabel')}</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access help.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorization check
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
        <Link
          href="/dashboard2"
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Main content
  return (
    <div role="main" aria-labelledby="help-title">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
              <h1 id="help-title" className="text-2xl font-bold text-gray-900">
                {t('page.title')}
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              {t('page.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard2/create"
              className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              {t('page.createItemButton')}
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 p-4 bg-[#FFEEEF] rounded-xl">
        <h2 className="text-sm font-semibold text-[#FF385C] mb-3">{t('page.quickLinksTitle')}</h2>
        <div className="flex flex-wrap gap-2">
          {INSTRUCTION_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>

      {/* Instruction Sections */}
      <div className="space-y-6">
        {INSTRUCTION_SECTIONS.map((section) => (
          <InstructionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Help Footer */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('page.footerTitle')}</h2>
        <p className="text-gray-600 mb-4">
          {t('page.footerText')}
        </p>
        <a
          href="mailto:support@faqbnb.com"
          className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t('page.contactButton')}
        </a>
      </div>
    </div>
  );
}
