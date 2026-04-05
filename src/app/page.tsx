import Link from "next/link";

export default function Home() {
  return (
    <section className="max-w-4xl mx-auto pt-12 md:pt-24">
      <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight">
        Custom merch your brand will <em className="italic font-bold">actually</em> be proud of.
      </h1>
      <p className="mt-8 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
        From first concept to delivery — premium garments configured in minutes.
      </p>
      <div className="mt-10">
        <Link
          href="/build"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-7 py-4 rounded-[8px] transition-colors"
        >
          Start building →
        </Link>
      </div>
      <p className="mt-6 text-sm text-text-muted">
        Low MOQ from 50 units · Ships globally from Pakistan · 3–4 week turnaround
      </p>
    </section>
  );
}
