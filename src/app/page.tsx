import Link from "next/link";
import {
  Activity,
  BarChart2,
  Users,
  Upload,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Multi-member tracking",
    description:
      "Track weight progress for your whole group — friends, family, or a fitness crew — all in one place.",
  },
  {
    icon: BarChart2,
    title: "Visual progress charts",
    description:
      "Beautiful line charts show each person's journey over time at a glance.",
  },
  {
    icon: Upload,
    title: "Spreadsheet import",
    description:
      "Already have data in CSV or Excel? Import it in seconds and pick up where you left off.",
  },
  {
    icon: TrendingDown,
    title: "Session-based logging",
    description:
      "Log weigh-ins by session date so no entry ever gets lost, even if someone missed a week.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            Weight Tracker
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/settings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Dashboard
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
          <Activity className="w-3.5 h-3.5" aria-hidden="true" />
          Group Weight Tracker
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] max-w-2xl">
          Track progress,{" "}
          <span className="text-primary">together</span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
          A lightweight app designed to monitor weight over time for groups.
          Log sessions, visualize trends, and keep the whole team on track.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 h-11 px-6 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Manage Members
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-bold text-foreground mb-10">
            Everything you need to stay on track
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            Weight Tracker
          </span>
          <span>Built for groups who track progress together.</span>
        </div>
      </footer>
    </div>
  );
}

