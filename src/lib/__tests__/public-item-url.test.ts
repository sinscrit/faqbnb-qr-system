import { describe, expect, it } from 'vitest';
import { buildPublicItemPath, buildPublicItemUrl } from '@/lib/public-item-url';

const ID = '5abcdef0-0000-4000-8000-000000000001';

describe('canonical public item URL', () => {
  it('uses one singular canonical path and lowercases UUIDs', () => {
    expect(buildPublicItemPath(ID.toUpperCase())).toBe(`/item/${ID}`);
    expect(buildPublicItemUrl(ID.toUpperCase(), 'https://faqbnb.example')).toBe(`https://faqbnb.example/item/${ID}`);
  });
  it.each(['not-a-uuid', '', '50000000-0000-1000-0000-000000000001'])('rejects invalid public IDs %j', (id) => {
    expect(() => buildPublicItemPath(id)).toThrow();
  });
  it.each([
    'https://faqbnb.example/path', 'https://faqbnb.example?x=1', 'https://faqbnb.example/#x',
    'https://user:pass@faqbnb.example', 'ftp://faqbnb.example', 'https://faqbnb.example/',
  ])('rejects a non-exact trusted origin %s', (origin) => {
    expect(() => buildPublicItemUrl(ID, origin)).toThrow();
  });
  it('never consults a window or default domain', () => {
    expect(() => buildPublicItemUrl(ID, '')).toThrow();
  });
});
