import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  Maximize2, 
  Eye, 
  Layers, 
  Flame, 
  Sparkles, 
  Video, 
  AlertCircle,
  Crosshair,
  Volume2
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';

interface CameraHUDProps {
  compact?: boolean;
  className?: string;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({ compact = false, className = '' }) => {
  const {
    detectedObjects,
    cameraSource,
    setCameraSource,
    cameraFps,
    yoloModel,
    speed,
    heading,
    gimbalPan,
    gimbalTilt,
    sensors
  } = useRobot();

  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAiOverlayActive, setIsAiOverlayActive] = useState(true);

  // Webcam activation handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraSource === 'webcam') {
      navigator.mediaDevices?.getUserMedia({ video: { width: 1280, height: 720 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setWebcamActive(true);
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn('Webcam permission denied or not available:', err);
          setWebcamError('Webcam unavailable. Falling back to synthetic warehouse camera.');
          setWebcamActive(false);
          setCameraSource('simulation');
        });
    } else {
      setWebcamActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraSource, setCameraSource]);

  // Synthetic 3D Warehouse Simulation Render Loop
  useEffect(() => {
    if (cameraSource === 'webcam') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Ceiling & Background (Industrial Warehouse)
      const horizonY = h * 0.45 + (gimbalTilt * 1.5);
      
      if (cameraSource === 'thermal') {
        // Thermal FLIR color palette (dark violet to orange/white)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#10001e');
        bgGrad.addColorStop(0.5, '#2e0854');
        bgGrad.addColorStop(1, '#050010');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (cameraSource === 'depth') {
        // Depth gradient (near is hot red/yellow, far is deep blue/purple)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Realistic RGB Warehouse
        const bgGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(1, '#141c2c');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, horizonY);
      }

      // Warehouse Steel Beams & High Bay Lights
      ctx.strokeStyle = cameraSource === 'thermal' ? 'rgba(255, 120, 0, 0.3)' : 'rgba(100, 140, 200, 0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const lx = (w / 6) * i + ((tick * 0.2) % 30);
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, horizonY * 0.4);
        ctx.stroke();

        // High bay lights
        ctx.fillStyle = cameraSource === 'thermal' ? '#ff9900' : '#e0f2fe';
        ctx.beginPath();
        ctx.arc(lx, horizonY * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Concrete Floor with Perspective Grid Lines
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      if (cameraSource === 'thermal') {
        floorGrad.addColorStop(0, '#1a0033');
        floorGrad.addColorStop(1, '#4a0066');
      } else if (cameraSource === 'depth') {
        floorGrad.addColorStop(0, '#1e1b4b');
        floorGrad.addColorStop(1, '#3b82f6');
      } else {
        floorGrad.addColorStop(0, '#0c1322');
        floorGrad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Perspective floor lines moving when robot drives
      const floorSpeedOffset = (tick * speed * 2) % 40;
      ctx.strokeStyle = cameraSource === 'thermal' 
        ? 'rgba(255, 100, 0, 0.25)' 
        : cameraSource === 'depth' 
        ? 'rgba(96, 165, 250, 0.3)' 
        : 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;

      // Horizontal floor lines
      for (let y = horizonY + 10; y < h; y += Math.pow((y - horizonY) * 0.18, 1.4) + 6) {
        const animatedY = y + floorSpeedOffset * ((y - horizonY) / h);
        if (animatedY < h) {
          ctx.beginPath();
          ctx.moveTo(0, animatedY);
          ctx.lineTo(w, animatedY);
          ctx.stroke();
        }
      }

      // Vanishing perspective rays from center horizon
      const centerX = w / 2 + (gimbalPan * 2.5);
      for (let angle = -60; angle <= 60; angle += 15) {
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(centerX + Math.tan(rad) * (h - horizonY) * 2, h);
        ctx.stroke();
      }

      // 3. Storage Racks on Left & Right aisles
      // Left Racks
      ctx.fillStyle = cameraSource === 'thermal' ? '#5a007a' : '#1e293b';
      ctx.fillRect(0, horizonY - 40, w * 0.18, h - horizonY + 40);
      ctx.strokeStyle = cameraSource === 'thermal' ? '#ffaa00' : '#475569';
      ctx.strokeRect(0, horizonY - 40, w * 0.18, h - horizonY + 40);

      // Right Racks
      ctx.fillStyle = cameraSource === 'thermal' ? '#5a007a' : '#1e293b';
      ctx.fillRect(w * 0.82, horizonY - 40, w * 0.18, h - horizonY + 40);
      ctx.strokeStyle = cameraSource === 'thermal' ? '#ffaa00' : '#475569';
      ctx.strokeRect(w * 0.82, horizonY - 40, w * 0.18, h - horizonY + 40);

      // Yellow safety aisle boundary stripe
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(w * 0.22, h);
      ctx.lineTo(centerX - 40, horizonY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.78, h);
      ctx.lineTo(centerX + 40, horizonY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Render Detected Entities 3D Visuals
      detectedObjects.forEach(obj => {
        const objScreenX = (obj.bbox.x / 100) * w;
        const objScreenY = (obj.bbox.y / 100) * h;
        const objW = (obj.bbox.width / 100) * w;
        const objH = (obj.bbox.height / 100) * h;

        if (cameraSource === 'thermal') {
          // Human is hot bright yellow/white, vehicle is orange
          const hotGrad = ctx.createRadialGradient(
            objScreenX + objW / 2, objScreenY + objH / 2, 5,
            objScreenX + objW / 2, objScreenY + objH / 2, objW
          );
          hotGrad.addColorStop(0, obj.category === 'person' ? '#ffffff' : '#ff9900');
          hotGrad.addColorStop(0.6, obj.category === 'person' ? '#ff4400' : '#cc2200');
          hotGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = hotGrad;
          ctx.fillRect(objScreenX - 5, objScreenY - 5, objW + 10, objH + 10);
        } else if (cameraSource === 'depth') {
          // Color based on distance (0m = Red, 2m = Yellow, 4m = Green, 8m+ = Blue)
          const distNorm = Math.min(1, Math.max(0, obj.distance / 6));
          const r = Math.floor((1 - distNorm) * 255);
          const g = Math.floor(distNorm < 0.5 ? distNorm * 2 * 255 : (1 - (distNorm - 0.5) * 2) * 255);
          const b = Math.floor(distNorm * 255);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
          ctx.fillRect(objScreenX, objScreenY, objW, objH);
        } else {
          // Realistic silhouette
          if (obj.category === 'person') {
            // Stylized worker silhouette with safety vest
            ctx.fillStyle = '#0f172a';
            // Head
            ctx.beginPath();
            ctx.arc(objScreenX + objW / 2, objScreenY + objH * 0.18, objW * 0.22, 0, Math.PI * 2);
            ctx.fill();
            // High-vis yellow safety vest
            ctx.fillStyle = '#facc15';
            ctx.fillRect(objScreenX + objW * 0.2, objScreenY + objH * 0.35, objW * 0.6, objH * 0.35);
            // Reflective silver stripe
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(objScreenX + objW * 0.2, objScreenY + objH * 0.48, objW * 0.6, objH * 0.08);
            // Trousers
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(objScreenX + objW * 0.25, objScreenY + objH * 0.7, objW * 0.22, objH * 0.28);
            ctx.fillRect(objScreenX + objW * 0.53, objScreenY + objH * 0.7, objW * 0.22, objH * 0.28);
          } else if (obj.category === 'vehicle') {
            // Automated forklift
            ctx.fillStyle = '#eab308';
            ctx.fillRect(objScreenX + objW * 0.1, objScreenY + objH * 0.4, objW * 0.8, objH * 0.5);
            // Mast & forks
            ctx.fillStyle = '#334155';
            ctx.fillRect(objScreenX + objW * 0.4, objScreenY + objH * 0.1, objW * 0.2, objH * 0.8);
            // Warning beacon on roof
            ctx.fillStyle = tick % 15 < 8 ? '#f97316' : '#7c2d12';
            ctx.beginPath();
            ctx.arc(objScreenX + objW / 2, objScreenY + objH * 0.35, 6, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Obstacle box / pallet crate
            ctx.fillStyle = '#78350f';
            ctx.fillRect(objScreenX + objW * 0.1, objScreenY + objH * 0.3, objW * 0.8, objH * 0.65);
            ctx.strokeStyle = '#92400e';
            ctx.strokeRect(objScreenX + objW * 0.1, objScreenY + objH * 0.3, objW * 0.8, objH * 0.65);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [cameraSource, detectedObjects, speed, heading, gimbalPan, gimbalTilt]);

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      {/* Video / Canvas Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {cameraSource === 'webcam' ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={compact ? 480 : 960}
            height={compact ? 270 : 540}
            className="w-full h-full object-cover"
          />
        )}

        {/* Scanline Animation Effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-16 w-full animate-scanline"></div>

        {/* Top HUD Overlay Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono select-none pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-red-400 border border-red-500/40">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>LIVE CAM 01</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-300 border border-slate-700">
              1080p @ {cameraFps} FPS
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-cyan-400 border border-slate-700">
              PAN: {gimbalPan > 0 ? `+${gimbalPan}` : gimbalPan}° | TILT: {gimbalTilt}°
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-black/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setCameraSource('simulation')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  cameraSource === 'simulation' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Synthetic High-Fidelity Warehouse Stream"
              >
                RGB
              </button>
              <button
                onClick={() => setCameraSource('depth')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  cameraSource === 'depth' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Stereo Depth Estimation Heatmap"
              >
                Depth
              </button>
              <button
                onClick={() => setCameraSource('thermal')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  cameraSource === 'thermal' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Long-Wave FLIR Thermal IR Simulation"
              >
                Thermal
              </button>
              <button
                onClick={() => setCameraSource('webcam')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                  cameraSource === 'webcam' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Use User's Real Device Camera"
              >
                <Video className="w-2.5 h-2.5" />
                <span>Webcam</span>
              </button>
            </div>

            <button
              onClick={() => setIsAiOverlayActive(!isAiOverlayActive)}
              className={`p-1 rounded bg-black/70 border transition-colors ${
                isAiOverlayActive ? 'border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500'
              }`}
              title="Toggle AI Bounding Boxes"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Reticle & Artificial Horizon Crosshairs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-30">
          <div className="relative w-24 h-24 border border-cyan-400/40 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            <div className="absolute top-0 w-0.5 h-3 bg-cyan-400"></div>
            <div className="absolute bottom-0 w-0.5 h-3 bg-cyan-400"></div>
            <div className="absolute left-0 w-3 h-0.5 bg-cyan-400"></div>
            <div className="absolute right-0 w-3 h-0.5 bg-cyan-400"></div>
          </div>
        </div>

        {/* Real-time YOLO Bounding Boxes Overlaid on Target Entities */}
        {isAiOverlayActive && detectedObjects.map(obj => {
          const isCritical = obj.threatLevel === 'high' || obj.distance < 2.0;
          const isWarning = obj.threatLevel === 'medium';

          const borderColor = isCritical
            ? 'border-red-500 bg-red-500/10 text-red-300'
            : isWarning
            ? 'border-amber-400 bg-amber-400/10 text-amber-200'
            : 'border-cyan-400 bg-cyan-400/10 text-cyan-200';

          const tagColor = isCritical
            ? 'bg-red-600 text-white'
            : isWarning
            ? 'bg-amber-600 text-black font-bold'
            : 'bg-cyan-600 text-black font-bold';

          return (
            <div
              key={obj.id}
              className={`absolute transition-all duration-300 border-2 rounded ${borderColor} pointer-events-none z-20`}
              style={{
                left: `${obj.bbox.x}%`,
                top: `${obj.bbox.y}%`,
                width: `${obj.bbox.width}%`,
                height: `${obj.bbox.height}%`
              }}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-inherit"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-inherit"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-inherit"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-inherit"></div>

              {/* Tag Label with Tracking ID & Confidence */}
              <div className="absolute -top-6 left-0 flex items-center gap-1 font-mono text-[10px] whitespace-nowrap shadow-md">
                <span className={`px-1.5 py-0.5 rounded-t ${tagColor}`}>
                  {obj.category.toUpperCase()} {obj.trackingId}
                </span>
                <span className="px-1 py-0.5 rounded-t bg-black/80 text-white border border-slate-700">
                  {(obj.confidence * 100).toFixed(1)}%
                </span>
              </div>

              {/* Distance & Proximity Warning */}
              <div className="absolute -bottom-5 left-0 flex items-center gap-1 font-mono text-[9px] whitespace-nowrap">
                <span className={`px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border ${
                  isCritical ? 'text-red-400 border-red-600 animate-pulse' : 'text-slate-200 border-slate-700'
                }`}>
                  Dist: <strong className="text-white">{obj.distance}m</strong> ({obj.positionDesc})
                </span>
              </div>
            </div>
          );
        })}

        {/* Bottom HUD Telemetry Strip */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 select-none z-10">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-semibold">{yoloModel}</span>
            <span className="text-slate-600">|</span>
            <span>Objects: <strong className="text-white">{detectedObjects.length}</strong></span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Closest Obstacle: <strong className="text-amber-400">{sensors.lidar.minDistance}m</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>HDG: <strong className="text-white">{heading.toFixed(0)}°</strong></span>
            <span>SPD: <strong className="text-white">{speed.toFixed(1)} m/s</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
