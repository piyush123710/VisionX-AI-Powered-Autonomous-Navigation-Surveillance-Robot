import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Plus, 
  Trash2, 
  Send, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  Circle,
  Navigation
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { SlamMapCanvas } from '../common/SlamMapCanvas';

export const NavigationMapView: React.FC = () => {
  const {
    position,
    heading,
    speed,
    targetPosition,
    setTargetPosition,
    currentMission,
    restrictedZones,
    collisionBufferDistance,
    setCollisionBufferDistance,
    addWaypoint,
    removeWaypoint
  } = useRobot();

  const [newWpName, setNewWpName] = useState('');
  const [newWpX, setNewWpX] = useState(50);
  const [newWpY, setNewWpY] = useState(50);

  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpName.trim()) return;
    addWaypoint(newWpName.trim(), Number(newWpX), Number(newWpY));
    setNewWpName('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Autonomous SLAM & Nav2 Trajectory Map</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Simultaneous Localization and Mapping (SLAM Toolbox) &bull; Costmaps &bull; Path Splining
          </p>
        </div>

        {/* Current Coordinates Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            POSE: <strong className="text-cyan-400">X: {position.x.toFixed(1)}m, Y: {position.y.toFixed(1)}m</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            HEADING: <strong className="text-white">{heading.toFixed(0)}°</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas Map (Left 8 cols) & Waypoint Manager (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Map Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <SlamMapCanvas interactive={true} className="min-h-[460px]" />

          {/* SLAM Algorithm & Localization Health Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">MAPPING ENGINE</span>
              <span className="font-bold text-emerald-400">slam_toolbox</span>
              <span className="text-[10px] text-slate-400 block">Lifelong SLAM Mode</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RESOLUTION</span>
              <span className="font-bold text-white">0.05 m / pixel</span>
              <span className="text-[10px] text-slate-400 block">Grid: 100m x 80m</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PARTICLE SAMPLES</span>
              <span className="font-bold text-cyan-400">450 Particles</span>
              <span className="text-[10px] text-slate-400 block">Covariance: 0.012 m²</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LOOP CLOSURES</span>
              <span className="font-bold text-indigo-400">12 Verified</span>
              <span className="text-[10px] text-slate-400 block">Drift error: &lt; 0.8%</span>
            </div>
          </div>
        </div>

        {/* Waypoints & Zone Management (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Waypoint Controller */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Active Mission Waypoints
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {currentMission?.waypoints.length || 0} Targets
              </span>
            </div>

            {/* Waypoint List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {currentMission?.waypoints.map((wp, i) => {
                const isTarget = targetPosition && Math.hypot(targetPosition.x - wp.x, targetPosition.y - wp.y) < 1.0;
                return (
                  <div
                    key={wp.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                      isTarget
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md'
                        : wp.completed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                        : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {wp.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isTarget ? (
                        <Navigation className="w-4 h-4 text-cyan-400 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-[11px]">{wp.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Coords: ({wp.x}, {wp.y}) &bull; Type: {wp.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setTargetPosition({ x: wp.x, y: wp.y })}
                        className="p-1.5 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition-colors"
                        title="Dispatch robot here"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeWaypoint(wp.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors"
                        title="Delete waypoint"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Waypoint Form */}
            <form onSubmit={handleAddWaypoint} className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Add New Waypoint
              </span>
              <input
                type="text"
                value={newWpName}
                onChange={e => setNewWpName(e.target.value)}
                placeholder="Waypoint Name (e.g. Rack C-02)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={newWpX}
                  onChange={e => setNewWpX(Number(e.target.value))}
                  placeholder="X (m)"
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={newWpY}
                  onChange={e => setNewWpY(Number(e.target.value))}
                  placeholder="Y (m)"
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Waypoint</span>
              </button>
            </form>
          </div>

          {/* Safety Clearance & Obstacle Buffer Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold uppercase text-slate-200">
                Safety Clearance Buffer
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Obstacle Radius Threshold</span>
                <span className="text-cyan-400 font-bold">{collisionBufferDistance.toFixed(2)} meters</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.05"
                value={collisionBufferDistance}
                onChange={e => setCollisionBufferDistance(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                Specifies the minimum ISO 3691-4 personal clearance boundary maintained around dynamic personnel and static obstacles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
