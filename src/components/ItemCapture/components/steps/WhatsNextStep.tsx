'use client';

/**
 * WhatsNextStep Component
 *
 * Post-save menu displayed after an item is successfully saved.
 * This is NOT a numbered workflow step - it's a post-workflow decision point.
 *
 * Options:
 * 1. Edit Instructions - Navigate to edit the article just created
 * 2. Add New Instructions - Create different instructions for same item
 * 3. Create New Item - Start fresh with a different item
 * 4. Done - Exit the workflow completely
 *
 * @module ItemCapture/components/steps/WhatsNextStep
 * @lastModified 2026-01-12 (REQ-187 - Create WhatsNextStep component)
 * @see REQ-3 from PRD CPL-FAQBNB-Review-2026-01-11
 */

import React from 'react';
import { Edit, PlusCircle, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the WhatsNextStep component.
 */
export interface WhatsNextStepProps {
  /** The UUID of the item that was just saved */
  savedItemId: string;
  /** The display name of the item that was just saved */
  savedItemName: string;
  /** Callback for Edit Instructions action - navigate to article editor */
  onEditInstructions: () => void;
  /** Callback for Add New Instructions action - start new article for same item */
  onAddNewInstructions: () => void;
  /** Callback for Create New Item action - full wizard reset */
  onCreateNewItem: () => void;
  /** Callback for Done action - exit to dashboard */
  onDone: () => void;
  /** Optional CSS class for the root element */
  className?: string;
}

/**
 * Props for the ActionCard sub-component.
 * Internal helper for consistent action button styling.
 */
interface ActionCardProps {
  /** Icon to display (Lucide React component) */
  icon: React.ReactNode;
  /** Action title text */
  title: string;
  /** Action description text */
  description: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant for styling emphasis */
  variant?: 'default' | 'primary';
}

// =============================================================================
// ActionCard Sub-Component
// =============================================================================

/**
 * ActionCard - Internal helper component for consistent action button styling.
 * Renders as a button with icon, title, and description.
 */
function ActionCard({
  icon,
  title,
  description,
  onClick,
  variant = 'default'
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Base styles
        "flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all w-full",
        // Focus states for accessibility
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        // Variant-specific styles
        variant === 'primary'
          ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {/* Icon container */}
      <div className={cn(
        "p-2 rounded-lg flex-shrink-0",
        variant === 'primary'
          ? "bg-blue-100 text-blue-600"
          : "bg-gray-100 text-gray-600"
      )}>
        {icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold",
          variant === 'primary' ? "text-blue-900" : "text-gray-900"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1",
          variant === 'primary' ? "text-blue-700" : "text-gray-600"
        )}>
          {description}
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// WhatsNextStep Component
// =============================================================================

/**
 * WhatsNextStep displays a post-save decision menu after an item is successfully saved.
 *
 * This is NOT a numbered workflow step - it's a post-workflow decision point
 * and should NOT be counted in the progress indicator.
 *
 * @example
 * ```tsx
 * <WhatsNextStep
 *   savedItemId="abc-123"
 *   savedItemName="Steamer"
 *   onEditInstructions={() => router.push(`/items/${id}/edit`)}
 *   onAddNewInstructions={() => goToStep('content-type')}
 *   onCreateNewItem={() => reset()}
 *   onDone={() => router.push('/dashboard')}
 * />
 * ```
 */
export function WhatsNextStep({
  savedItemId,
  savedItemName,
  onEditInstructions,
  onAddNewInstructions,
  onCreateNewItem,
  onDone,
  className,
}: WhatsNextStepProps) {
  // Note: savedItemId is available for future use (e.g., analytics, deep linking)
  // Currently used implicitly in callback closures by parent component
  void savedItemId;

  return (
    <div
      className={cn("flex flex-col items-center py-8 px-4", className)}
      role="region"
      aria-labelledby="whats-next-heading"
    >
      {/* Success Header */}
      <div className="text-center mb-8">
        {/* Green checkmark circle */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
        </div>

        {/* Success heading */}
        <h2
          id="whats-next-heading"
          className="text-2xl font-bold text-gray-900"
        >
          Item Saved!
        </h2>

        {/* Item name confirmation */}
        <p className="text-gray-600 mt-2">
          <span className="font-medium">{savedItemName}</span> has been saved successfully.
        </p>

        {/* Call to action prompt */}
        <p className="text-gray-500 text-sm mt-1">
          What would you like to do next?
        </p>
      </div>

      {/* Action Options */}
      <div className="w-full max-w-md space-y-3">
        {/* Edit Instructions - Default variant */}
        <ActionCard
          icon={<Edit className="w-5 h-5" aria-hidden="true" />}
          title="Edit Guide"
          description="Review and modify the guide you just created"
          onClick={onEditInstructions}
        />

        {/* Add New Instructions - Primary variant (recommended action) */}
        <ActionCard
          icon={<PlusCircle className="w-5 h-5" aria-hidden="true" />}
          title="Add New Guide"
          description={`Create different guide for "${savedItemName}"`}
          onClick={onAddNewInstructions}
          variant="primary"
        />

        {/* Tag New Item - Default variant */}
        <ActionCard
          icon={<Package className="w-5 h-5" aria-hidden="true" />}
          title="Tag New Item"
          description="Start fresh with a different item"
          onClick={onCreateNewItem}
        />

        {/* Done button - separated by border */}
        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={onDone}
            className={cn(
              "w-full py-3 font-medium transition-colors",
              "text-gray-600 hover:text-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
              "rounded-lg"
            )}
          >
            Done - Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading compatibility
export default WhatsNextStep;
