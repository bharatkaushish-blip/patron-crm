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
    <div className="min-h-screen bg-white text-neutral-900">
      {/* ============ NAV ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            Patron
          </span>

          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#about" className="hover:text-neutral-900 transition-colors">
              About
            </a>
            <a
              href="#pricing"
              className="hover:text-neutral-900 transition-colors"
            >
              Pricing
            </a>
            <a href="#faq" className="hover:text-neutral-900 transition-colors">
              FAQ
            </a>
            <a
              href="#contact"
              className="hover:text-neutral-900 transition-colors"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="flex flex-col items-center justify-center px-6 pt-40 pb-20">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]">
            Never Forget
            <br />
            <span className="text-indigo-600">a Client</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            The memory and follow-up assistant built for art galleries. Remember
            every detail. Never miss a follow-up.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="group flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#about"
              className="flex items-center gap-2 rounded-full border border-neutral-200 px-8 py-3.5 text-sm text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-all"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* ============ CRM PREVIEW ============ */}
      <section className="px-6 pb-32">
        <CrmPreview />
      </section>

      {/* ============ ABOUT / FEATURES ============ */}
      <section id="about" className="py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 text-center">
            About Patron
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Built for how art
            <br />
            <span className="text-neutral-400">sellers actually work</span>
          </h2>
          <p className="mt-6 text-center text-neutral-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Art sales are built on relationships that span months and years. A
            collector mentions they love a certain artist at a gallery opening,
            buys a piece six months later, and refers a friend a year after that.
            Patron is the memory you wish you had.
          </p>

          <FeatureGrid />
        </div>
      </section>

      {/* ============ SOCIAL PROOF STRIP ============ */}
      <section className="bg-neutral-50 py-16 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-lg text-neutral-500">
            Built for galleries, art advisors, and independent art sellers who
            manage relationships — not spreadsheets.
          </p>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-32 px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 text-center">
            Pricing
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Simple, transparent
            <br />
            <span className="text-neutral-400">pricing</span>
          </h2>
          <p className="mt-6 text-center text-neutral-600 max-w-xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>

          <PricingGrid />
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="bg-neutral-50 py-32 px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 text-center">
            FAQ
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Questions &amp;
            <br />
            <span className="text-neutral-400">answers</span>
          </h2>

          <FaqSection />
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="py-32 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Contact
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Get in touch
          </h2>
          <p className="mt-6 text-neutral-600 max-w-lg mx-auto">
            Have questions, feedback, or want a demo? We&apos;d love to hear
            from you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:teampatroncollective@gmail.com"
              className="group flex items-center gap-2 rounded-full border border-neutral-200 px-8 py-3.5 text-sm text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-all"
            >
              <Mail className="h-4 w-4" />
              teampatroncollective@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bg-neutral-50 py-32 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Your clients deserve
            <br />
            <span className="text-indigo-600">to be remembered</span>
          </h2>
          <p className="mt-6 text-neutral-600 text-lg">
            Start your 14-day free trial today. No credit card required.
          </p>
          <a
            href="/signup"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-10 py-4 text-sm font-semibold text-white hover:bg-indigo-700 transition-all"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-neutral-100 py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <span className="font-medium text-neutral-900">Patron</span>
          <div className="flex items-center gap-6">
            <a
              href="#about"
              className="hover:text-neutral-900 transition-colors"
            >
              About
            </a>
            <a
              href="#pricing"
              className="hover:text-neutral-900 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hover:text-neutral-900 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="hover:text-neutral-900 transition-colors"
            >
              Contact
            </a>
          </div>
          <span>
            &copy; {new Date().getFullYear()} Patron. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
