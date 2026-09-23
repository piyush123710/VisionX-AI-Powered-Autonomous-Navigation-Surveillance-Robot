import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  MapPin, 
  Clock, 
  Gauge, 
  Compass, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { SlamMapCanvas } from '../common/SlamMapCanvas';

export const MissionReplayView: React.FC = () => {
  const { pathTrail, position } = useRobot();
  const [selectedMission, setSelectedMission] = useState('m-1024');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [playbackProgress, setPlaybackProgress] = useState(45); // percentage 0 - 100

  // Playback loop
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const pastMissions = [
    {
      id: 'm-1024',
      title: 'Warehouse Zone Inspection & Hazard Audit',
      date: '23 Sept 2026',
      duration: '12:43',
      distance: '840m',
      status: 'Completed',
      obstacles: 14
    },
    {
      id: 'm-1023',
      title: 'Conveyor Perimeter Security Sweep',
      date: '22 Sept 2026',
      duration: '08:15',
      distance: '520m',
      status: 'Completed',
      obstacles: 6
    },
    {
      id: 'm-1022',
      title: 'Automated SLAM Lifelong Mapping Run #1',
      date: '21 Sept 2026',
      duration: '24:10',
      distance: '1,420m',
      status: 'Completed',
      obstacles: 22
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Mission Telemetry & Trajectory Replay</span>
          </h1>
          <p className="text-xs text-slate-400">
            Synchronized Rosbag Playback &bull; Historical Sensor Frames &bull; Obstacle Event Timeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Select Session:</span>
          <select
            value={selectedMission}
            onChange={e => setSelectedMission(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none"
          >
            {pastMissions.map(m => (
              <option key={m.id} value={m.id}>
                #{m.id} &bull; {m.title} ({m.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Replay Map (Left 8 cols) & Mission Metadata (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Replay Viewport & Timeline Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <SlamMapCanvas interactive={false} />

          {/* Timeline & Player Deck */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            {/* Scrubber Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Timeline: {Math.floor((playbackProgress / 100) * 12)}:{Math.floor(((playbackProgress / 100) * 43) % 60).toString().padStart(2, '0')}</span>
                <span className="text-cyan-400 font-bold">{playbackProgress}% (Total: 12:43)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={e => setPlaybackProgress(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
                </button>

                <button
                  onClick={() => setPlaybackProgress(0)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed multiplier */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {([1, 2, 4] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      playbackSpeed === s ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission Details & Historic Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-200 pb-2 border-b border-slate-800">
              Recorded Mission Snapshot
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Mission ID:</span>
                <span className="text-cyan-400 font-bold">#1024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Execution Date:</span>
                <span className="text-white font-bold">23 Sept 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Duration:</span>
                <span className="text-white font-bold">12 mins 43 secs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Distance:</span>
                <span className="text-emerald-400 font-bold">840 meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Obstacles Evaded:</span>
                <span className="text-amber-400 font-bold">14 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Result:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mission Completed
                </span>
              </div>
            </div>
          </div>

          {/* Past Missions Archive List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-200 pb-2 border-b border-slate-800">
              Recent Recording Archive
            </h3>

            <div className="space-y-2">
              {pastMissions.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMission(m.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMission === m.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">{m.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>{m.date} &bull; {m.duration}</span>
                    <span className="text-emerald-400">{m.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
