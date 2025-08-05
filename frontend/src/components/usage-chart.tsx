"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "./glass-card";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

const GET_USAGE_DATA = gql`
  query GetUsageData {
    apiKeys {
      id
      provider
      usageLogs {
        timestamp
        totalTokens
      }
    }
  }
`;

interface UsageLog {
  timestamp: string;
  totalTokens: number | null;
}

interface ApiKeyUsage {
  id: string;
  provider: string;
  usageLogs: UsageLog[];
}

interface UsageData {
  apiKeys: ApiKeyUsage[];
}

const processDataForChart = (data: UsageData | undefined) => {
  if (!data || !data.apiKeys) return [];

  const monthlyTotals = Array(12).fill(0).map((_, i) => ({
    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
    total: 0,
  }));

  data.apiKeys.forEach((key: ApiKeyUsage) => {
    key.usageLogs.forEach((log: UsageLog) => {
      const month = new Date(log.timestamp).getMonth();
      if (monthlyTotals[month] && log.totalTokens) {
        monthlyTotals[month].total += log.totalTokens;
      }
    });
  });

  return monthlyTotals;
};

export function UsageChart() {
  const { loading, error, data } = useQuery<UsageData>(GET_USAGE_DATA);
  const chartData = useMemo(() => processDataForChart(data), [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading chart data: {error.message}</div>;

  return (
    <GlassCard>
      <div className="p-6">
        <h3 className="text-lg font-medium">Token Usage Overview (Total Tokens)</h3>
      </div>
      <div className="pl-2 pb-4">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
                borderRadius: "var(--radius)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
