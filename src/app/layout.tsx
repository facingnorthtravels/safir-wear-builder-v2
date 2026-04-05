import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safir Wear — Custom Merch Builder",
  description: "Premium custom garments configured in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text-primary font-sans">
        <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">
            SAFIR
          </Link>
          <Link
            href="/build"
            className="text-accent hover:text-accent-hover text-sm font-medium"
          >
            Build your product →
          </Link>
        </header>
        <main className="flex-1 px-6 md:px-10 py-12 md:py-20">{children}</main>
        <footer className="px-6 md:px-10 py-6 border-t border-border text-text-muted text-sm">
          © 2026 Safir Wear
        </footer>
      </body>
    </html>
  );
}
