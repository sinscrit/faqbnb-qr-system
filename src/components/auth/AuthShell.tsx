import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
          <Image src="/faqbnb_logoshort.png" alt="" width={44} height={44} className="rounded-lg" />
          <span className="text-2xl font-bold text-slate-900">FAQBNB</span>
        </Link>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

export const inputClass =
  'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100';
export const primaryButtonClass =
  'w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
export const linkClass =
  'rounded text-blue-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2';
