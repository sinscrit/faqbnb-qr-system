'use client';

/**
 * Instructions Page - Dashboard2
 *
 * REQ-207: Create Instructions Page for User Guidance
 * Phase 4, Task 4.3
 *
 * Last Modified: 2026-01-12
 *
 * Provides comprehensive user guidance for key application workflows:
 * - Getting Started
 * - Property Management
 * - Item Creation
 * - QR Code Generation
 * - Item Management
 *
 * @route /dashboard2/instructions
 * @see docs/REQ-207-create-instructions-page-detailed.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
// Instruction Content Constants
// ============================================================================

const INSTRUCTION_SECTIONS: InstructionSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: PlusCircle,
    description: 'Learn the basics of setting up your FAQBNB account',
    steps: [
      {
        step: 1,
        title: 'Create Your First Property',
        content:
          'After signing in, navigate to Properties and click "Add Property" to create your first vacation rental or property.',
        tip: 'You can add multiple properties to manage different locations.',
        link: { href: '/dashboard2/properties', label: 'Go to Properties' },
      },
      {
        step: 2,
        title: 'Add Items to Your Property',
        content:
          'Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.',
        link: { href: '/dashboard2/create', label: 'Create an Item' },
      },
      {
        step: 3,
        title: 'Add Instructions for Each Item',
        content:
          'Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more.',
      },
    ],
  },
  {
    id: 'property-management',
    title: 'Managing Properties',
    icon: Building2,
    description: 'Set up and organize your rental properties',
    steps: [
      {
        title: 'Adding a Property',
        content:
          'Click "Add Property" from the Properties page. Enter the property name, address, and optional description.',
        tip: 'Use descriptive names like "Beach House" or "Downtown Apartment" for easy identification.',
        link: { href: '/dashboard2/properties', label: 'Manage Properties' },
      },
      {
        title: 'Editing Property Details',
        content:
          'Click on any property card to edit its details, including name, address, and settings.',
      },
      {
        title: 'Property-Specific Items',
        content:
          "Items are automatically associated with the property you're currently viewing. Switch properties using the property selector.",
      },
    ],
  },
  {
    id: 'item-creation',
    title: 'Creating Items',
    icon: Package,
    description: 'Add and document the items in your property',
    steps: [
      {
        step: 1,
        title: 'Start the Item Creation Wizard',
        content: 'From the dashboard, click "Create New Item" to launch the step-by-step wizard.',
        link: { href: '/dashboard2/create', label: 'Create Item' },
      },
      {
        step: 2,
        title: 'Select Room and Item Type',
        content:
          'Choose where the item is located (Kitchen, Living Room, etc.) and what type of item it is (Appliance, Electronics, etc.).',
      },
      {
        step: 3,
        title: 'Name Your Item',
        content:
          'Enter a clear, descriptive name like "Keurig Coffee Maker" or "Samsung Smart TV". This name appears on the QR code.',
      },
      {
        step: 4,
        title: 'Choose Instruction Purpose',
        content:
          "Select what type of instructions you're creating: How to Use, How to Clean, Troubleshooting, or Safety Information.",
      },
      {
        step: 5,
        title: 'Add Content',
        content:
          'Add photos, videos, text instructions, or links to external resources like YouTube tutorials or PDF manuals.',
        tip: 'Photos work best for step-by-step visual guides. Videos are great for complex procedures.',
      },
      {
        step: 6,
        title: 'Review and Save',
        content: 'Preview your item and its instructions, then save to generate the QR code.',
      },
    ],
  },
  {
    id: 'qr-codes',
    title: 'QR Code Generation',
    icon: QrCode,
    description: 'Generate and print QR codes for your items',
    steps: [
      {
        title: 'Automatic QR Code Generation',
        content:
          'QR codes are generated automatically when you save an item. Each item gets a unique QR code linked to its instruction page.',
      },
      {
        title: 'Printing QR Codes',
        content:
          'From the Items page, select items and use "Print QR Codes" to generate printable labels for multiple items at once.',
        link: { href: '/dashboard2/items', label: 'View Items' },
      },
      {
        title: 'QR Code Placement',
        content:
          'Place QR codes near the item where guests can easily scan them. Common locations: on the appliance, nearby wall, or inside cabinet doors.',
        tip: 'Use waterproof labels in kitchens and bathrooms.',
      },
      {
        title: 'Testing QR Codes',
        content:
          'Always test your QR codes with a smartphone before placing them. Scan the code to verify it links to the correct instruction page.',
      },
    ],
  },
  {
    id: 'item-management',
    title: 'Managing Items',
    icon: Settings,
    description: 'Edit, organize, and maintain your item library',
    steps: [
      {
        title: 'Viewing All Items',
        content:
          'The Items page shows all items across your properties. Use filters to narrow by property, room, or item type.',
        link: { href: '/dashboard2/items', label: 'View Items' },
      },
      {
        title: 'Editing Items',
        content:
          'Click on any item to edit its details, add new instruction articles, or update existing content.',
      },
      {
        title: 'Adding Multiple Instructions',
        content:
          'A single item can have multiple instruction articles. Add separate articles for cleaning, troubleshooting, or special features.',
      },
      {
        title: 'Bulk Operations',
        content:
          'Select multiple items to perform bulk actions like printing QR codes, moving to a different property, or deleting.',
      },
    ],
  },
];

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

export default function InstructionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  const canViewItems = useCanAccess('view_items');

  // Loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access instructions.</p>
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
    <div role="main" aria-labelledby="instructions-title">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
              <h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
                Instructions & Help
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Learn how to use FAQBNB to create and manage your property items
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard2/create"
              className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              Create Item
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8 p-4 bg-[#FFEEEF] rounded-xl">
        <h2 className="text-sm font-semibold text-[#FF385C] mb-3">Quick Links</h2>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Still Need Help?</h2>
        <p className="text-gray-600 mb-4">
          Can&apos;t find what you&apos;re looking for? Contact our support team for assistance.
        </p>
        <a
          href="mailto:support@faqbnb.com"
          className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
