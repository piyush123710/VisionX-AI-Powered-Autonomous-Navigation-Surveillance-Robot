import React from 'react';
import { 
  Eye, 
  Compass, 
  Battery, 
  Gauge, 
  Cpu, 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Pause, 
  Square, 
  ArrowUpRight,
  BrainCircuit,
  Radio,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { CameraHUD } from '../common/CameraHUD';
import { SlamMapCanvas } from '../common/SlamMapCanvas';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    robotId,
    robotName,
    status,
    mode,
    speed,
    maxSpeed,
    heading,
    battery,
    health,
    sensors,
    detectedObjects,
    decisionLogs,
    currentMission,
    startMission,
    pauseMission,
    abortMission,
    setMode,
    triggerEmergencyStop
  } = useRobot();

  const recentDecisions = decisionLogs.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4 font-sans">
      {/* Top Telemetry & Mission Quick Status Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        {/* Robot identity & Mission */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
            {robotId}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">{robotName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                ● AUTONOMOUS RUNNING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Mission: <span className="text-cyan-300 font-medium">{currentMission?.title || 'Area Patrol'}</span>
              {currentMission && ` (${currentMission.progress}% done)`}
            </p>
          </div>
        </div>

        {/* Real-time KPI Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Battery */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">BATTERY</span>
              <span className="font-bold text-slate-200">{battery.percentage}%</span>
            </div>
          </div>

          {/* Speed */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">SPEED</span>
              <span className="font-bold text-slate-200">{speed.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">m/s</span></span>
            </div>
          </div>

          {/* SoC Temp */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">THERMAL</span>
              <span className="font-bold text-slate-200">{sensors.thermal.hotspotTempC}°C</span>
            </div>
          </div>

          {/* CPU */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg hidden md:flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">CPU / GPU</span>
              <span className="font-bold text-slate-200">{health.cpuUsage}% / {health.gpuUsage}%</span>
            </div>
          </div>
        </div>

        {/* Quick Mode & Mission Actions */}
        <div className="flex items-center gap-2">
          {currentMission?.status === 'in_progress' ? (
            <button
              onClick={pauseMission}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => currentMission && startMission(currentMission.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('control')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Teleoperation</span>
          </button>
        </div>
      </div>

      {/* Main Dual Grid: Camera Feed (Left) & SLAM Navigation Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Camera HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-slate-200 font-bold">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>FRONT INTEL REALSENSE CAMERA &bull; YOLO HUD</span>
            </span>
            <button
              onClick={() => onNavigate('vision')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Vision Studio</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <CameraHUD />
        </div>

        {/* Right: SLAM 2D Map (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-slate-200 font-bold">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>DIGITAL SLAM OCCUPANCY MAP</span>
            </span>
            <button
              onClick={() => onNavigate('navigation')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Navigation</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <SlamMapCanvas interactive={true} />
        </div>
      </div>

      {/* Bottom Section: AI Detections Feed (Left) + Real-time AI Decision Ticker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* AI Detection Feed (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Active Perception & Bounding Boxes
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {detectedObjects.length} Entities in FOV
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {detectedObjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No critical obstacles detected in immediate path.
              </div>
            ) : (
              detectedObjects.map(obj => (
                <div
                  key={obj.id}
                  className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs font-mono transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      obj.threatLevel === 'high' ? 'bg-red-500 animate-ping' : obj.threatLevel === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}></span>
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{obj.label}</span>
                        <span className="text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                          {obj.trackingId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Confidence: {(obj.confidence * 100).toFixed(1)}% &bull; Category: {obj.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-white font-bold text-sm block">{obj.distance} m</span>
                    <span className="text-[10px] text-slate-400">Bearing: {obj.positionDesc}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time AI Decision Ticker (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                Autonomous Decision Engine Log
              </h3>
            </div>
            <button
              onClick={() => onNavigate('decision')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Decision Center</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {recentDecisions.map(item => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-lg text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                      item.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      item.severity === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.stage.toUpperCase()}
                    </span>
                  </div>
                  {item.actionTaken && (
                    <span className="text-[10px] text-cyan-400 truncate max-w-[160px]">
                      &rarr; {item.actionTaken}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-200 text-[11px]">{item.title}</div>
                <div className="text-[10px] text-slate-400">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
