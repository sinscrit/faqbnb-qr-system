import '@/styles/print.css';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Print QR Codes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, background: 'white' }}>
        <main className="print-only">{children}</main>
      </body>
    </html>
  );
}
