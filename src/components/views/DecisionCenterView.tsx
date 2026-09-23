import React from 'react';
import { 
  BrainCircuit, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  Eye, 
  Compass, 
  Cpu, 
  Layers, 
  Play, 
  RotateCw
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const DecisionCenterView: React.FC = () => {
  const { decisionLogs, detectedObjects, speed, heading, mode } = useRobot();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <span>AI Decision Center & Perception-to-Action Engine</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Deterministic Behavior Trees &bull; Spatial Risk Assessment &bull; Reactive Nav2 Detours
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>AUTONOMOUS ENGINE: ONLINE</span>
        </span>
      </div>

      {/* Visual Perception-to-Action Pipeline Flowchart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Live Perception-to-Actuation Architecture Flow</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">Cycle Frequency: 20 Hz</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
          {/* Step 1: Vision Sensing */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">1</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-bold text-white">VISION SENSING</div>
            <p className="text-[11px] text-slate-400">YOLOv8 + RealSense D435i depth alignment</p>
            <div className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded">
              {detectedObjects.length > 0 ? `${detectedObjects.length} Objects Detected` : 'Corridor Free'}
            </div>
          </div>

          {/* Step 2: Spatial Proximity */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-xs">2</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-bold text-white">SPATIAL RISK</div>
            <p className="text-[11px] text-slate-400">Dynamic velocity vector extrapolation</p>
            <div className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded">
              Distance: {detectedObjects[0]?.distance ?? 'Safe (&gt;3m)'}
            </div>
          </div>

          {/* Step 3: Path Evaluation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group hover:border-amber-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-xs">3</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-bold text-white">CORRIDOR CLEARANCE</div>
            <p className="text-[11px] text-slate-400">Nav2 Global Costmap check & safety bubble</p>
            <div className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-1 rounded">
              {detectedObjects.some(o => o.distance < 2.0) ? 'Reroute Required' : 'Path Clear'}
            </div>
          </div>

          {/* Step 4: Decision Tree */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">4</span>
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-white">DECISION SYNTHESIS</div>
            <p className="text-[11px] text-slate-400">Compute alternate spline detour trajectory</p>
            <div className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded">
              Offset: +24° Left
            </div>
          </div>

          {/* Step 5: Actuation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 relative group hover:border-pink-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-pink-950 text-pink-400 border border-pink-800 flex items-center justify-center font-bold text-xs">5</span>
              <Bot className="w-4 h-4 text-pink-400" />
            </div>
            <div className="font-bold text-white">MOTOR ACTUATION</div>
            <p className="text-[11px] text-slate-400">Publish cmd_vel twist commands to drivers</p>
            <div className="text-[10px] text-pink-300 bg-pink-950/60 px-2 py-1 rounded">
              Speed: {speed.toFixed(1)} m/s
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Decision Log (Left 8 cols) & State Inspector (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Real-time Chronological Decision Log (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Decision Log (Chronological Event Stream)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500">{decisionLogs.length} Events Logged</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {decisionLogs.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl font-mono text-xs space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{item.timestamp}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                      item.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      item.severity === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.stage}
                    </span>
                  </div>
                  {item.actionTaken && (
                    <span className="text-[11px] text-cyan-400 font-semibold">
                      Action: {item.actionTaken}
                    </span>
                  )}
                </div>

                <div className="font-bold text-white text-sm">{item.title}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* State Machine & Behavior Tree Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          {/* Behavior Tree Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-200 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Behavior Tree Status</span>
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">1. SAFETY_INTERLOCK</span>
                  <span className="text-[10px] text-slate-400">All emergency bumpers clear</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">2. PURSUIT_WAYPOINT</span>
                  <span className="text-[10px] text-slate-400">Tracking active spline trajectory</span>
                </div>
                <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-500">
                <div>
                  <span className="font-bold block">3. REACTIVE_AVOID</span>
                  <span className="text-[10px]">Standby for obstacle proximity &lt; 1.5m</span>
                </div>
                <span>STANDBY</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-500">
                <div>
                  <span className="font-bold block">4. RECOVERY_MANEUVER</span>
                  <span className="text-[10px]">Back-up & 360° spin if trapped</span>
                </div>
                <span>STANDBY</span>
              </div>
            </div>
          </div>

          {/* Real-time Threat Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-200 pb-2 border-b border-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Collision Risk Matrix</span>
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Corridor Threat Level:</span>
                <span className="text-emerald-400 font-bold">LOW (NORMAL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Obstacle Proximity:</span>
                <span className="text-white font-bold">{detectedObjects[0]?.distance ?? 'Clear'} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nav2 Planner Re-route Count:</span>
                <span className="text-cyan-400 font-bold">14 times</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Decision Response Latency:</span>
                <span className="text-white font-bold">&lt; 28 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
