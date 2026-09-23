import React, { useState } from 'react';
import { 
  Bot, 
  Activity, 
  Battery, 
  Wifi, 
  ShieldAlert, 
  Cpu, 
  Gauge, 
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const Header: React.FC<{
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}> = ({ currentTab, onSelectTab, onToggleMobileMenu }) => {
  const {
    robotId,
    robotName,
    status,
    mode,
    userRole,
    speed,
    battery,
    health,
    sensors,
    alerts,
    triggerEmergencyStop,
    resetEmergencyStop,
    setUserRole
  } = useRobot();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Hamburger + Brand & Robot ID */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all border border-slate-700"
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          )}

          {/* Brand Logo & Name */}
          <div 
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-2 cursor-pointer group select-none min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  VISION<span className="text-cyan-400">X</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  AUTONOMOUS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate">
                <span className="truncate">{robotName}</span>
                <span className="text-slate-600 hidden xs:inline">|</span>
                <span className="text-cyan-400 hidden xs:inline">{robotId}</span>
              </p>
            </div>
          </div>

          {/* Status Indicator (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
            {mode === 'estop' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-700 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                E-STOP ACTIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ONLINE &bull; {mode.toUpperCase()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Center/Right: Live Telemetry Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-mono">
          {/* Battery Pill */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60" 
            title={`Cell voltage: ${battery.voltage}V`}
          >
            <Battery className={`w-3.5 h-3.5 ${battery.percentage < 20 ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
            <span className="font-bold text-slate-200 text-xs">{battery.percentage}%</span>
            <span className="text-slate-400 text-[10px] hidden md:inline">({battery.voltage}V)</span>
          </div>

          {/* Speed Pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-bold text-xs">{speed.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">m/s</span>
          </div>

          {/* CPU / Temp (Hidden on smaller screens) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200">{health.cpuUsage}%</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">{sensors.thermal.hotspotTempC}°C</span>
          </div>

          {/* Latency / Ping (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">{health.networkLatencyMs}ms</span>
          </div>

          {/* Alerts Counter */}
          <button
            onClick={() => onSelectTab('alerts')}
            className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border transition-colors ${
              unreadAlerts > 0
                ? 'bg-amber-950/50 border-amber-700 text-amber-300 hover:bg-amber-900/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="System Alerts"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadAlerts > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Role Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="admin" className="bg-slate-900">Admin</option>
              <option value="operator" className="bg-slate-900">Operator</option>
              <option value="viewer" className="bg-slate-900">Viewer</option>
            </select>
          </div>

          {/* Emergency Stop Button (Compact on mobile, full on desktop) */}
          {mode === 'estop' ? (
            <button
              onClick={resetEmergencyStop}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
              title="Reset Emergency Stop"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">RESET</span>
            </button>
          ) : (
            <button
              onClick={triggerEmergencyStop}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 border border-red-400"
              title="Immediate Hardware E-STOP disengagement"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>E-STOP</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
