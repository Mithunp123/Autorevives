import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

export default function BarChartCard({ data, dataKey, xAxisKey = 'name', title, color = '#D4A017', height = 300 }) {
  return (
    <div className="card p-6">
      {title && <h3 className="section-title mb-5">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
