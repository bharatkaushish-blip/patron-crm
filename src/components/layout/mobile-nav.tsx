"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Package, Users, BarChart3, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/permissions";

const allNavItems = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/enquiries", label: "Enquiries", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileNavProps {
  role?: Role;
  isSuperadmin?: boolean;
  canAccessSettings?: boolean;
}

export function MobileNav({
  role,
  isSuperadmin,
  canAccessSettings = true,
}: MobileNavProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) => {
    if (item.href === "/settings" && !canAccessSettings) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white md:hidden">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors",
                isActive
                  ? "text-indigo-600"
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(isActive && "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
