import React, { useRef, useEffect, useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Layers, 
  ShieldAlert, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Target,
  Sparkles
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { Position2D } from '../../types/robot';

interface SlamMapCanvasProps {
  compact?: boolean;
  interactive?: boolean;
  className?: string;
  onGoalSet?: (goal: Position2D) => void;
}

export const SlamMapCanvas: React.FC<SlamMapCanvasProps> = ({
  compact = false,
  interactive = true,
  className = '',
  onGoalSet
}) => {
  const {
    position,
    heading,
    speed,
    targetPosition,
    pathTrail,
    restrictedZones,
    currentMission,
    sensors,
    setTargetPosition,
    detectedObjects
  } = useRobot();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<Position2D | null>(null);

  // Click or touch on map to dispatch robot to target coordinate
  const dispatchGoalAtCoords = (clientX: number, clientY: number) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Convert screen px to map coordinate (0 - 100)
    const mapX = Math.max(5, Math.min(95, (clickX / rect.width) * 100));
    const mapY = Math.max(5, Math.min(95, (clickY / rect.height) * 100));

    const newTarget = { x: Number(mapX.toFixed(1)), y: Number(mapY.toFixed(1)) };
    setTargetPosition(newTarget);
    if (onGoalSet) onGoalSet(newTarget);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dispatchGoalAtCoords(e.clientX, e.clientY);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      dispatchGoalAtCoords(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setHoverCoord({
      x: Number(((mouseX / canvas.width) * 100).toFixed(1)),
      y: Number(((mouseY / canvas.height) * 100).toFixed(1))
    });
  };

  // SLAM & Lidar Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Grid Background (SLAM Occupancy Grid Cells)
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Minor grid lines (1m resolution)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 1;
    const gridSize = w / 20; // 20x20 major cells
    for (let x = 0; x <= w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Warehouse Walls & Structural Pillars
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;

    // Outer Perimeter Boundary
    ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);

    // Interior Walls & Partitions (Room A, Room B, Storage Corridor)
    ctx.fillStyle = '#1e293b';
    // North Partition
    ctx.fillRect(w * 0.05, h * 0.45, w * 0.28, 4);
    // South Bay Rack Partition
    ctx.fillRect(w * 0.65, h * 0.45, w * 0.3, 4);
    // Central Storage Racks
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.38, h * 0.2, w * 0.06, h * 0.25);
    ctx.fillRect(w * 0.56, h * 0.2, w * 0.06, h * 0.25);

    // 3. Restricted / Keep-Out Zones
    restrictedZones.forEach(zone => {
      const zx = (zone.x / 100) * w;
      const zy = (zone.y / 100) * h;
      const zw = (zone.width / 100) * w;
      const zh = (zone.height / 100) * h;

      ctx.fillStyle = zone.dangerLevel === 'prohibited' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(zx, zy, zw, zh);

      ctx.strokeStyle = zone.dangerLevel === 'prohibited' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(zx, zy, zw, zh);
      ctx.setLineDash([]);

      // Warning text
      ctx.fillStyle = zone.dangerLevel === 'prohibited' ? '#f87171' : '#fbbf24';
      ctx.font = '9px monospace';
      ctx.fillText(`RESTRICTED: ${zone.name}`, zx + 4, zy + 12);
    });

    // 4. Historical Path Trail (Cyan Glowing Trail)
    if (pathTrail.length > 1) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      pathTrail.forEach((pt, i) => {
        const sx = (pt.x / 100) * w;
        const sy = (pt.y / 100) * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    // 5. Waypoints from Active Mission
    if (currentMission && currentMission.waypoints) {
      currentMission.waypoints.forEach((wp, index) => {
        const wx = (wp.x / 100) * w;
        const wy = (wp.y / 100) * h;
        const isCurrentTarget = targetPosition && Math.hypot(targetPosition.x - wp.x, targetPosition.y - wp.y) < 1.0;

        // Outer beacon ring
        ctx.strokeStyle = wp.completed ? '#10b981' : isCurrentTarget ? '#06b6d4' : '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wx, wy, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Inner marker dot
        ctx.fillStyle = wp.completed ? '#059669' : isCurrentTarget ? '#0891b2' : '#475569';
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = isCurrentTarget ? '#22d3ee' : '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(`${index + 1}. ${wp.name}`, wx + 11, wy + 3);
      });
    }

    // 6. Planned Path Trajectory to Target (Green dashed A* spline)
    if (targetPosition) {
      const rx = (position.x / 100) * w;
      const ry = (position.y / 100) * h;
      const tx = (targetPosition.x / 100) * w;
      const ty = (targetPosition.y / 100) * h;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      // Smooth curvature around center
      const midX = (rx + tx) / 2 + 15;
      const midY = (ry + ty) / 2 - 10;
      ctx.quadraticCurveTo(midX, midY, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target Goal Beacon (Red Target)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px monospace';
      ctx.fillText('GOAL', tx - 12, ty - 14);
    }

    // 7. Dynamic Detected Entities with Safety Buffers
    detectedObjects.forEach(obj => {
      // Relative offset to robot
      const rx = (position.x / 100) * w;
      const ry = (position.y / 100) * h;
      const rad = ((heading + (obj.positionDesc === 'Left' ? -20 : obj.positionDesc === 'Right' ? 20 : 0)) * Math.PI) / 180;
      const distPx = (obj.distance / 10) * (w * 0.25);
      const ox = rx + Math.sin(rad) * distPx;
      const oy = ry - Math.cos(rad) * distPx;

      // Safety Avoidance Buffer (0.85m)
      ctx.fillStyle = obj.threatLevel === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Entity icon
      ctx.fillStyle = obj.category === 'person' ? '#38bdf8' : '#fb923c';
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '9px monospace';
      ctx.fillText(`${obj.trackingId}`, ox + 7, oy - 2);
    });

    // 8. Real-time LiDAR Point Cloud Rays (Sweeping scan)
    const rx = (position.x / 100) * w;
    const ry = (position.y / 100) * h;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
    const scanStep = 6; // 60 points for performance
    for (let deg = 0; deg < 360; deg += scanStep) {
      const distM = sensors.lidar.distances[deg] || 3.0;
      const angleRad = ((deg + heading) * Math.PI) / 180;
      const rayLenPx = (distM / 10) * (w * 0.3);
      const px = rx + Math.sin(angleRad) * rayLenPx;
      const py = ry - Math.cos(angleRad) * rayLenPx;

      // Draw point
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Camera FOV Cone (70 degrees front wedge)
    const fovRad1 = ((heading - 35) * Math.PI) / 180;
    const fovRad2 = ((heading + 35) * Math.PI) / 180;
    const fovLen = w * 0.18;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.sin(fovRad1) * fovLen, ry - Math.cos(fovRad1) * fovLen);
    ctx.arc(rx, ry, fovLen, fovRad1 - Math.PI / 2, fovRad2 - Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    // 10. Robot Physical Chassis & Orientation Arrow
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate((heading * Math.PI) / 180);

    // Robot Footprint Base (Rectangular AGV)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-8, -11, 16, 22);

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -9, 3, 7);
    ctx.fillRect(7, -9, 3, 7);
    ctx.fillRect(-10, 2, 3, 7);
    ctx.fillRect(7, 2, 3, 7);

    // Heading Arrow on Chassis
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();

    // LiDAR Puck in Center
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  }, [position, heading, targetPosition, pathTrail, restrictedZones, currentMission, sensors, detectedObjects]);

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl ${className}`}>
      {/* Top Controls Overlay */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 backdrop-blur-md text-cyan-400 border border-cyan-800/60 shadow">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            <span>SLAM 2D GRID MAP</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-800">
            Res: 0.05m/px
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {hoverCoord && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
              X: {hoverCoord.x}m, Y: {hoverCoord.y}m
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            {interactive ? 'Click map to navigate' : 'Monitoring'}
          </span>
        </div>
      </div>

      {/* Main SLAM Canvas */}
      <canvas
        ref={canvasRef}
        width={compact ? 480 : 800}
        height={compact ? 360 : 540}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
        onMouseMove={handleMouseMove}
        className={`w-full aspect-[4/3] object-cover ${interactive ? 'cursor-crosshair touch-manipulation' : 'cursor-default'}`}
      />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Robot Pose
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Waypoints
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Goal
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <span className="w-2.5 h-2.5 bg-red-500/30 border border-red-500 rounded-sm"></span>
            Keep-Out
          </span>
        </div>

        <div className="flex items-center gap-2 text-cyan-300">
          <span>Target: {targetPosition ? `(${targetPosition.x}, ${targetPosition.y})` : 'Idle'}</span>
        </div>
      </div>
    </div>
  );
};
