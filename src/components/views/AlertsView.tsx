import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Filter,
  Search
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, clearAllAlerts } = useRobot();
  const [levelFilter, setLevelFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(a => {
    if (levelFilter !== 'all' && a.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    }
    return true;
  });

  const exportAlerts = () => {
    const jsonStr = JSON.stringify(alerts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visionx-alerts-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Alerts, Incidents & Safety Events Log</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Safety interlocks &bull; Obstacle proximity alarms &bull; Battery thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAlerts}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={clearAllAlerts}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/70 border border-slate-800 hover:border-red-800 text-xs font-mono text-red-300 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'critical', 'warning', 'info'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                levelFilter === lvl
                  ? lvl === 'critical' ? 'bg-red-600 text-white font-bold' :
                    lvl === 'warning' ? 'bg-amber-600 text-black font-bold' :
                    lvl === 'info' ? 'bg-blue-600 text-white font-bold' :
                    'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-500">
            No events match current filter criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border font-mono text-xs transition-all flex flex-wrap items-start justify-between gap-3 ${
                alert.level === 'critical'
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : alert.level === 'warning'
                  ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alert.level === 'critical' ? (
                    <AlertCircle className="w-5 h-5 text-red-400 animate-bounce" />
                  ) : alert.level === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Info className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{alert.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.category}
                    </span>
                    <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{alert.message}</p>
                </div>
              </div>

              <div>
                {alert.acknowledged ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
