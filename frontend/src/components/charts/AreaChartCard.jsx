import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-charcoal text-white px-4 py-3 rounded-xl shadow-elevated text-sm border border-white/10">
      <p className="font-bold font-display mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-white/70 text-xs">
          {entry.name}: <span className="font-bold text-white">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AreaChartCard({ data, dataKey, xAxisKey = 'name', title, color = '#4F46E5', height = 300 }) {
  return (
    <div className="card p-6">
      {title && <h3 className="section-title mb-5">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.12} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#gradient-${dataKey})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
