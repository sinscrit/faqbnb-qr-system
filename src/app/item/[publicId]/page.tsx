import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getTrustedAppOrigin } from '@/lib/auth-origin';
import { loadPublicItem } from '@/lib/public-item-loader';
import { buildPublicItemPath, buildPublicItemUrl } from '@/lib/public-item-url';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const publicIdSchema = z.string().uuid().transform((value) => value.toLowerCase());
type PageProps = { params: Promise<{ publicId: string }> };

async function resolveId(params: PageProps['params']) {
  try { return publicIdSchema.safeParse((await params).publicId); }
  catch { return publicIdSchema.safeParse(null); }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = await resolveId(params);
  if (!parsed.success) return { title: 'Guest page not found' };
  const result = await loadPublicItem(parsed.data);
  if (!result.success) return { title: result.error.status === 404 ? 'Guest page not found' : 'Guest page unavailable' };
  let canonical: string | undefined;
  try { canonical = buildPublicItemUrl(result.item.publicId, getTrustedAppOrigin()); } catch { /* hide config detail */ }
  const title = `${result.item.name} instructions | FAQBNB`;
  const description = `Guest instructions for ${result.item.name}.`;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title, description, type: 'article' },
  };
}

export default async function PublicItemPage({ params }: PageProps) {
  const parsed = await resolveId(params);
  if (!parsed.success) notFound();
  const result = await loadPublicItem(parsed.data);
  if (!result.success && result.error.status === 404) notFound();
  if (!result.success) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] px-4 py-10 sm:py-16">
        <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-semibold tracking-wide text-[#d70466]">FAQBNB</p>
          <h1 className="mt-3 text-2xl font-bold text-gray-950">This guest page is temporarily unavailable</h1>
          <p className="mt-3 text-gray-700">Please try again in a moment.</p>
          <a href={buildPublicItemPath(parsed.data)} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white">Retry</a>
        </section>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:py-14">
      <article className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold tracking-wide text-[#d70466]">FAQBNB</p>
        <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-gray-950">{result.item.name}</h1>
        <div className="mt-8 space-y-8">
          {result.item.instructions.map((instruction, index) => (
            <section key={`${index}-${instruction.title}`} aria-labelledby={`instruction-${index}`}>
              <h2 id={`instruction-${index}`} className="break-words text-xl font-semibold text-gray-950">{instruction.title}</h2>
              <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-800">{instruction.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
