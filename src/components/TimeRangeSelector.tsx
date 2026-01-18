'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface TimeRangeSelectorProps {
  selectedRange: '24h' | '7d' | '30d' | '1y';
  onRangeChange: (range: '24h' | '7d' | '30d' | '1y') => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  disabled?: boolean;
}

interface TimeRangeOption {
  id: '24h' | '7d' | '30d' | '1y';
  label: string;
  shortLabel: string;
  description: string;
  icon?: React.ReactNode;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    id: '24h',
    label: '24 Hours',
    shortLabel: '24h',
    description: 'Last 24 hours',
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: '7d',
    label: '7 Days',
    shortLabel: '7d',
    description: 'Last 7 days',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    id: '30d',
    label: '30 Days',
    shortLabel: '30d',
    description: 'Last 30 days',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    id: '1y',
    label: '1 Year',
    shortLabel: '1y',
    description: 'Last 12 months',
    icon: <Calendar className="w-4 h-4" />
  }
];

export default function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false
}: TimeRangeSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get size-specific classes
  const getSizeClasses = () => {
    const sizeMap = {
      sm: {
        button: 'px-3 py-1.5 text-xs',
        container: 'gap-1',
        icon: 'w-3 h-3'
      },
      md: {
        button: 'px-4 py-2 text-sm',
        container: 'gap-2',
        icon: 'w-4 h-4'
      },
      lg: {
        button: 'px-6 py-3 text-base',
        container: 'gap-3',
        icon: 'w-5 h-5'
      }
    };
    return sizeMap[size];
  };

  // Get variant-specific classes
  const getVariantClasses = () => {
    if (variant === 'compact') {
      return {
        showLabels: false,
        showIcons: true
      };
    }
    return {
      showLabels: true,
      showIcons: size !== 'sm'
    };
  };

  // Get button classes for active/inactive states
  const getButtonClasses = (option: TimeRangeOption, index: number) => {
    const sizeClasses = getSizeClasses();
    const isActive = selectedRange === option.id;
    const isFocused = focusedIndex === index;
    
    const baseClasses = `
      ${sizeClasses.button}
      font-medium rounded-lg border transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
    `.trim();

    const stateClasses = isActive
      ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700'
      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm';

    const focusClasses = isFocused && !isActive
      ? 'ring-2 ring-blue-500 ring-offset-2'
      : '';

    return `${baseClasses} ${stateClasses} ${focusClasses}`.trim();
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : TIME_RANGE_OPTIONS.length - 1;
        setFocusedIndex(prevIndex);
        buttonRefs.current[prevIndex]?.focus();
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = index < TIME_RANGE_OPTIONS.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        buttonRefs.current[nextIndex]?.focus();
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!disabled) {
          onRangeChange(TIME_RANGE_OPTIONS[index].id);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        buttonRefs.current[0]?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        const lastIndex = TIME_RANGE_OPTIONS.length - 1;
        setFocusedIndex(lastIndex);
        buttonRefs.current[lastIndex]?.focus();
        break;
    }
  };

  // Handle click events
  const handleClick = (range: '24h' | '7d' | '30d' | '1y') => {
    if (!disabled) {
      onRangeChange(range);
    }
  };

  // Handle focus events
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const sizeClasses = getSizeClasses();
  const variantConfig = getVariantClasses();

  return (
    <div className={`time-range-selector ${className}`}>
      {variant === 'default' && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Time Range</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Select the time period for analytics data
          </p>
        </div>
      )}
      
      <div 
        className={`flex flex-wrap ${sizeClasses.container}`}
        role="radiogroup"
        aria-label="Select time range for analytics"
      >
        {TIME_RANGE_OPTIONS.map((option, index) => (
          <button
            key={option.id}
            ref={(el) => (buttonRefs.current[index] = el)}
            type="button"
            role="radio"
            aria-checked={selectedRange === option.id}
            aria-label={`${option.label} - ${option.description}`}
            className={getButtonClasses(option, index)}
            onClick={() => handleClick(option.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            title={option.description}
          >
            <div className="flex items-center justify-center space-x-2">
              {variantConfig.showIcons && option.icon && (
                <span className={`flex-shrink-0 ${sizeClasses.icon}`}>
                  {option.icon}
                </span>
              )}
              <span className="whitespace-nowrap">
                {variantConfig.showLabels ? option.label : option.shortLabel}
              </span>
            </div>
            
            {/* Active indicator */}
            {selectedRange === option.id && (
              <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-0 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Selected range info */}
      {variant === 'default' && (
        <div className="mt-3">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Selected:</span>{' '}
            {TIME_RANGE_OPTIONS.find(option => option.id === selectedRange)?.description}
          </p>
        </div>
      )}
      
      {/* Accessibility instructions */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between time range options. Press Enter or Space to select.
      </div>
    </div>
  );
}

// Export time range options for use in other components
export { TIME_RANGE_OPTIONS };

// Export utility function to get time range label
export const getTimeRangeLabel = (range: '24h' | '7d' | '30d' | '1y'): string => {
  const option = TIME_RANGE_OPTIONS.find(opt => opt.id === range);
  return option?.label || range;
};

// Export utility function to get time range description
export const getTimeRangeDescription = (range: '24h' | '7d' | '30d' | '1y'): string => {
  const option = TIME_RANGE_OPTIONS.find(opt => opt.id === range);
  return option?.description || range;
}; 