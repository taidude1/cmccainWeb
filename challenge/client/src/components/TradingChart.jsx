import {
  ResponsiveContainer, ComposedChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, ReferenceLine
} from 'recharts';

const TICK_STYLE = { fontSize: 11, fill: '#8a9baa', fontFamily: 'Alegreya Sans, sans-serif' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: '0.82rem' }}>
          {p.name}: <strong>{p.value ?? '—'}</strong>
        </div>
      ))}
    </div>
  );
}

function tickEvery(data, n = 14) {
  return data
    .map((d, i) => (i % n === 0 ? d.date : ''))
    .filter(Boolean);
}

export default function TradingChart({ chartData = [] }) {
  if (!chartData.length) {
    return (
      <div className="trading-chart-wrap">
        <div className="chart-empty">No data yet — complete goals to see progress</div>
      </div>
    );
  }

  // Thin the x-axis ticks so they don't crowd
  const ticks = chartData.filter((_, i) => i % 14 === 0).map(d => d.date);

  return (
    <div className="trading-chart-wrap">
      <div className="chart-legend-custom">
        <span className="legend-dot" style={{ background: '#089981' }} />Actual
        <span className="legend-dot" style={{ background: '#26a69a', opacity: 0.7 }} />Projected
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(42,92,69,0.07)" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={d => {
              const dt = new Date(d + 'T12:00:00');
              return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Projected line (target) */}
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#26a69a"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            name="Projected"
            connectNulls
          />
          {/* Actual line */}
          <Line
            type="stepAfter"
            dataKey="actual"
            stroke="#089981"
            strokeWidth={2.5}
            dot={false}
            name="Actual"
            connectNulls={false}
            activeDot={{ r: 4, fill: '#089981', stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
