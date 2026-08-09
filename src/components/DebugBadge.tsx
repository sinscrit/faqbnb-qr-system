'use client';

/**
 * DebugBadge Component
 *
 * Displays entity IDs when debug mode is enabled.
 * Supports different entity types with color-coded badges.
 *
 * @module components/DebugBadge
 * @lastModified 2026-02-13
 */

import { useDebug } from '@/contexts/DebugContext';
import { cn } from '@/lib/utils';

type EntityType = 'item' | 'guide' | 'property' | 'article';

interface DebugBadgeProps {
  /** The ID to display */
  id: string;
  /** Type of entity (affects badge color) */
  type: EntityType;
  /** Optional label prefix */
  label?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Position variant */
  position?: 'inline' | 'absolute-top-right' | 'absolute-top-left' | 'absolute-bottom-right';
}

const TYPE_COLORS: Record<EntityType, string> = {
  item: 'bg-blue-500 text-white',
  guide: 'bg-purple-500 text-white',
  property: 'bg-green-500 text-white',
  article: 'bg-orange-500 text-white',
};

const TYPE_LABELS: Record<EntityType, string> = {
  item: 'Item',
  guide: 'Guide',
  property: 'Prop',
  article: 'Art',
};

const SIZE_CLASSES: Record<string, string> = {
  xs: 'text-[9px] px-1 py-0.5',
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

const POSITION_CLASSES: Record<string, string> = {
  inline: '',
  'absolute-top-right': 'absolute top-1 right-1',
  'absolute-top-left': 'absolute top-1 left-1',
  'absolute-bottom-right': 'absolute bottom-1 right-1',
};

export function DebugBadge({
  id,
  type,
  label,
  size = 'xs',
  className,
  position = 'inline',
}: DebugBadgeProps) {
  const { isDebugMode } = useDebug();

  if (!isDebugMode) return null;

  // Truncate long IDs for display
  const displayId = id.length > 12 ? `${id.slice(0, 8)}...` : id;
  const displayLabel = label || TYPE_LABELS[type];

  return (
    <span
      className={cn(
        'font-mono rounded shadow-sm whitespace-nowrap z-50',
        TYPE_COLORS[type],
        SIZE_CLASSES[size],
        POSITION_CLASSES[position],
        className
      )}
      title={`${displayLabel} ID: ${id}`}
    >
      {displayLabel}: {displayId}
    </span>
  );
}

/**
 * Wrapper component that adds relative positioning for absolute badges
 */
export function DebugBadgeWrapper({
  children,
  id,
  type,
  label,
  size = 'xs',
  position = 'absolute-top-right',
  className,
}: DebugBadgeProps & { children: React.ReactNode }) {
  const { isDebugMode } = useDebug();

  if (!isDebugMode) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <DebugBadge id={id} type={type} label={label} size={size} position={position} />
    </div>
  );
}

export default DebugBadge;
