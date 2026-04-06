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
        <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border bg-bg">
          <Link href="/" className="text-text-primary font-black text-lg tracking-tight">
            SW / SAFIR WEAR
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <Link href="#" className="hover:text-text-primary transition-colors">Services</Link>
            <Link href="#" className="hover:text-text-primary transition-colors">Portfolio</Link>
            <Link href="#" className="hover:text-text-primary transition-colors">About</Link>
            <Link href="#" className="hover:text-text-primary transition-colors">Contact</Link>
          </nav>
          <Link
            href="/build"
            className="bg-accent text-bg text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Get a Quote
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="px-6 md:px-10 py-6 border-t border-border text-text-muted text-sm">
          © 2026 Safir Wear
        </footer>
      </body>
    </html>
  );
}
