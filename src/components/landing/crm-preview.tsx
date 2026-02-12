import {
  CalendarDays,
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Search,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Today", icon: CalendarDays, active: true },
  { label: "Enquiries", icon: ClipboardList },
  { label: "Inventory", icon: Package },
  { label: "Clients", icon: Users },
  { label: "Analytics", icon: BarChart3 },
  { label: "Search", icon: Search },
  { label: "Settings", icon: Settings },
];

const stats = [
  { label: "Total Clients", value: "142" },
  { label: "Due Today", value: "5" },
  { label: "This Month", value: "$24.8K" },
  { label: "Open Enquiries", value: "12" },
];

const followUps = [
  {
    initials: "PM",
    name: "Priya Mehta",
    note: "Follow up on Husain landscape interest",
    color: "bg-rose-100 text-rose-700",
  },
  {
    initials: "JC",
    name: "James Chen",
    note: "Send Souza catalogue from last exhibition",
    color: "bg-sky-100 text-sky-700",
  },
  {
    initials: "AD",
    name: "Anika Desai",
    note: "Discuss commission piece — budget confirmed",
    color: "bg-violet-100 text-violet-700",
  },
];

const recentClients = [
  { initials: "RK", name: "Rohan Kapoor", city: "Mumbai", tag: "Collector" },
  { initials: "SL", name: "Sarah Lin", city: "Singapore", tag: "Advisor" },
  { initials: "VN", name: "Vikram Nair", city: "Delhi", tag: "New Lead" },
  { initials: "EM", name: "Elena Morales", city: "New York", tag: "Collector" },
];

export function CrmPreview() {
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-neutral-300" />
          <div className="h-3 w-3 rounded-full bg-neutral-300" />
          <div className="h-3 w-3 rounded-full bg-neutral-300" />
        </div>
        <div className="mx-auto rounded-md bg-white border border-neutral-200 px-4 py-1 text-xs text-neutral-400 w-64 text-center">
          app.patroncollective.com
        </div>
      </div>

      {/* App content */}
      <div className="flex min-h-[420px]">
        {/* Sidebar */}
        <div className="hidden md:flex w-48 flex-col border-r border-neutral-100 bg-neutral-50/50 px-3 py-4">
          <span className="px-2 text-sm font-bold text-neutral-900 tracking-tight">
            Patron
          </span>
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-neutral-500"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main area */}
        <div className="flex-1 p-5 md:p-6 space-y-6 overflow-hidden">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-neutral-100 bg-neutral-50/50 px-3 py-3"
              >
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Follow-ups */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Today&apos;s Follow-ups
              </h3>
              <div className="mt-3 space-y-2.5">
                {followUps.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${item.color}`}
                    >
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent clients */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Recent Clients
              </h3>
              <div className="mt-3 space-y-2.5">
                {recentClients.map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                      {client.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-neutral-400">{client.city}</p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      {client.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
