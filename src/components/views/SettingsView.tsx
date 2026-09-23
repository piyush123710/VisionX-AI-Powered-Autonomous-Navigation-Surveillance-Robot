import React, { useState } from 'react';
import { 
  Settings, 
  Bot, 
  Cpu, 
  Radio, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const SettingsView: React.FC = () => {
  const {
    robotName,
    setRobotName,
    maxSpeed,
    setMaxSpeed,
    collisionBufferDistance,
    setCollisionBufferDistance,
    confidenceThreshold,
    setConfidenceThreshold,
    yoloModel
  } = useRobot();

  const [saved, setSaved] = useState(false);
  const [rosBridgeUri, setRosBridgeUri] = useState('ws://localhost:9090');
  const [cameraResolution, setCameraResolution] = useState('1080p');
  const [trackerMode, setTrackerMode] = useState('ByteTrack v2 (Fast)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Platform Configuration & Parameter Server</span>
          </h1>
          <p className="text-xs text-slate-400">
            Hardware limits &bull; Computer vision thresholds &bull; ROS 2 Bridge
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Parameters Synced to Flash Memory</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Robot Chassis & Safety Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-xs uppercase text-slate-200">Robot Mechanical & Kinematics</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Robot Display Identifier</label>
              <input
                type="text"
                value={robotName}
                onChange={e => setRobotName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Maximum Forward Velocity</span>
                <span className="text-cyan-400 font-bold">{maxSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={maxSpeed}
                onChange={e => setMaxSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Obstacle Clearance Safety Buffer</span>
                <span className="text-amber-400 font-bold">{collisionBufferDistance.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.05"
                value={collisionBufferDistance}
                onChange={e => setCollisionBufferDistance(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* AI & Vision Inference Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-xs uppercase text-slate-200">Deep Learning Vision & Inference</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Active Neural Weights</label>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <div className="font-bold text-white">{yoloModel}</div>
                <div className="text-[10px] text-slate-500">TensorRT Engine &bull; FP16 Optimized</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Confidence Acceptance Cutoff</span>
                <span className="text-indigo-400 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Object Tracking Algorithm</label>
              <select
                value={trackerMode}
                onChange={e => setTrackerMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ByteTrack v2 (Fast)">ByteTrack v2 (Recommended &bull; 70 FPS)</option>
                <option value="DeepSORT (Appearance Embedding)">DeepSORT (High Persistence)</option>
                <option value="BoT-SORT (Camera Motion Compensation)">BoT-SORT (Gimbal Optimized)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ROS 2 Bridge & Network Settings */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl lg:col-span-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-xs uppercase text-slate-200">ROS 2 rosbridge_suite & DDS Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">rosbridge WebSocket URI</label>
              <input
                type="text"
                value={rosBridgeUri}
                onChange={e => setRosBridgeUri(e.target.value)}
                placeholder="ws://localhost:9090"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Connects to physical robot via standard rosbridge_websocket node
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Camera Stream Quality</label>
              <select
                value={cameraResolution}
                onChange={e => setCameraResolution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="1080p">1080p Full HD (1920x1080 @ 30 FPS)</option>
                <option value="720p">720p HD (1280x720 @ 60 FPS &bull; Low Latency)</option>
                <option value="480p">480p SD (640x480 &bull; Low Bandwidth)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
