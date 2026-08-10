import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPublicItem } from '@/lib/public-item-loader';
vi.mock('@/lib/public-item-loader', () => ({ loadPublicItem: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }) }));
import PublicItemPage, { generateMetadata } from '@/app/item/[publicId]/page';

const PUBLIC = '5abcdef0-0000-4000-8000-000000000001';
const params = Promise.resolve({ publicId: PUBLIC });
const item = { publicId: PUBLIC, name: 'Coffee machine', instructions: [{ title: 'Make coffee', body: 'Press Start.\nWait.' }, { title: 'Clean up', body: 'Rinse the jug.' }] };

describe('minimal guest instruction page', () => {
  beforeEach(() => { vi.clearAllMocks(); process.env.APP_ORIGIN = 'https://faqbnb.example'; vi.mocked(loadPublicItem).mockResolvedValue({ success: true, item }); });
  it('renders only semantic ordered guest content with multiline preservation', async () => {
    render(await PublicItemPage({ params }));
    expect(screen.getByRole('heading', { level: 1, name: 'Coffee machine' })).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['Make coffee', 'Clean up']);
    const multiline = headings[0].parentElement?.querySelector('p');
    expect(multiline?.textContent).toBe('Press Start.\nWait.');
    expect(multiline).toHaveClass('whitespace-pre-wrap');
    expect(document.body.textContent).not.toMatch(/uuid|property|account|translate|analytics|reaction/i);
  });
  it('uses the shared loader and canonical URL for exact metadata', async () => {
    await expect(generateMetadata({ params })).resolves.toMatchObject({
      title: 'Coffee machine instructions | FAQBNB',
      description: 'Guest instructions for Coffee machine.',
      alternates: { canonical: `https://faqbnb.example/item/${PUBLIC}` },
    });
    expect(loadPublicItem).toHaveBeenCalledWith(PUBLIC);
  });
  it('renders an honest retryable unavailable state', async () => {
    vi.mocked(loadPublicItem).mockResolvedValueOnce({ success: false, error: { code: 'PUBLIC_ITEM_UNAVAILABLE', message: 'safe', status: 503 } });
    render(await PublicItemPage({ params }));
    expect(screen.getByRole('heading', { name: 'This guest page is temporarily unavailable' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Retry' })).toHaveAttribute('href', `/item/${PUBLIC}`);
  });
  it('uses not-found for invalid, draft, and unknown IDs', async () => {
    await expect(PublicItemPage({ params: Promise.resolve({ publicId: 'bad' }) })).rejects.toThrow('NEXT_NOT_FOUND');
    vi.mocked(loadPublicItem).mockResolvedValueOnce({ success: false, error: { code: 'ITEM_NOT_FOUND', message: 'Guest page not found.', status: 404 } });
    await expect(PublicItemPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
