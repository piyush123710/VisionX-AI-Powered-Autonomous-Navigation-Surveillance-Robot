import React, { useState } from 'react';
import { 
  Eye, 
  Sparkles, 
  Sliders, 
  Layers, 
  ShieldAlert, 
  Camera, 
  Filter, 
  Maximize2,
  Cpu,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { CameraHUD } from '../common/CameraHUD';
import { VlmQueryPanel } from '../common/VlmQueryPanel';

export const AiVisionView: React.FC = () => {
  const {
    detectedObjects,
    confidenceThreshold,
    setConfidenceThreshold,
    cameraSource,
    setCameraSource,
    yoloModel,
    health
  } = useRobot();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'person' | 'vehicle' | 'obstacle' | 'chair'>('all');

  const filteredObjects = detectedObjects.filter(obj => {
    if (categoryFilter === 'all') return true;
    return obj.category === categoryFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>AI Perception & Vision-Language Studio</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            YOLOv8x Deep Neural Detection &bull; DepthNet 3D Spatial Localization &bull; Gemini VLM
          </p>
        </div>

        {/* Model Specs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-300">
            ENGINE: <strong className="text-white">TensorRT 8.6</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            LATENCY: <strong className="text-cyan-400">14.2 ms (~70 FPS)</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Live Camera HUD (Left 7 cols) & VLM + Controls (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Camera Stream & Detection Table */}
        <div className="lg:col-span-7 space-y-4">
          <CameraHUD />

          {/* Detected Objects Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Detected Entities ({filteredObjects.length})
                </h3>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {(['all', 'person', 'vehicle', 'obstacle', 'chair'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded capitalize transition-colors ${
                      categoryFilter === cat
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="pb-2">Track ID</th>
                    <th className="pb-2">Label</th>
                    <th className="pb-2">Class</th>
                    <th className="pb-2">Confidence</th>
                    <th className="pb-2">Est. Distance</th>
                    <th className="pb-2">Bearing</th>
                    <th className="pb-2">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredObjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">
                        No entities match active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredObjects.map(obj => (
                      <tr key={obj.id} className="hover:bg-slate-800/40">
                        <td className="py-2 text-cyan-400 font-bold">{obj.trackingId}</td>
                        <td className="py-2 text-slate-200">{obj.label}</td>
                        <td className="py-2 capitalize text-slate-400">{obj.category}</td>
                        <td className="py-2 text-slate-300">{(obj.confidence * 100).toFixed(1)}%</td>
                        <td className="py-2 font-bold text-white">{obj.distance} m</td>
                        <td className="py-2 text-slate-400">{obj.positionDesc}</td>
                        <td className="py-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            obj.threatLevel === 'high' ? 'bg-red-950 text-red-300 border border-red-800' :
                            obj.threatLevel === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {obj.threatLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: VLM Assistant & Model Parameters */}
        <div className="lg:col-span-5 space-y-4">
          {/* Vision-Language Model Query Panel */}
          <VlmQueryPanel />

          {/* Model Inference Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold uppercase text-slate-200">
                Inference Tuning Parameters
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Confidence Threshold</span>
                  <span className="text-cyan-400 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Active Neural Weights</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-bold text-white">{yoloModel}</div>
                  <div className="text-[10px] text-slate-500">Backbone: CSPDarknet53 &bull; Input: 640x640 FP16</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">TRACKER ALGORITHM</span>
                  <span className="font-bold text-cyan-400">ByteTrack v2</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">NMS IOU THRESHOLD</span>
                  <span className="font-bold text-white">0.45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
