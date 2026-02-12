const faqs = [
  {
    q: "Who is Patron built for?",
    a: "Patron is built specifically for art gallery owners, art advisors, and independent art sellers who manage client relationships. If you sell art and need to remember who likes what and when to follow up — Patron is for you.",
  },
  {
    q: "How is this different from a regular CRM?",
    a: "Regular CRMs are built for sales teams with pipelines, deal stages, and complex workflows. Patron is intentionally simple — it's a memory tool. Add a client, jot a note, set a follow-up. That's it. No learning curve, no bloat.",
  },
  {
    q: "What happens after the free trial?",
    a: "After 14 days, your account becomes read-only. All your data is preserved — you just can't add new clients or notes until you upgrade. Nothing is ever deleted.",
  },
  {
    q: "Can I import my existing client list?",
    a: "Yes. You can upload a CSV file with your clients. Patron will auto-map the columns (name, phone, email, location, tags) and import them. There's also a template you can download to fill in.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Patron uses Supabase with row-level security, meaning your data is isolated and encrypted. No one — not even other Patron users — can see your gallery's information.",
  },
  {
    q: "Can I use Patron on my phone?",
    a: "Yes. Patron is a Progressive Web App (PWA). Open it in your phone's browser and add it to your home screen — it works and feels like a native app.",
  },
];

export function FaqSection() {
  return (
    <div className="mt-16 space-y-3 max-w-2xl mx-auto">
      {faqs.map((item) => (
        <details
          key={item.q}
          className="group border border-neutral-200 bg-white rounded-xl overflow-hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-neutral-900 marker:[content:''] [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="ml-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-45 text-lg leading-none">
              +
            </span>
          </summary>
          <div className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
