"use client";

import { useState } from "react";
import { weightData } from "@/data/weight-data";
import { UserList } from "@/components/user-list";
import { WeightChart } from "@/components/weight-chart";
import { Activity } from "lucide-react";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState(weightData[0].name);
  const person = weightData.find((p) => p.name === selectedUser) ?? weightData[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            Weight Tracker
          </span>
          <time
            className="ml-auto text-sm text-muted-foreground"
            dateTime={new Date().toISOString().split("T")[0]}
          >
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-52 shrink-0">
            <div className="rounded-xl border border-border bg-card shadow-sm p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Members
              </p>
              <UserList
                users={weightData}
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
              />
            </div>
          </aside>

          {/* Chart panel */}
          <section className="flex-1 min-w-0">
            <WeightChart person={person} />
          </section>
        </div>
      </main>
    </div>
  );
}
