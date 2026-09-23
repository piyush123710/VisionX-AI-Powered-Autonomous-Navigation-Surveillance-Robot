import React from 'react';
import { 
  Radio, 
  Compass, 
  MapPin, 
  RotateCw, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Eye, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { LidarRadarCanvas } from '../common/LidarRadarCanvas';

export const SensorsView: React.FC = () => {
  const { sensors, heading } = useRobot();

  const sensorDevices = [
    { name: 'RPLiDAR A3M1 (360° Laser Scanner)', status: 'ONLINE', rate: '15 Hz', bus: 'USB /dev/ttyUSB0', color: 'emerald' },
    { name: 'Ultrasonic Sonar Array (6x HC-SR04)', status: 'ONLINE', rate: '20 Hz', bus: 'I2C Bus 1', color: 'emerald' },
    { name: 'Intel RealSense D435i Stereo Depth', status: 'ONLINE', rate: '30 FPS', bus: 'USB 3.2 Gen 1', color: 'emerald' },
    { name: 'Bosch BNO055 9-DOF Fusion IMU', status: 'ONLINE', rate: '100 Hz', bus: 'I2C 0x28', color: 'emerald' },
    { name: 'Optical Dual Quadrature Encoders', status: 'ONLINE', rate: '500 Hz', bus: 'Hardware Timers', color: 'emerald' },
    { name: 'u-blox ZED-F9P Multi-Band RTK GPS', status: 'LOCKED', rate: '10 Hz', bus: 'UART /dev/ttyTHS1', color: 'emerald' },
    { name: 'RoboClaw Dual 30A Motor Driver', status: 'ONLINE', rate: '50 Hz', bus: 'CAN Bus 2.0B', color: 'emerald' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Sensors & Hardware Perception Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            360° LiDAR &bull; Ultrasonic Sonar Array &bull; 9-DOF Fusion IMU &bull; RTK Centimeter GPS
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>7/7 SENSORS OPERATIONAL</span>
        </span>
      </div>

      {/* Main Grid: LiDAR Radar (Left 6 cols) & Ultrasonic + IMU (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 360 LiDAR Polar Visualizer (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200 uppercase">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>360° LiDAR Polar Radar Scanner</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">RPLiDAR A3 &bull; 15Hz</span>
          </div>

          <div className="py-2 flex justify-center">
            <LidarRadarCanvas size={310} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MIN PROXIMITY</span>
              <span className="text-amber-400 font-bold text-sm">{sensors.lidar.minDistance} m</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BEARING ANGLE</span>
              <span className="text-white font-bold text-sm">+{sensors.lidar.closestObstacleAngle}°</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">SCAN RPM</span>
              <span className="text-cyan-400 font-bold text-sm">{sensors.lidar.rpm} RPM</span>
            </div>
          </div>
        </div>

        {/* Ultrasonic Array & 9-DOF IMU (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Ultrasonic Array */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Ultrasonic Sonar Distance Array</span>
              </span>
              <span className="text-[10px] text-slate-400">Safety Ring</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">FRONT-LEFT</span>
                <span className="text-white font-bold">{sensors.ultrasonic.frontLeft} m</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (sensors.ultrasonic.frontLeft / 4) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-800/80">
                <span className="text-cyan-400 block text-[10px] font-bold">FRONT CENTER</span>
                <span className={`font-bold text-base ${sensors.ultrasonic.front < 1.0 ? 'text-red-400' : 'text-white'}`}>
                  {sensors.ultrasonic.front} m
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${sensors.ultrasonic.front < 1.0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (sensors.ultrasonic.front / 4) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">FRONT-RIGHT</span>
                <span className="text-white font-bold">{sensors.ultrasonic.frontRight} m</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, (sensors.ultrasonic.frontRight / 4) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">REAR-LEFT</span>
                <span className="text-slate-300 font-bold">{sensors.ultrasonic.rearLeft} m</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">REAR CENTER</span>
                <span className="text-slate-300 font-bold">{sensors.ultrasonic.rear} m</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">REAR-RIGHT</span>
                <span className="text-slate-300 font-bold">{sensors.ultrasonic.rearRight} m</span>
              </div>
            </div>
          </div>

          {/* 9-DOF IMU Orientation & Attitude */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold uppercase text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>9-DOF IMU (Attitude & Acceleration)</span>
              </span>
              <span className="text-[10px] text-slate-400">BNO055 Fusion</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PITCH</span>
                <span className="text-white font-bold">{sensors.imu.pitch}°</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ROLL</span>
                <span className="text-white font-bold">{sensors.imu.roll}°</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">YAW (HEADING)</span>
                <span className="text-cyan-400 font-bold">{heading.toFixed(1)}°</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">ACCEL X</span>
                <span className="text-slate-300">{sensors.imu.ax} m/s²</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">ACCEL Y</span>
                <span className="text-slate-300">{sensors.imu.ay} m/s²</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">GRAVITY Z</span>
                <span className="text-slate-300">{sensors.imu.az} m/s²</span>
              </div>
            </div>
          </div>

          {/* RTK-GPS & Wheel Encoders Strip */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>RTK-GPS LOCK</span>
                <span className="text-emerald-400 font-bold">{sensors.gps.fixType}</span>
              </div>
              <div className="text-white font-bold text-[11px] truncate">
                Lat: {sensors.gps.lat.toFixed(6)}, Lng: {sensors.gps.lng.toFixed(6)}
              </div>
              <div className="text-[10px] text-slate-500">
                Satellites: {sensors.gps.satellites} &bull; HDOP: {sensors.gps.hdop}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>WHEEL ODOMETRY</span>
                <span className="text-cyan-400 font-bold">{sensors.encoders.totalDistanceMeters} m</span>
              </div>
              <div className="text-white font-bold text-[11px]">
                L: {sensors.encoders.leftTicks} | R: {sensors.encoders.rightTicks} ticks
              </div>
              <div className="text-[10px] text-slate-500">
                Dual High-Res Hall Encoders
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Bus & Device Status Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold uppercase text-slate-200 pb-2 border-b border-slate-800">
          Sensor Bus Interface Registry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {sensorDevices.map((dev, i) => (
            <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block text-[11px]">{dev.name}</span>
                <span className="text-[10px] text-slate-500">{dev.bus} &bull; {dev.rate}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {dev.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
