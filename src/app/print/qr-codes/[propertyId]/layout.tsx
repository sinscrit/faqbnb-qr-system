import '@/styles/print.css';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="print-only">{children}</main>
      </body>
    </html>
  );
}
