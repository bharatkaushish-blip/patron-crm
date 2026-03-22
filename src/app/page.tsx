import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { PricingGrid } from "@/components/landing/glow-pricing-grid";
import { FaqSection } from "@/components/landing/glow-faq";
import { CrmPreview } from "@/components/landing/crm-preview";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#323233] font-body">
      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f8]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-serif text-xl font-bold tracking-tight text-[#323233]">
            Patron
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#5f5f5f] font-body">
            <a
              href="#features"
              className="hover:text-[#323233] transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-[#323233] transition-colors duration-300"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hover:text-[#323233] transition-colors duration-300"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm text-[#5f5f5f] hover:text-[#323233] transition-colors duration-300"
            >
              Login
            </a>
            <a
              href="/signup"
              className="bg-gradient-to-br from-[#735a3a] to-[#664e30] px-6 py-2.5 text-sm font-medium text-[#fff6f0] hover:from-[#664e30] hover:to-[#513b1e] transition-all duration-300"
            >
              Start free trial
            </a>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative px-6 pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-[#323233]">
                Never Forget
                <br />
                <span className="italic text-[#735a3a]">a Client</span>
              </h1>
              <p className="mt-8 text-lg text-[#5f5f5f] max-w-lg leading-relaxed font-body">
                The memory and follow-up assistant built for art galleries.
                Remember every detail. Never miss a follow-up.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="/signup"
                  className="group flex items-center gap-2 bg-gradient-to-br from-[#735a3a] to-[#664e30] px-8 py-3.5 text-sm font-semibold text-[#fff6f0] hover:from-[#664e30] hover:to-[#513b1e] transition-all duration-300"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#features"
                  className="flex items-center gap-2 px-8 py-3.5 text-sm text-[#5f5f5f] border border-[#b2b2b1]/15 hover:border-[#b2b2b1]/40 hover:text-[#323233] transition-all duration-300"
                >
                  Learn more
                </a>
              </div>
            </div>

            {/* Right: Abstract Artwork */}
            <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1605478361938-2e562284e3d9?w=1080&q=80&fm=jpg&crop=entropy&cs=tinysrgb&fit=crop"
                alt="Abstract painting with dark gold and copper swirls"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f8]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CRM PREVIEW ============ */}
      <section className="px-6 pb-32">
        <CrmPreview />
      </section>

      {/* ============ FEATURES ============ */}
      <section
        id="features"
        className="relative bg-[#0e0e0e] py-32 px-6 overflow-hidden"
      >
        {/* Subtle top curve */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#fcf9f8]">
          <div className="h-full w-full bg-[#0e0e0e] rounded-tl-[60px] md:rounded-tl-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#9e9c9c] text-center">
            Features
          </p>
          <h2 className="mt-4 text-center font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#fcf9f8]">
            Built for how art
            <br />
            <span className="text-[#9e9c9c] italic">sellers actually work</span>
          </h2>
          <p className="mt-6 text-center text-[#9e9c9c] max-w-2xl mx-auto text-lg leading-relaxed font-body">
            Art sales are built on relationships that span months and years. A
            collector mentions they love a certain artist at a gallery opening,
            buys a piece six months later, and refers a friend a year after that.
            Patron is the memory you wish you had.
          </p>

          <FeatureGrid />
        </div>
      </section>

      {/* ============ SOCIAL PROOF STRIP ============ */}
      <section className="bg-[#f0eded] py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-xl md:text-2xl text-[#5f5f5f] italic leading-relaxed">
            &ldquo;Built for galleries, art advisors, and independent art
            sellers who manage relationships — not spreadsheets.&rdquo;
          </p>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="bg-[#fcf9f8] py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#5f5f5f] text-center">
            Pricing
          </p>
          <h2 className="mt-4 text-center font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#323233]">
            Simple, transparent
            <br />
            <span className="text-[#9e9c9c] italic">pricing</span>
          </h2>
          <p className="mt-6 text-center text-[#5f5f5f] max-w-xl mx-auto font-body">
            Start with a 14-day free trial. No credit card required.
          </p>

          <PricingGrid />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section
        id="faq"
        className="relative bg-[#0e0e0e] py-32 px-6 overflow-hidden"
      >
        {/* Subtle top curve */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#fcf9f8]">
          <div className="h-full w-full bg-[#0e0e0e] rounded-tl-[60px] md:rounded-tl-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#9e9c9c] text-center">
            FAQ
          </p>
          <h2 className="mt-4 text-center font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#fcf9f8]">
            Questions &amp;
            <br />
            <span className="text-[#9e9c9c] italic">answers</span>
          </h2>

          <FaqSection />
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="bg-[#fcf9f8] py-32 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-[#5f5f5f]">
            Contact
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#323233]">
            Get in touch
          </h2>
          <p className="mt-6 text-[#5f5f5f] max-w-lg mx-auto font-body">
            Have questions, feedback, or want a demo? We&apos;d love to hear
            from you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:teampatroncollective@gmail.com"
              className="group flex items-center gap-2 px-8 py-3.5 text-sm text-[#5f5f5f] border border-[#b2b2b1]/15 hover:border-[#735a3a]/40 hover:text-[#735a3a] transition-all duration-300"
            >
              <Mail className="h-4 w-4" />
              teampatroncollective@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative bg-[#0e0e0e] py-32 px-6 overflow-hidden">
        {/* Subtle top curve */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#fcf9f8]">
          <div className="h-full w-full bg-[#0e0e0e] rounded-tl-[60px] md:rounded-tl-[120px]" />
        </div>
        {/* Decorative warm gradient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#735a3a]/10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#fcf9f8]">
            Your clients deserve
            <br />
            <span className="italic text-[#fddab2]">to be remembered</span>
          </h2>
          <p className="mt-6 text-[#9e9c9c] text-lg font-body">
            Start your 14-day free trial today. No credit card required.
          </p>
          <a
            href="/signup"
            className="group mt-10 inline-flex items-center gap-2 bg-gradient-to-br from-[#735a3a] to-[#664e30] px-10 py-4 text-sm font-semibold text-[#fff6f0] hover:from-[#664e30] hover:to-[#513b1e] transition-all duration-300"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0e0e0e] py-8 px-6 border-t border-[#b2b2b1]/10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9e9c9c]">
          <span className="font-serif font-bold text-[#fcf9f8]">Patron</span>
          <div className="flex items-center gap-6 font-body">
            <a
              href="#features"
              className="hover:text-[#fcf9f8] transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-[#fcf9f8] transition-colors duration-300"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hover:text-[#fcf9f8] transition-colors duration-300"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="hover:text-[#fcf9f8] transition-colors duration-300"
            >
              Contact
            </a>
          </div>
          <span className="font-body">
            &copy; {new Date().getFullYear()} Patron. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
