"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Person } from "@/data/weight-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeightChartProps {
  person: Person;
}

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function WeightChart({ person }: WeightChartProps) {
  const chartData = person.data
    .filter((d) => d.weight !== null)
    .map((d) => ({
      date: d.date,
      weight: d.weight,
    }));

  const hasData = chartData.length > 0;

  const weights = chartData.map((d) => d.weight as number);
  const minWeight = Math.floor(Math.min(...weights) - 2);
  const maxWeight = Math.ceil(Math.max(...weights) + 2);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{person.name}</CardTitle>
        <CardDescription>Weight history over time</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No weight data available for {person.name}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}kg`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} kg`, "Weight"]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-weight)"
                strokeWidth={2}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
