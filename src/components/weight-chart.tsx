"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus, Scale, Hash } from "lucide-react";
import { Person } from "@/data/weight-data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface WeightChartProps {
  person: Person;
}

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconClass?: string;
}

function StatCard({ label, value, sub, icon, iconClass }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted p-4">
      <div
        className={cn(
          "mt-0.5 flex-shrink-0 rounded-lg p-1.5",
          iconClass ?? "bg-primary/10 text-primary"
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight tabular-nums">
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}

export function WeightChart({ person }: WeightChartProps) {
  const chartData = person.data
    .filter((d) => d.weight !== null)
    .map((d) => ({ date: d.date, weight: d.weight }));

  const hasData = chartData.length > 0;
  const weights = chartData.map((d) => d.weight as number);
  const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 2) : 0;
  const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 2) : 100;

  const currentWeight = hasData ? (chartData[chartData.length - 1].weight as number) : null;
  const firstWeight = hasData ? (chartData[0].weight as number) : null;
  const weightChange =
    currentWeight !== null && firstWeight !== null
      ? +(currentWeight - firstWeight).toFixed(1)
      : null;

  const isUp = weightChange !== null && weightChange > 0;
  const isDown = weightChange !== null && weightChange < 0;

  const changeIcon = isUp ? (
    <TrendingUp className="w-4 h-4" />
  ) : isDown ? (
    <TrendingDown className="w-4 h-4" />
  ) : (
    <Minus className="w-4 h-4" />
  );

  const changeIconClass = isUp
    ? "bg-rose-100 text-rose-600"
    : isDown
    ? "bg-emerald-100 text-emerald-600"
    : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          {person.name}
        </h2>
        <p className="text-sm text-muted-foreground">Weight history over time</p>
      </div>

      {/* Stats row */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Current Weight"
            value={`${currentWeight} kg`}
            sub={`as of ${chartData[chartData.length - 1].date}`}
            icon={<Scale className="w-4 h-4" />}
          />
          <StatCard
            label="Net Change"
            value={
              weightChange !== null
                ? `${weightChange > 0 ? "+" : ""}${weightChange} kg`
                : "—"
            }
            sub={
              chartData.length > 1
                ? `${chartData[0].date} → ${chartData[chartData.length - 1].date}`
                : undefined
            }
            icon={changeIcon}
            iconClass={changeIconClass}
          />
          <StatCard
            label="Recorded Entries"
            value={String(chartData.length)}
            sub={`of ${person.data.length} sessions`}
            icon={<Hash className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Chart */}
      {!hasData ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center h-56 gap-2 rounded-xl border border-dashed border-border text-muted-foreground"
        >
          <Scale className="w-8 h-8 opacity-30" aria-hidden="true" />
          <p className="text-sm">No weight data available for {person.name}</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[minWeight, maxWeight]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}kg`}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${value} kg`, "Weight"]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={2.5}
              fill="url(#weightGradient)"
              dot={{
                r: 5,
                strokeWidth: 2,
                fill: "white",
                stroke: "var(--color-weight)",
              }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                fill: "var(--color-weight)",
                stroke: "white",
              }}
              connectNulls={false}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}


interface WeightChartProps {
  person: Person;
}
