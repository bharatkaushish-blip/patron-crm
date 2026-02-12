import { Users, Bell, Search, BarChart3, Upload, Shield } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client Profiles",
    description:
      "Name, contact, preferences, tags — everything about a client in one place. Import from your phone contacts or CSV.",
  },
  {
    icon: Bell,
    title: "Smart Follow-ups",
    description:
      "Set follow-up dates on any note. Get a daily email digest of who needs attention today. Never let a warm lead go cold.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description:
      "Search across clients, notes, enquiries, and sales. Find that conversation from 6 months ago in seconds.",
  },
  {
    icon: BarChart3,
    title: "Sales & Enquiries",
    description:
      "Track artwork sales with amounts. Log enquiries with size, budget, artist preference, and timelines.",
  },
  {
    icon: Upload,
    title: "CSV Import & Export",
    description:
      "Bring your existing client list via CSV upload. Export everything anytime. Your data, your way.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your gallery data is isolated and encrypted. Row-level security means only you see your data. Always.",
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="border border-neutral-200 bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <feature.icon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
