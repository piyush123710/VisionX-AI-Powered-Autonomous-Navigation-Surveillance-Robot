import React, { useState } from 'react';
import { 
  ScrollText, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { Mission, Waypoint } from '../../types/robot';

export const MissionControlView: React.FC = () => {
  const { 
    activeMissions, 
    currentMission, 
    startMission, 
    pauseMission, 
    abortMission, 
    createMission 
  } = useRobot();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [missionName, setMissionName] = useState('');
  const [startPoint, setStartPoint] = useState('Zone A - Receiving Dock');
  const [destination, setDestination] = useState('Zone D - Dispatch Station');
  const [missionType, setMissionType] = useState<Mission['type']>('inspection');
  const [notes, setNotes] = useState('Inspect perimeter, avoid obstacles, report findings.');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionName.trim()) return;

    const sampleWaypoints: Waypoint[] = [
      { id: 'wp-' + Date.now() + '-1', name: startPoint, x: 20, y: 30, completed: false, type: 'patrol' },
      { id: 'wp-' + Date.now() + '-2', name: 'Corridor Checkpoint B', x: 45, y: 65, completed: false, type: 'inspection' },
      { id: 'wp-' + Date.now() + '-3', name: destination, x: 75, y: 30, completed: false, type: 'delivery' }
    ];

    createMission({
      title: missionName,
      type: missionType,
      startPoint,
      destination,
      waypoints: sampleWaypoints,
      notes
    });

    setMissionName('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <span>Mission Control & Autonomous Task Dispatcher</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Route Sequencing &bull; Task Verification &bull; Hazard Clearance Audits
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Mission</span>
        </button>
      </div>

      {/* Active Mission Spotlight Card */}
      {currentMission && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  ACTIVE MISSION &bull; ID #{currentMission.id}
                </span>
                <h2 className="text-lg font-bold text-white">{currentMission.title}</h2>
              </div>
            </div>

            {/* Mission Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {currentMission.status === 'in_progress' ? (
                <button
                  onClick={pauseMission}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Mission</span>
                </button>
              ) : (
                <button
                  onClick={() => startMission(currentMission.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Mission</span>
                </button>
              )}

              <button
                onClick={abortMission}
                className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Abort</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Mission Progress</span>
              <span className="text-cyan-400 font-bold">{currentMission.progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${currentMission.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Waypoint Stepper */}
          <div className="pt-2">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">Waypoint Execution Sequence</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 font-mono text-xs">
              {currentMission.waypoints.map((wp, idx) => {
                const isCurrent = idx === currentMission.currentWaypointIndex && currentMission.status === 'in_progress';
                return (
                  <div
                    key={wp.id}
                    className={`p-3 rounded-xl border space-y-1 ${
                      wp.completed
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md animate-pulse'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold">STEP #{idx + 1}</span>
                      {wp.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-[11px] text-white truncate">{wp.name}</div>
                    <div className="text-[10px] text-slate-400">({wp.x}, {wp.y})</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mission Queue Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold uppercase text-slate-200 pb-2 border-b border-slate-800">
          Mission Registry & Deployment Queue
        </h3>

        <div className="space-y-2">
          {activeMissions.map(m => (
            <div
              key={m.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{m.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 capitalize">
                    {m.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    m.status === 'in_progress' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    m.status === 'paused' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  From: <strong className="text-slate-200">{m.startPoint}</strong> &rarr; Destination: <strong className="text-slate-200">{m.destination}</strong> &bull; {m.waypoints.length} Waypoints
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startMission(m.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Create Autonomous Mission</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Mission Name</label>
                <input
                  type="text"
                  required
                  value={missionName}
                  onChange={e => setMissionName(e.target.value)}
                  placeholder="e.g. Warehouse Zone B Inspection"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Start Point</label>
                  <input
                    type="text"
                    value={startPoint}
                    onChange={e => setStartPoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mission Task Type</label>
                <select
                  value={missionType}
                  onChange={e => setMissionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="inspection">Inspection & Hazard Audit</option>
                  <option value="patrol">Perimeter Surveillance Patrol</option>
                  <option value="delivery">Autonomous Material Delivery</option>
                  <option value="search_rescue">Search & Rescue Reconnaissance</option>
                  <option value="mapping">SLAM Lifelong Mapping</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Start Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
