import { ArrowRight } from "lucide-react";

export function PricingGrid() {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Free Trial */}
      <div className="border border-neutral-200 bg-white rounded-xl p-8">
        <p className="text-sm font-medium text-neutral-400">Free Trial</p>
        <p className="mt-4 text-4xl font-bold text-neutral-900">
          &#8377;0
          <span className="text-base font-normal text-neutral-400">
            {" "}/ 14 days
          </span>
        </p>
        <ul className="mt-8 space-y-3 text-sm text-neutral-600">
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Unlimited clients
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Notes & follow-ups
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Sales & enquiry
            tracking
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> CSV import & export
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Email reminders
          </li>
        </ul>
        <a
          href="/signup"
          className="mt-8 flex items-center justify-center gap-2 w-full rounded-full bg-indigo-600 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Start free trial
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Pro */}
      <div className="relative border border-neutral-200 bg-white rounded-xl p-8">
        <p className="text-sm font-medium text-neutral-400">Pro</p>
        <p className="mt-4 text-4xl font-bold text-neutral-900">
          &#8377;1,999
          <span className="text-base font-normal text-neutral-400">
            {" "}/ month
          </span>
        </p>
        <ul className="mt-8 space-y-3 text-sm text-neutral-600">
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Everything in Free
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Unlimited usage
            forever
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Priority support
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Team members
          </li>
          <li className="flex items-center gap-2">
            <span className="text-indigo-600">&#10003;</span> Advanced analytics
          </li>
        </ul>
        <a
          href="/signup"
          className="mt-8 flex items-center justify-center gap-2 w-full rounded-full border border-indigo-600 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
