'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface SourceStat {
  source_label: string;
  signups: number;
  converted: number;
  conversion_rate: number;
}

interface SourceAttributionChartProps {
  data: SourceStat[];
}

export function SourceAttributionChart({ data }: SourceAttributionChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-80 bg-[#121318] border border-white/10 rounded-xl p-6 animate-pulse flex items-center justify-center text-zinc-500 text-xs font-mono">
        Loading chart analytics...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-xl bg-[#121318] border border-white/10 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-indigo-400">📊</span> Source Volume vs. Paying Customers
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare visitor signup volume against converted paying customers per channel
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
            <span className="text-zinc-300 font-medium">Total Signups</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-zinc-300 font-medium">Converted</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            barGap={6}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="source_label"
              stroke="#71717a"
              tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              tickLine={{ stroke: '#3f3f46' }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#a1a1aa', fontSize: 12, fontFamily: 'var(--font-mono)' }}
              tickLine={{ stroke: '#3f3f46' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0d0e12',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '0.75rem',
                color: '#f4f4f5',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              formatter={(value: any, name: any) => [
                Number(value || 0).toLocaleString(),
                String(name) === 'signups' ? 'Total Signups' : 'Converted (Paying)',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#ffffff', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}
            />
            <Bar
              dataKey="signups"
              name="signups"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="converted"
              name="converted"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

