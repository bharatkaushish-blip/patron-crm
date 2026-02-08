import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { HeroSparkles } from "@/components/landing/hero-sparkles";
import { GlowFeatureGrid } from "@/components/landing/glow-feature-grid";
import { GlowPricingGrid } from "@/components/landing/glow-pricing-grid";
import { GlowFAQ } from "@/components/landing/glow-faq";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* ============ SPARKLES BACKGROUND ============ */}
      <div className="fixed inset-0 z-0">
        <HeroSparkles />
      </div>

      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">Patron</span>

          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80 z-10" />

        {/* Painting image — positioned like the 3D blob in the reference */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[90vw] max-w-4xl aspect-[3/2]">
            <img
              src="/hero-painting.png"
              alt=""
              className="h-full w-full object-cover rounded-2xl opacity-40"
            />
            {/* Subtle glow behind the painting */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-amber-600/40 via-transparent to-blue-600/30 scale-110" />
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Never Forget
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
              a Client
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The memory and follow-up assistant built for art galleries.
            Remember every detail. Never miss a follow-up.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200 transition-all"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#about"
              className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm text-neutral-300 hover:border-white/25 hover:text-white transition-all"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* Floating stat cards — like in the reference */}
        <div className="absolute bottom-20 left-[8%] z-20 hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4 shadow-2xl">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Follow-ups</p>
            <p className="mt-1 text-2xl font-bold">100%</p>
            <p className="text-xs text-neutral-400">on time</p>
          </div>
        </div>
        <div className="absolute bottom-32 right-[8%] z-20 hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4 shadow-2xl">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500">Clients</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">Every detail</p>
            <p className="text-xs text-neutral-400">remembered</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="h-5 w-5 text-neutral-500" />
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 text-center">
            About Patron
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight">
            Built for how art
            <br />
            <span className="text-neutral-500">sellers actually work</span>
          </h2>
          <p className="mt-6 text-center text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Art sales are built on relationships that span months and years.
            A collector mentions they love a certain artist at a gallery opening,
            buys a piece six months later, and refers a friend a year after that.
            Patron is the memory you wish you had.
          </p>

          {/* Feature grid */}
          <GlowFeatureGrid />
        </div>
      </section>

      {/* ============ SOCIAL PROOF STRIP ============ */}
      <section className="relative z-10 border-y border-white/5 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-lg text-neutral-500">
            Built for galleries, art advisors, and independent art sellers who
            manage relationships — not spreadsheets.
          </p>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 text-center">
            Pricing
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight">
            Simple, transparent
            <br />
            <span className="text-neutral-500">pricing</span>
          </h2>
          <p className="mt-6 text-center text-neutral-400 max-w-xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>

          <GlowPricingGrid />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 text-center">
            FAQ
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight">
            Questions &
            <br />
            <span className="text-neutral-500">answers</span>
          </h2>

          <GlowFAQ />
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Contact
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Get in touch
          </h2>
          <p className="mt-6 text-neutral-400 max-w-lg mx-auto">
            Have questions, feedback, or want a demo? We&apos;d love to hear from you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:hello@patron.app"
              className="group flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm text-neutral-300 hover:border-white/25 hover:text-white transition-all"
            >
              <Mail className="h-4 w-4" />
              hello@patron.app
            </a>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative z-10 py-32 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your clients deserve
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
              to be remembered
            </span>
          </h2>
          <p className="mt-6 text-neutral-400 text-lg">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-semibold text-black hover:bg-neutral-200 transition-all"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span className="font-medium text-neutral-400">Patron</span>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <span>&copy; {new Date().getFullYear()} Patron. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
