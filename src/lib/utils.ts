import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LinkType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLinkTypeIcon(linkType: LinkType): string {
  switch (linkType) {
    case 'youtube':
      return '🎥';
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'text':
      return '🔗';
    default:
      return '📎';
  }
}

export function getLinkTypeColor(linkType: LinkType): string {
  switch (linkType) {
    case 'youtube':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pdf':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'image':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'text':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getYoutubeThumbnail(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

