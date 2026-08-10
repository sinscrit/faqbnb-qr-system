import { z } from 'zod';

const publicIdSchema = z.string().uuid();

export function buildPublicItemPath(publicId: string): `/item/${string}` {
  const id = publicIdSchema.parse(publicId).toLowerCase();
  return `/item/${id}`;
}

/** Build a shareable URL only from an explicitly trusted, already configured origin. */
export function buildPublicItemUrl(publicId: string, trustedOrigin: string): string {
  const origin = new URL(trustedOrigin);
  if (origin.origin !== trustedOrigin || origin.pathname !== '/' || origin.search || origin.hash ||
      origin.username || origin.password || !['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('Trusted origin is invalid');
  }
  return new URL(buildPublicItemPath(publicId), `${origin.origin}/`).toString();
}
