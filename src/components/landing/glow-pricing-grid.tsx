import { ArrowRight } from "lucide-react";

export function PricingGrid() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Free Trial */}
      <div className="bg-[#f0eded] p-8">
        <p className="font-body text-sm font-medium text-[#5f5f5f] uppercase tracking-wide">
          Free Trial
        </p>
        <p className="mt-4 font-serif text-4xl font-bold text-[#323233]">
          &#8377;0
          <span className="font-body text-base font-normal text-[#5f5f5f]">
            {" "}/ 14 days
          </span>
        </p>
        <ul className="mt-8 space-y-3 text-sm text-[#5f5f5f] font-body">
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Unlimited clients
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Notes & follow-ups
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Sales & enquiry
            tracking
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> CSV import & export
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Email reminders
          </li>
        </ul>
        <a
          href="/signup"
          className="mt-8 flex items-center justify-center gap-2 w-full bg-gradient-to-br from-[#735a3a] to-[#664e30] py-3 text-center text-sm font-medium text-[#fff6f0] hover:from-[#664e30] hover:to-[#513b1e] transition-all duration-300"
        >
          Start free trial
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Pro */}
      <div className="relative bg-[#ffffff] p-8 border border-[#b2b2b1]/15">
        <div className="absolute top-0 right-0 bg-[#fff1bf] px-3 py-1">
          <span className="font-body text-xs font-medium text-[#635a34]">
            Popular
          </span>
        </div>
        <p className="font-body text-sm font-medium text-[#5f5f5f] uppercase tracking-wide">
          Pro
        </p>
        <p className="mt-4 font-serif text-4xl font-bold text-[#323233]">
          &#8377;1,999
          <span className="font-body text-base font-normal text-[#5f5f5f]">
            {" "}/ month
          </span>
        </p>
        <ul className="mt-8 space-y-3 text-sm text-[#5f5f5f] font-body">
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Everything in Free
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Unlimited usage
            forever
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Priority support
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Team members
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#735a3a]">&#10003;</span> Advanced analytics
          </li>
        </ul>
        <a
          href="/signup"
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 text-center text-sm font-medium text-[#735a3a] border border-[#735a3a]/30 hover:bg-[#735a3a]/5 transition-all duration-300"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
