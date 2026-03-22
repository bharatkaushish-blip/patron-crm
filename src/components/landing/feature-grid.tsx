import { Users, Bell, Package, BarChart3, Upload, Shield } from "lucide-react";

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
    icon: Package,
    title: "Inventory",
    description:
      "Catalog your artworks with photos, dimensions, pricing, and status. Always know what's available, sold, or on hold.",
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
    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#b2b2b1]/10">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-[#0e0e0e] p-8 hover:bg-[#1a1a1a] transition-colors duration-300"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-[#735a3a]/15">
            <feature.icon className="h-5 w-5 text-[#fddab2]" />
          </div>
          <h3 className="mt-5 font-serif text-base font-bold text-[#fcf9f8]">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm text-[#9e9c9c] leading-relaxed font-body">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
