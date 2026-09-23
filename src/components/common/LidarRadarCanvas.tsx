import React, { useRef, useEffect } from 'react';
import { useRobot } from '../../context/RobotContext';

export const LidarRadarCanvas: React.FC<{ size?: number; className?: string }> = ({ size = 280, className = '' }) => {
  const { sensors, heading } = useRobot();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      sweepAngle = (sweepAngle + 3) % 360;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(cx, cy) - 16;

      ctx.clearRect(0, 0, w, h);

      // Radar background
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Concentric range rings (1m, 2m, 3m, 4m, 5m)
      const ringSteps = [1, 2, 3, 4, 5];
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);

      ringSteps.forEach((m) => {
        const r = (m / 5) * maxRadius;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Distance text
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.font = '8px monospace';
        ctx.fillText(`${m}m`, cx + 3, cy - r + 9);
      });
      ctx.setLineDash([]);

      // Cardinal axes (Crosshairs)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.stroke();

      // LiDAR Point Cloud Returns
      const distances = sensors.lidar.distances;
      for (let i = 0; i < distances.length; i += 3) {
        const dist = distances[i];
        if (!dist || dist <= 0.1) continue;

        const angleRad = ((i - 90) * Math.PI) / 180;
        const r = Math.min(maxRadius, (dist / 5) * maxRadius);
        const px = cx + Math.cos(angleRad) * r;
        const py = cy + Math.sin(angleRad) * r;

        // Color points based on proximity
        if (dist < 1.2) {
          ctx.fillStyle = '#ef4444'; // Red hazard
          ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        } else if (dist < 2.2) {
          ctx.fillStyle = '#f59e0b'; // Amber caution
          ctx.fillRect(px - 1, py - 1, 2, 2);
        } else {
          ctx.fillStyle = '#06b6d4'; // Cyan normal
          ctx.fillRect(px - 0.75, py - 0.75, 1.5, 1.5);
        }
      }

      // Sweeping radar beam gradient
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((sweepAngle * Math.PI) / 180);

      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
      sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      sweepGrad.addColorStop(0.9, 'rgba(6, 182, 212, 0.35)');
      sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0.8)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxRadius, -0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp beam line
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius, 0);
      ctx.stroke();

      ctx.restore();

      // Center Robot Icon
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Heading pointer on radar center
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 8);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [sensors, heading]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-inner border border-cyan-900/60 bg-slate-950"
      />
      <div className="flex items-center justify-between w-full px-2 mt-2 text-[10px] font-mono text-slate-400">
        <span>RPM: {sensors.lidar.rpm}</span>
        <span className="text-amber-400 font-bold">Min: {sensors.lidar.minDistance}m</span>
        <span>Rate: {sensors.lidar.scanRateHz} Hz</span>
      </div>
    </div>
  );
};
