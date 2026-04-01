"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWeightData } from "@/hooks/use-weight-data";
import { memberSlug } from "@/hooks/use-weight-data";
import { UserList } from "@/components/user-list";
import { WeightChart } from "@/components/weight-chart";
import { WeightEntryForm } from "@/components/weight-entry-form";
import { EntriesTable } from "@/components/entries-table";
import { Person } from "@/hooks/use-weight-data";
import { Plus } from "lucide-react";

export function UserPageClient({ initialPeople }: { initialPeople: Person[] }) {
  const { people, dates, addEntry } = useWeightData(initialPeople);
  const params = useParams<{ user: string }>();
  const router = useRouter();

  // Look up by id → handle → name (for legacy URLs)
  const param = decodeURIComponent(params.user ?? "");
  const resolved =
    people.find((p) => p.id === param) ??
    people.find((p) => p.handle?.toLowerCase() === param.toLowerCase()) ??
    people.find((p) => p.name.toLowerCase() === param.toLowerCase()) ??
    people[0];
  const selectedUser = resolved?.name ?? people[0]?.name ?? "";

  function setSelectedUser(name: string) {
    const person = people.find((p) => p.name === name);
    if (person) router.push(`/u/${memberSlug(person)}`, { scroll: false });
  }

  const [showForm, setShowForm] = useState(false);

  const person = people.find((p) => p.name === selectedUser) ?? people[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Page action row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{person?.name ?? "Member"}</h1>
            {person?.handle && (
              <p className="text-sm text-muted-foreground">@{person.handle}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            aria-label="Add weight entry"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-52 shrink-0">
            <div className="rounded-xl border border-border bg-card shadow-sm p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Members
              </p>
              <UserList
                users={people}
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
              />
            </div>
          </aside>

          {/* Chart + entries panel */}
          <section className="flex-1 min-w-0 space-y-5">
            {person && <WeightChart person={person} />}
            {person && <EntriesTable person={person} />}
          </section>
        </div>
      </main>

      {/* Add Entry modal */}
      {showForm && (
        <WeightEntryForm
          people={people}
          dates={dates}
          initialPerson={selectedUser}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
