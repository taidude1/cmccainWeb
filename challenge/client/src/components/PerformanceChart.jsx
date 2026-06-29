import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const TICK_STYLE = { fontSize: 10, fill: '#8a9baa', fontFamily: 'Alegreya Sans, sans-serif' };

export default function PerformanceChart({ commitData = {} }) {
  const data = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      result.push({
        date: ds,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        goals: commitData[ds] || 0,
      });
    }
    return result;
  }, [commitData]);

  const ticks = data.filter((_, i) => i % 7 === 0).map(d => d.date);

  return (
    <div className="perf-chart-wrap">
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(42,92,69,0.07)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 8, fontSize: '0.8rem' }}
            formatter={(v, n) => [v, 'Goals']}
            labelFormatter={l => new Date(l + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          />
          <Bar dataKey="goals" fill="#089981" radius={[3, 3, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
