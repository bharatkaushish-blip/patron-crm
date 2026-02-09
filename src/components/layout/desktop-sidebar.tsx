"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Package, Users, BarChart3, Search, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
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

interface DesktopSidebarProps {
  orgName: string;
  role?: Role;
  isSuperadmin?: boolean;
  canAccessSettings?: boolean;
}

export function DesktopSidebar({
  orgName,
  role,
  isSuperadmin,
  canAccessSettings = true,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) => {
    if (item.href === "/settings" && !canAccessSettings) return false;
    return true;
  });

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-neutral-200 md:bg-white">
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div className="space-y-6">
          <div className="px-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Patron
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400 truncate">
              {orgName}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-neutral-100 font-medium text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {isSuperadmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-neutral-100 font-medium text-neutral-900"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
