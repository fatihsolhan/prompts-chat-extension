/**
 * Type Badge Component
 *
 * Displays a badge indicating the prompt type (Text, Structured, Image).
 */

import { PromptType } from '@/lib/types';

interface TypeBadgeProps {
  type: PromptType;
  className?: string;
}

const TYPE_CONFIG: Record<PromptType, { label: string; className: string }> = {
  TEXT: {
    label: 'Text',
    className: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
  },
  STRUCTURED: {
    label: 'Structured',
    className: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
  },
  IMAGE: {
    label: 'Image',
    className: 'bg-green-500/10 text-green-500 dark:bg-green-500/20',
  },
  VIDEO: {
    label: 'Video',
    className: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20',
  },
  AUDIO: {
    label: 'Audio',
    className: 'bg-pink-500/10 text-pink-500 dark:bg-pink-500/20',
  },
};

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.TEXT;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
