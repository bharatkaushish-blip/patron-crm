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
    color: "bg-[#735a3a]/15 text-[#735a3a]",
  },
  {
    initials: "JC",
    name: "James Chen",
    note: "Send Souza catalogue from last exhibition",
    color: "bg-[#685f38]/15 text-[#685f38]",
  },
  {
    initials: "AD",
    name: "Anika Desai",
    note: "Discuss commission piece — budget confirmed",
    color: "bg-[#5f5f5f]/15 text-[#5f5f5f]",
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
    <div className="mx-auto max-w-5xl bg-[#ffffff] shadow-[0_4px_60px_rgba(50,50,51,0.04)] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-[#f0eded] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#d6d4d3]" />
          <div className="h-3 w-3 rounded-full bg-[#d6d4d3]" />
          <div className="h-3 w-3 rounded-full bg-[#d6d4d3]" />
        </div>
        <div className="mx-auto bg-[#ffffff] px-4 py-1 text-xs text-[#5f5f5f] w-64 text-center font-body">
          app.patroncollective.com
        </div>
      </div>

      {/* App content */}
      <div className="flex min-h-[420px]">
        {/* Sidebar */}
        <div className="hidden md:flex w-48 flex-col bg-[#f6f3f2] px-3 py-4">
          <span className="px-2 font-serif text-sm font-bold text-[#323233] tracking-tight">
            Patron
          </span>
          <nav className="mt-6 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-sm font-body ${
                  item.active
                    ? "bg-[#735a3a]/10 text-[#735a3a] font-medium"
                    : "text-[#5f5f5f] hover:text-[#323233]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main area */}
        <div className="flex-1 p-5 md:p-6 space-y-6 overflow-hidden bg-[#fcf9f8]">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#f0eded] px-3 py-3"
              >
                <p className="text-[11px] text-[#5f5f5f] uppercase tracking-wide font-body">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-[#323233] font-serif">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Follow-ups */}
            <div>
              <h3 className="text-xs font-semibold text-[#5f5f5f] uppercase tracking-wide font-body">
                Today&apos;s Follow-ups
              </h3>
              <div className="mt-3 space-y-2">
                {followUps.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 bg-[#ffffff] p-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold font-body ${item.color}`}
                    >
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#323233] font-body">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#5f5f5f] truncate font-body">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent clients */}
            <div>
              <h3 className="text-xs font-semibold text-[#5f5f5f] uppercase tracking-wide font-body">
                Recent Clients
              </h3>
              <div className="mt-3 space-y-2">
                {recentClients.map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center gap-3 bg-[#ffffff] p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#f0eded] text-xs font-semibold text-[#5f5f5f] font-body">
                      {client.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#323233] font-body">
                        {client.name}
                      </p>
                      <p className="text-xs text-[#5f5f5f] font-body">
                        {client.city}
                      </p>
                    </div>
                    <span className="bg-[#fff1bf] px-2 py-0.5 text-[10px] font-medium text-[#635a34] font-body">
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
