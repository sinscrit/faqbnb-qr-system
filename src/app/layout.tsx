import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Temporarily disabled due to 404 errors
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

// Temporarily using system fonts to prevent 404 flickering errors
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

const jetbrainsMono = {
  variable: "--font-jetbrains-mono", 
  className: "font-mono",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
  title: "FAQBNB - QR Item Display System",
  description: "FAQBNB provides instant access to detailed instructions, manuals, and resources for any appliance or item via QR codes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}