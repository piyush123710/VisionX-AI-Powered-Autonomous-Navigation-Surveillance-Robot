import React, { useEffect, useState } from 'react';
import { 
  Gamepad2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Octagon, 
  RotateCcw, 
  Gauge, 
  Sliders, 
  Bot, 
  ShieldAlert, 
  SlidersHorizontal,
  Camera,
  Layers
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { CameraHUD } from '../common/CameraHUD';

export const RobotControlView: React.FC = () => {
  const {
    mode,
    setMode,
    speed,
    maxSpeed,
    setMaxSpeed,
    driveManual,
    triggerEmergencyStop,
    resetEmergencyStop,
    gimbalPan,
    gimbalTilt,
    setGimbal,
    heading,
    sensors
  } = useRobot();

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Keyboard WASD listeners for teleoperation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      setActiveKey(key);

      if (key === 'w') driveManual(1.0, 0);
      else if (key === 's') driveManual(-0.8, 0);
      else if (key === 'a') driveManual(0, -1.0);
      else if (key === 'd') driveManual(0, 1.0);
      else if (key === ' ') {
        e.preventDefault();
        driveManual(0, 0);
      } else if (key === 'e') {
        triggerEmergencyStop();
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
      if (mode === 'manual') {
        driveManual(0, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [driveManual, triggerEmergencyStop, mode]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>Robot Teleoperation & Drive Console</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Low-Latency Manual Teleop &bull; Keyboard WASD &bull; PTZ Camera Gimbal &bull; Motor Encoders
          </p>
        </div>

        {/* Big Mode Switcher Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('autonomous')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              mode === 'autonomous'
                ? 'bg-emerald-600 text-white border-2 border-emerald-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            ● AUTONOMOUS
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              mode === 'manual'
                ? 'bg-cyan-600 text-white border-2 border-cyan-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            ● MANUAL TELEOP
          </button>

          {mode === 'estop' ? (
            <button
              onClick={resetEmergencyStop}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-400 animate-pulse transition-all shadow-lg shadow-emerald-600/30"
            >
              RESET E-STOP
            </button>
          ) : (
            <button
              onClick={triggerEmergencyStop}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white border-2 border-red-400 transition-all shadow-lg shadow-red-600/30"
            >
              EMERGENCY STOP
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Live Visual Feed (Left 7 cols) & D-pad / Joystick / Motor controls (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Driving View Camera HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <CameraHUD compact={false} />

          {/* 4-Wheel Motor Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">FRONT-LEFT MOTOR</span>
              <span className="font-bold text-cyan-400">{sensors.encoders.speedLeftMps.toFixed(2)} m/s</span>
              <span className="text-[10px] text-slate-400 block">180 RPM &bull; 1.4 Nm</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">FRONT-RIGHT MOTOR</span>
              <span className="font-bold text-cyan-400">{sensors.encoders.speedRightMps.toFixed(2)} m/s</span>
              <span className="text-[10px] text-slate-400 block">182 RPM &bull; 1.4 Nm</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">REAR-LEFT MOTOR</span>
              <span className="font-bold text-slate-300">{sensors.encoders.speedLeftMps.toFixed(2)} m/s</span>
              <span className="text-[10px] text-slate-400 block">180 RPM &bull; 1.3 Nm</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">REAR-RIGHT MOTOR</span>
              <span className="font-bold text-slate-300">{sensors.encoders.speedRightMps.toFixed(2)} m/s</span>
              <span className="text-[10px] text-slate-400 block">181 RPM &bull; 1.3 Nm</span>
            </div>
          </div>
        </div>

        {/* Teleop Control Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* Virtual D-Pad Controller */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-xs uppercase text-slate-200">
                Directional Drive Control
              </span>
              <span className="text-[10px] text-slate-400">WASD Hotkeys Active</span>
            </div>

            {/* D-Pad Buttons */}
            <div className="flex flex-col items-center gap-2 my-2 select-none touch-manipulation">
              {/* Forward */}
              <button
                onMouseDown={() => driveManual(1.0, 0)}
                onMouseUp={() => driveManual(0, 0)}
                onTouchStart={() => driveManual(1.0, 0)}
                onTouchEnd={() => driveManual(0, 0)}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all shadow-lg touch-manipulation ${
                  activeKey === 'w'
                    ? 'bg-cyan-500 text-black scale-95 shadow-cyan-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
                <span className="text-[10px]">W</span>
              </button>

              {/* Middle Row: Left, Stop, Right */}
              <div className="flex items-center gap-2 touch-manipulation">
                <button
                  onMouseDown={() => driveManual(0, -1.0)}
                  onMouseUp={() => driveManual(0, 0)}
                  onTouchStart={() => driveManual(0, -1.0)}
                  onTouchEnd={() => driveManual(0, 0)}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all shadow-lg touch-manipulation ${
                    activeKey === 'a'
                      ? 'bg-cyan-500 text-black scale-95 shadow-cyan-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-[10px]">A</span>
                </button>

                {/* STOP */}
                <button
                  onClick={() => driveManual(0, 0)}
                  className="w-14 h-14 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 flex flex-col items-center justify-center font-bold text-xs shadow-lg active:scale-95 transition-all touch-manipulation"
                  title="Brake / Stop"
                >
                  <Octagon className="w-5 h-5 text-red-400" />
                  <span className="text-[9px]">STOP</span>
                </button>

                <button
                  onMouseDown={() => driveManual(0, 1.0)}
                  onMouseUp={() => driveManual(0, 0)}
                  onTouchStart={() => driveManual(0, 1.0)}
                  onTouchEnd={() => driveManual(0, 0)}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all shadow-lg touch-manipulation ${
                    activeKey === 'd'
                      ? 'bg-cyan-500 text-black scale-95 shadow-cyan-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                  <span className="text-[10px]">D</span>
                </button>
              </div>

              {/* Backward */}
              <button
                onMouseDown={() => driveManual(-0.8, 0)}
                onMouseUp={() => driveManual(0, 0)}
                onTouchStart={() => driveManual(-0.8, 0)}
                onTouchEnd={() => driveManual(0, 0)}
                className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm transition-all shadow-lg touch-manipulation ${
                  activeKey === 's'
                    ? 'bg-cyan-500 text-black scale-95 shadow-cyan-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <ArrowDown className="w-5 h-5" />
                <span className="text-[10px]">S</span>
              </button>
            </div>
          </div>

          {/* Speed Governor Slider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Speed Governor Limit</span>
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.2 m/s (Crawl)</span>
              <span>1.5 m/s (Nominal)</span>
              <span>2.5 m/s (Sprint)</span>
            </div>
          </div>

          {/* PTZ Head Camera Gimbal */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-800">
              <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>PTZ Camera Gimbal Position</span>
              </span>
              <button
                onClick={() => setGimbal(0, -5)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Recenter
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pan Angle (Yaw)</span>
                  <span className="text-white font-bold">{gimbalPan}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="5"
                  value={gimbalPan}
                  onChange={e => setGimbal(parseInt(e.target.value), gimbalTilt)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Tilt Angle (Pitch)</span>
                  <span className="text-white font-bold">{gimbalTilt}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="5"
                  value={gimbalTilt}
                  onChange={e => setGimbal(gimbalPan, parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
