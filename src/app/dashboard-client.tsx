"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useWeightData } from "@/hooks/use-weight-data";
import { memberSlug } from "@/hooks/use-weight-data";
import { WeightEntryForm } from "@/components/weight-entry-form";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Scale,
  Award,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";
import { Person } from "@/hooks/use-weight-data";
import { getAvatarColor } from "@/lib/avatar-store";
import { cn } from "@/lib/utils";

// ─── Aggregate helpers ───────────────────────────────────────────────────────

function parseMDY(d: string): Date {
  const [m, day, y] = d.split("/").map(Number);
  return new Date(y, m - 1, day);
}

function formatShortDate(d: string) {
  try {
    const [m, day] = d.split("/");
    return `${m}/${day}`;
  } catch {
    return d;
  }
}

interface MemberStat {
  person: Person;
  index: number;
  firstWeight: number | null;
  latestWeight: number | null;
  change: number | null;
  changePct: number | null;
  sessions: number;
  totalSessions: number;
}

function computeStats(people: Person[], dates: string[]) {
  const totalSessions = dates.length;

  const memberStats: MemberStat[] = people.map((person, index) => {
    const recorded = person.data
      .filter((d) => d.weight !== null)
      .sort((a, b) => parseMDY(a.date).getTime() - parseMDY(b.date).getTime());
    const firstWeight = recorded[0]?.weight ?? null;
    const latestWeight = recorded[recorded.length - 1]?.weight ?? null;
    const change =
      firstWeight !== null && latestWeight !== null && recorded.length > 1
        ? +(latestWeight - firstWeight).toFixed(1)
        : null;
    const changePct =
      change !== null && firstWeight !== null
        ? +((change / firstWeight) * 100).toFixed(1)
        : null;
    return {
      person,
      index,
      firstWeight,
      latestWeight,
      change,
      changePct,
      sessions: recorded.length,
      totalSessions,
    };
  });

  const latestSession = dates[dates.length - 1] ?? null;
  const activeInLatest = latestSession
    ? people.filter((p) =>
        p.data.some((d) => d.date === latestSession && d.weight !== null)
      ).length
    : 0;

  const latestWeights = memberStats
    .map((s) => s.latestWeight)
    .filter((w): w is number => w !== null);
  const groupAvg =
    latestWeights.length > 0
      ? +(latestWeights.reduce((a, b) => a + b, 0) / latestWeights.length).toFixed(1)
      : null;

  // Most improved: largest % decrease
  const improved = memberStats
    .filter((s) => s.changePct !== null && s.changePct < 0)
    .sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
  const bestImproved = improved[0] ?? null;

  // Group average per session (avg of all members who logged that date)
  const avgBySession = dates.map((date) => {
    const weights = people
      .flatMap((p) => p.data.filter((d) => d.date === date && d.weight !== null))
      .map((d) => d.weight as number);
    const avg = weights.length > 0
      ? +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
      : null;
    return { date, avg, label: formatShortDate(date) };
  });

  return { memberStats, totalSessions, activeInLatest, groupAvg, bestImproved, avgBySession };
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
      <div
        className={cn("mt-0.5 rounded-lg p-2.5 shrink-0", iconClass ?? "bg-primary/10 text-primary")}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-tight mt-0.5">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Group Chart ─────────────────────────────────────────────────────────────

function GroupChart({ data }: { data: { label: string; avg: number | null }[] }) {
  const chartData = data.filter((d) => d.avg !== null);
  if (chartData.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Not enough data to display chart.
      </div>
    );
  }

  const weights = chartData.map((d) => d.avg as number);
  const min = Math.floor(Math.min(...weights) - 3);
  const max = Math.ceil(Math.max(...weights) + 3);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
          }}
          formatter={(v: number) => [`${v} kg`, "Group avg"]}
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Progress Table ───────────────────────────────────────────────────────────

function ProgressTable({
  stats,
  onRowClick,
}: {
  stats: MemberStat[];
  onRowClick: (person: Person) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Member
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
              Start
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Latest
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Change
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
              Sessions
            </th>
            <th className="w-6 px-2" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => {
            const color = getAvatarColor(s.person.colorIndex, s.index);
            const isUp = s.change !== null && s.change > 0;
            const isDown = s.change !== null && s.change < 0;

            return (
              <tr
                key={s.person.name}
                onClick={() => onRowClick(s.person)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: color.hex, color: color.textHex }}
                      aria-hidden="true"
                    >
                      {s.person.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{s.person.name}</p>
                      {s.person.handle && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{s.person.handle}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums hidden sm:table-cell">
                  {s.firstWeight !== null ? `${s.firstWeight} kg` : "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">
                  {s.latestWeight !== null ? `${s.latestWeight} kg` : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {s.change === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        isUp ? "text-rose-500" : isDown ? "text-emerald-600" : "text-muted-foreground"
                      )}
                    >
                      {isUp ? (
                        <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      ) : isDown ? (
                        <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      ) : (
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      )}
                      {isUp ? "+" : ""}
                      {s.change} kg
                      {s.changePct !== null && (
                        <span className="font-normal text-xs opacity-70">
                          ({isUp ? "+" : ""}
                          {s.changePct}%)
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums hidden md:table-cell">
                  {s.sessions}/{s.totalSessions}
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dashboard Client ────────────────────────────────────────────────────────

export function DashboardClient({ initialPeople }: { initialPeople: Person[] }) {
  const { people, dates, addEntry } = useWeightData(initialPeople);
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const { memberStats, totalSessions, activeInLatest, groupAvg, bestImproved, avgBySession } =
    useMemo(() => computeStats(people, dates), [people, dates]);

  const attendance = totalSessions > 0
    ? `${activeInLatest} of ${people.length} active`
    : "No sessions yet";

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <main className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7 space-y-8">
        {/* Page title */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground sm:text-xl">Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {people.length} members · {totalSessions} sessions
            </p>
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

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Members"
            value={String(people.length)}
            sub={`${memberStats.filter((s) => s.sessions > 0).length} with data`}
          />
          <StatCard
            icon={CalendarCheck}
            label="Latest Session"
            value={attendance}
            sub={dates[dates.length - 1] ?? "—"}
            iconClass="bg-sky-100 text-sky-600"
          />
          <StatCard
            icon={Scale}
            label="Group Average"
            value={groupAvg !== null ? `${groupAvg} kg` : "—"}
            sub="avg of latest weights"
            iconClass="bg-violet-100 text-violet-600"
          />
          <StatCard
            icon={Award}
            label="Most Improved"
            value={
              bestImproved
                ? `${bestImproved.changePct}%`
                : "—"
            }
            sub={bestImproved?.person.name ?? "No changes yet"}
            iconClass="bg-emerald-100 text-emerald-600"
          />
        </div>

        {/* Group trend chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Group Average Weight</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Average weight across all members per session
          </p>
          <GroupChart data={avgBySession} />
        </div>

        {/* Member progress table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Member Progress</h2>
            <Link
              href="/settings"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage members →
            </Link>
          </div>
          <ProgressTable
            stats={memberStats}
            onRowClick={(person) => router.push(`/u/${memberSlug(person)}`)}
          />
        </div>
      </main>

      {showForm && (
        <WeightEntryForm
          people={people}
          dates={dates}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}


