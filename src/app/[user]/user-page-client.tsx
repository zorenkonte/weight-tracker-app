"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWeightData } from "@/hooks/use-weight-data";
import { UserList } from "@/components/user-list";
import { WeightChart } from "@/components/weight-chart";
import { WeightEntryForm } from "@/components/weight-entry-form";
import { EntriesTable } from "@/components/entries-table";
import { MemberProfileDialog } from "@/components/member-profile-dialog";
import { Person } from "@/hooks/use-weight-data";
import { Activity, Plus } from "lucide-react";

export function UserPageClient({ initialPeople }: { initialPeople: Person[] }) {
  const { people, dates, addEntry } = useWeightData(initialPeople);
  const params = useParams<{ user: string }>();
  const router = useRouter();

  const selectedUser =
    people.find((p) => p.name.toLowerCase() === decodeURIComponent(params.user ?? "").toLowerCase())
      ?.name ?? people[0]?.name ?? "";

  function setSelectedUser(name: string) {
    router.push(`/${encodeURIComponent(name.toLowerCase())}`, { scroll: false });
  }

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<{ name: string; index: number } | null>(null);

  const person = people.find((p) => p.name === selectedUser) ?? people[0];

  function handleProfileSaved(oldName: string, newName: string) {
    setEditingMember(null);
    if (oldName !== newName) {
      router.replace(`/${encodeURIComponent(newName.toLowerCase())}`);
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-base font-semibold text-foreground tracking-tight">
              Weight Tracker
            </span>
          </Link>
          <button
            onClick={() => setShowForm(true)}
            aria-label="Add weight entry"
            className="ml-auto flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
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
                users={people}
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
                onEditMember={(name, index) => setEditingMember({ name, index })}
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
      {editingMember && (() => {
        const editPerson = people.find((p) => p.name === editingMember.name);
        return editPerson ? (
          <MemberProfileDialog
            person={editPerson}
            defaultIndex={editingMember.index}
            people={people}
            onClose={() => setEditingMember(null)}
            onSaved={handleProfileSaved}
          />
        ) : null;
      })()}
    </div>
  );
}
