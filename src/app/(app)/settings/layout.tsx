"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Members", href: "/settings/members" },
  { name: "Import Data", href: "/settings/import" },
  { name: "Danger Zone", href: "/settings/danger" },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
      <h1 className="text-lg font-semibold text-foreground sm:text-xl">Settings</h1>

      <nav
        aria-label="Settings sections"
        className="mt-4 sm:mt-6 lg:mt-10 flex space-x-1 border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 pb-3 pt-0.5 text-sm font-medium transition-colors",
                isActive
                  ? tab.name === "Danger Zone"
                    ? "border-destructive text-destructive"
                    : "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6">{children}</div>
    </div>
  );
}
