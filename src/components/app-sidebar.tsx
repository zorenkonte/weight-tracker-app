"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Link2,
  X,
  Menu,
  Scale,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

const shortcuts = [
  { name: "Add member", href: "/settings/members" },
  { name: "View progress", href: "/dashboard" },
] as const;

function NavLinks({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <nav aria-label="core navigation links" className="flex flex-1 flex-col space-y-10">
      <ul role="list" className="space-y-0.5">
        {navigation.map((item) => {
          const isActive =
            item.href === "/settings"
              ? pathname.startsWith("/settings")
              : pathname === item.href || pathname.startsWith(item.href);
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-muted",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div>
        <span className="text-xs font-medium leading-6 text-muted-foreground">
          Shortcuts
        </span>
        <ul aria-label="shortcuts" role="list" className="space-y-0.5">
          {shortcuts.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-muted",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link2 className="size-4 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function UserProfile() {
  return (
    <div className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
      <span className="flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs text-foreground"
          aria-hidden="true"
        >
          WT
        </span>
        <span className="text-sm font-medium text-foreground">Weight Tracker</span>
      </span>
      <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — fixed, lg+ */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col" aria-label="Main navigation">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-border bg-card p-4">
          {/* Workspace / App identity button */}
          <button
            className="flex w-full items-center gap-x-2.5 rounded-md border border-border bg-card p-2 text-sm shadow-sm transition-all hover:bg-muted"
            aria-label="Weight Tracker workspace"
          >
            <span
              className="flex aspect-square size-8 items-center justify-center rounded bg-primary p-2 text-xs font-medium text-primary-foreground shrink-0"
              aria-hidden="true"
            >
              <Scale className="size-4" />
            </span>
            <div className="flex w-full items-center justify-between gap-x-4 truncate">
              <div className="truncate text-left">
                <p className="truncate whitespace-nowrap text-sm font-medium text-foreground">
                  Weight Tracker
                </p>
                <p className="whitespace-nowrap text-xs text-muted-foreground">Workspace</p>
              </div>
            </div>
          </button>

          <NavLinks pathname={pathname} />

          <div className="mt-auto">
            <UserProfile />
          </div>
        </aside>
      </nav>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-2 shadow-sm sm:gap-x-6 sm:px-4 lg:hidden">
        <button
          className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-muted transition-colors"
          aria-label="Weight Tracker"
        >
          <span
            className="flex aspect-square size-7 items-center justify-center rounded bg-primary p-2 text-xs font-medium text-primary-foreground"
            aria-hidden="true"
          >
            <Scale className="size-3.5" />
          </span>
          <span className="text-sm font-semibold text-foreground">Weight Tracker</span>
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="group flex items-center rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="size-5 shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card border-r border-border lg:hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-semibold text-foreground">Weight Tracker</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-y-6 overflow-y-auto p-4">
              <NavLinks pathname={pathname} onClose={() => setMobileOpen(false)} />
              <div className="mt-auto">
                <UserProfile />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
