"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Package, Users, BarChart3, Search, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import type { Role } from "@/lib/permissions";

const allNavItems = [
  { href: "/today", label: "Dashboard", icon: CalendarDays },
  { href: "/search", label: "Search", icon: Search },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/inventory", label: "Gallery", icon: Package },
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
    <aside className="hidden md:flex md:w-56 md:flex-col bg-[#f6f3f2]">
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div className="space-y-6">
          <div className="px-2">
            <h1 className="font-serif text-xl font-bold tracking-tight text-[#323233]">
              Patron
            </h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#9e9c9c] truncate font-body">
              {orgName}
            </p>
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname.startsWith(item.href) ||
                (item.href === "/today" && (pathname.startsWith("/enquiries") || pathname.startsWith("/analytics")));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-300 font-body",
                    isActive
                      ? "border-l-2 border-[#735a3a] bg-[#735a3a]/5 font-medium text-[#735a3a]"
                      : "border-l-2 border-transparent text-[#5f5f5f] hover:bg-[#735a3a]/5 hover:text-[#323233]"
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
                  "flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-300 font-body",
                  pathname.startsWith("/admin")
                    ? "border-l-2 border-[#735a3a] bg-[#735a3a]/5 font-medium text-[#735a3a]"
                    : "border-l-2 border-transparent text-[#5f5f5f] hover:bg-[#735a3a]/5 hover:text-[#323233]"
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
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-[#9e9c9c] transition-colors duration-300 hover:text-[#5f5f5f] font-body"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
