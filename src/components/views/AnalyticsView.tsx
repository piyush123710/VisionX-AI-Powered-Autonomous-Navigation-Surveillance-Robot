import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Users, 
  BatteryCharging, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const AnalyticsView: React.FC = () => {
  const { sensors, battery } = useRobot();

  const distanceData = [
    { day: 'Mon', km: 3.4 },
    { day: 'Tue', km: 4.8 },
    { day: 'Wed', km: 5.2 },
    { day: 'Thu', km: 4.1 },
    { day: 'Fri', km: 6.3 },
    { day: 'Sat', km: 4.9 },
    { day: 'Sun', km: 5.7 }
  ];

  const hourlyDetections = [
    { hour: '08:00', people: 12, obstacles: 18 },
    { hour: '10:00', people: 24, obstacles: 32 },
    { hour: '12:00', people: 31, obstacles: 28 },
    { hour: '14:00', people: 27, obstacles: 42 },
    { hour: '16:00', people: 19, obstacles: 35 },
    { hour: '18:00', people: 8, obstacles: 14 }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Autonomous Fleet Analytics & Historical Metrics</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Navigation Reliability &bull; Obstacle Encounter Densities &bull; Energy Efficiency
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs">
          REPORTING PERIOD: LAST 7 DAYS
        </span>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">TOTAL DISTANCE</span>
          <span className="text-white font-bold text-xl">34.4 km</span>
          <span className="text-emerald-400 text-[10px] block">+14% vs last week</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">COMPLETED MISSIONS</span>
          <span className="text-emerald-400 font-bold text-xl">18 / 19</span>
          <span className="text-slate-500 text-[10px] block">94.7% Success Rate</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">OBSTACLES AVOIDED</span>
          <span className="text-amber-400 font-bold text-xl">42</span>
          <span className="text-slate-500 text-[10px] block">0 Collisions</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">HUMANS DETECTED</span>
          <span className="text-cyan-400 font-bold text-xl">27</span>
          <span className="text-slate-500 text-[10px] block">Safety Bubble 100%</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">AVG CRUISE SPEED</span>
          <span className="text-indigo-400 font-bold text-xl">1.24 m/s</span>
          <span className="text-slate-500 text-[10px] block">Nominal Speed</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">ENERGY EFFICIENCY</span>
          <span className="text-emerald-400 font-bold text-xl">18.2 Wh/km</span>
          <span className="text-slate-500 text-[10px] block">Optimized A* Path</span>
        </div>
      </div>

      {/* Grid: Distance Bar Chart (Left 6 cols) & Obstacle Density (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Distance Travelled Chart */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Daily Distance Travelled (km)</span>
            </span>
            <span className="text-[10px] text-slate-400">Total: 34.4 km</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {distanceData.map(d => {
              const heightPct = (d.km / 7.0) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-cyan-300">{d.km}</span>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-md hover:brightness-125 transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Obstacle & Human Detections */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Hourly Detection Volume (Personnel vs Obstacles)</span>
            </span>
            <span className="text-[10px] text-slate-400">Peak at 14:00</span>
          </div>

          <div className="space-y-3">
            {hourlyDetections.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{h.hour}</span>
                  <span className="text-slate-300">
                    <span className="text-cyan-400 font-bold">{h.people} Humans</span> &bull;{' '}
                    <span className="text-amber-400 font-bold">{h.obstacles} Obstacles</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex gap-0.5">
                  <div className="bg-cyan-500 h-full" style={{ width: `${(h.people / 50) * 100}%` }}></div>
                  <div className="bg-amber-500 h-full" style={{ width: `${(h.obstacles / 50) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
