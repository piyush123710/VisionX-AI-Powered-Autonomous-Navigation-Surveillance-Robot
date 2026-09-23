import React from 'react';
import { 
  ActivitySquare, 
  Cpu, 
  Battery, 
  Flame, 
  Wifi, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Server
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

export const SystemHealthView: React.FC = () => {
  const { health, battery, sensors } = useRobot();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ActivitySquare className="w-5 h-5 text-indigo-400" />
            <span>Robot Health & System Hardware Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Jetson Orin Compute Cluster &bull; Battery BMS Balancing &bull; ROS 2 DDS Node Matrix
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ALL HARDWARE SUBSYSTEMS HEALTHY</span>
        </span>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">CPU LOAD</span>
          <span className="text-white font-bold text-xl">{health.cpuUsage}%</span>
          <span className="text-slate-500 text-[10px] block">8 Cores Active</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">GPU COMPUTE</span>
          <span className="text-cyan-400 font-bold text-xl">{health.gpuUsage}%</span>
          <span className="text-slate-500 text-[10px] block">Ampere 1024 Cores</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">SYSTEM RAM</span>
          <span className="text-indigo-400 font-bold text-xl">{health.ramUsedGb} / {health.ramTotalGb} GB</span>
          <span className="text-slate-500 text-[10px] block">LPDDR5 Unified</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">SoC TEMPERATURE</span>
          <span className="text-amber-400 font-bold text-xl">{health.socTempC}°C</span>
          <span className="text-slate-500 text-[10px] block">Active Fan @ 45%</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">BATTERY SOC</span>
          <span className="text-emerald-400 font-bold text-xl">{battery.percentage}%</span>
          <span className="text-slate-500 text-[10px] block">{battery.voltage}V LiFePO4</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block">EDGE LATENCY</span>
          <span className="text-blue-400 font-bold text-xl">{health.networkLatencyMs} ms</span>
          <span className="text-slate-500 text-[10px] block">Signal: {health.wifiSignalDbm} dBm</span>
        </div>
      </div>

      {/* Grid: CPU Cores & GPU (Left 6 cols) & Battery BMS (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CPU Cores & Compute Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Multi-Core CPU Distribution (ARM Cortex-A78AE)</span>
            </span>
            <span className="text-[10px] text-slate-400">8 Cores</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {health.cpuCores.map((load, i) => (
              <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">CORE #{i + 1}</span>
                <span className="text-white font-bold">{load}%</span>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${load > 80 ? 'bg-red-500' : load > 60 ? 'bg-amber-400' : 'bg-cyan-500'}`}
                    style={{ width: `${load}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TENSORRT NPU ENGINE</span>
              <span className="text-cyan-400 font-bold">275 TOPS (Dense)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Dual DLA Engines Active</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">NVME STORAGE USAGE</span>
              <span className="text-white font-bold">142 GB / 512 GB</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">High-Speed Logs & Rosbags</span>
            </div>
          </div>
        </div>

        {/* Battery BMS Pack & Cell Balancing (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>Smart Battery Management System (BMS)</span>
            </span>
            <span className="text-[10px] text-emerald-400">Health: {battery.health}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {battery.cells.map((cellV, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">CELL #{idx + 1}</span>
                <span className="text-white font-bold">{cellV.toFixed(2)} V</span>
                <span className="text-[9px] text-emerald-400 block">Balanced (0.01V)</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CURRENT DRAW</span>
              <span className="text-amber-400 font-bold">{battery.currentAmps} A</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">REMAINING RUNTIME</span>
              <span className="text-white font-bold">{Math.floor(battery.timeRemainingMinutes / 60)}h {battery.timeRemainingMinutes % 60}m</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">PACK TEMP</span>
              <span className="text-slate-200 font-bold">{battery.tempC}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROS 2 Node Health Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
        <h3 className="font-bold uppercase text-slate-200 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>ROS 2 DDS Node Lifecycle Registry (Domain ID: {health.rosDomainId})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {health.activeNodes.map((node, i) => (
            <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-cyan-300 font-bold block">{node.name}</span>
                <span className="text-[10px] text-slate-500">Publish Rate: {node.rateHz} Hz</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
