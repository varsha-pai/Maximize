import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Activity as CorrelationIcon,
  Calendar
} from 'lucide-react';

const COLORS = {
  Coding: '#8b5cf6',   // Purple
  Reading: '#a78bfa',  // Light Purple
  Learning: '#6366f1', // Indigo
  Exercise: '#10b981', // Emerald
  Social: '#ec4899',   // Pink
  Sleep: '#3b82f6'     // Blue
};

const DEFAULT_COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#ec4899', '#3b82f6', '#f59e0b'];

// Custom Tooltip for dark mode aesthetics
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl">
        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value} {entry.name.includes('Hours') || entry.name.includes('Mood') || entry.name.includes('Energy') ? '' : 'mins'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics({ analytics }) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const { activityDistribution, weeklyTimeline, moodEnergyCorrelation } = analytics;

  // Format distribution value from minutes to hours for display
  const formattedDist = activityDistribution.map(d => ({
    name: d.name,
    value: Math.round(d.value / 60)
  })).filter(d => d.value > 0);

  const totalWeeklyFocus = weeklyTimeline.reduce((acc, curr) => acc + curr.focusHours, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Productivity Analytics</h1>
          <p className="text-slate-400 mt-1">Deep analysis of focus duration, habits, and mood indexes.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-slate-300 font-medium">Last 7 Days</span>
        </div>
      </div>

      {/* Summary KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Focus (Week)</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">{totalWeeklyFocus.toFixed(1)} <span className="text-lg font-normal text-slate-400">hrs</span></h3>
          <p className="text-xs text-slate-500 mt-2">Target: 28 hours (4h/day)</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weekly Daily Average</span>
          <h3 className="text-3xl font-extrabold text-violet-400 mt-2">{(totalWeeklyFocus / 7).toFixed(1)} <span className="text-lg font-normal text-slate-400">hrs/day</span></h3>
          <p className="text-xs text-slate-500 mt-2">Focus activities only</p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Sleep Tracked</span>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">7.4 <span className="text-lg font-normal text-slate-400">hrs</span></h3>
          <p className="text-xs text-slate-500 mt-2">Based on sleep logs</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Focus Hours Timeline */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" /> Daily Focus Hours
            </h2>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="focusHours" 
                    name="Focus Hours" 
                    fill="#8b5cf6" 
                    radius={[6, 6, 0, 0]}
                  >
                    {weeklyTimeline.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === weeklyTimeline.length - 1 ? '#a78bfa' : '#6366f1'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Includes logs classified as 'Coding', 'Learning', and 'Reading'.</p>
        </div>

        {/* Activity Distribution Pie */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-400" /> Activity Distribution (Hours)
            </h2>
            <div className="h-[280px] w-full flex items-center justify-center">
              {formattedDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {formattedDist.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconSize={10} 
                      iconType="circle"
                      formatter={(value, entry) => <span className="text-xs font-semibold text-slate-400 capitalize">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 text-sm">No activity records logged.</div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Percentage breakdown based on cumulative logged minutes.</p>
        </div>

        {/* Mood & Energy Correlation */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CorrelationIcon className="w-5 h-5 text-emerald-400" /> Mood & Energy Daily Correlation
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodEnergyCorrelation} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={12}
                  domain={[1, 10]}
                  tickLine={false}
                  tickCount={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconSize={12}
                  formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="Mood" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Energy" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
