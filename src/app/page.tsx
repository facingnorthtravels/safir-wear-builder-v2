import Link from "next/link";

export default function Home() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
        {/* Left — copy */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-xs font-medium text-text-secondary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            UK CUSTOM CLOTHING &amp; MERCHANDISE
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-text-primary leading-[1.0] tracking-tight">
            Custom merch<br />
            your brand will<br />
            <em className="italic">actually</em><br />
            be proud of.
          </h1>
          <p className="mt-8 text-base md:text-lg text-text-secondary max-w-md leading-relaxed">
            From first concept to UK delivery — premium clothing, branded merchandise and full production, built on Pakistani textile heritage and finished to global brand standards.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/build"
              className="inline-block bg-accent text-bg font-semibold px-7 py-4 rounded-lg hover:bg-accent-hover transition-colors text-sm"
            >
              Start building →
            </Link>
          </div>
          <p className="mt-6 text-sm text-text-muted">
            Low MOQ from 50 units · Ships globally from Pakistan · 3–4 week turnaround
          </p>
        </div>

        {/* Right — image grid */}
        <div className="w-full md:w-[480px] flex-shrink-0 grid grid-cols-2 gap-3">
          <div className="col-span-1 row-span-2 rounded-xl overflow-hidden bg-surface aspect-[3/4]">
            <div className="w-full h-full bg-[#e8e3da]" />
          </div>
          <div className="relative rounded-xl overflow-hidden bg-surface aspect-square">
            <div className="w-full h-full bg-[#d4cec4]" />
            <div className="absolute bottom-3 right-3 bg-accent text-bg rounded-lg px-3 py-2 text-right">
              <p className="text-2xl font-black leading-none">48h</p>
              <p className="text-[10px] font-semibold tracking-widest mt-0.5 opacity-70">SAMPLE TURNAROUND</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-surface aspect-square">
            <div className="w-full h-full bg-[#c8c2b8]" />
          </div>
        </div>
      </div>
    </section>
  );
}
