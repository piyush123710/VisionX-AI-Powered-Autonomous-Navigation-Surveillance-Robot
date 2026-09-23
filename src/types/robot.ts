export type RobotStatus = 'online' | 'standby' | 'manual' | 'autonomous' | 'error' | 'emergency_stop';

export type NavigationMode = 'autonomous' | 'manual' | 'assisted' | 'estop';

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface Position2D {
  x: number;
  y: number;
}

export interface Position3D extends Position2D {
  z: number;
}

export interface BoundingBox {
  x: number;      // percentage 0 - 100
  y: number;      // percentage 0 - 100
  width: number;  // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export type ObjectClass = 'person' | 'vehicle' | 'chair' | 'door' | 'obstacle' | 'hazard' | 'box';

export interface DetectedObject {
  id: string;
  trackingId: string; // e.g. #P102, #V04
  label: string;
  category: ObjectClass;
  confidence: number; // 0.0 - 1.0
  bbox: BoundingBox;
  distance: number; // meters
  position3D: Position3D;
  positionDesc: 'Left' | 'Center' | 'Right' | 'Ahead';
  threatLevel: 'low' | 'medium' | 'high';
  velocity?: { vx: number; vy: number };
  firstSeen: number;
  lastUpdated: number;
}

export interface DecisionLogItem {
  id: string;
  timestamp: string;
  timeSec: number;
  stage: 'Perception' | 'Risk Evaluation' | 'Path Replanning' | 'Actuation' | 'Safety Override';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  actionTaken?: string;
  coordinates?: Position2D;
}

export interface SensorData {
  lidar: {
    distances: number[]; // 360 readings in meters
    closestObstacleAngle: number;
    minDistance: number;
    rpm: number;
    scanRateHz: number;
  };
  ultrasonic: {
    front: number;
    frontLeft: number;
    frontRight: number;
    rear: number;
    rearLeft: number;
    rearRight: number;
  };
  imu: {
    pitch: number;
    roll: number;
    yaw: number;
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
  };
  encoders: {
    leftTicks: number;
    rightTicks: number;
    speedLeftMps: number;
    speedRightMps: number;
    totalDistanceMeters: number;
  };
  gps: {
    lat: number;
    lng: number;
    altitude: number;
    satellites: number;
    fixType: '3D RTK FIXED' | '3D RTK FLOAT' | 'DGPS' | 'NO FIX';
    hdop: number;
  };
  thermal: {
    ambientTempC: number;
    hotspotTempC: number;
    maxSafeTempC: number;
  };
}

export interface BatteryState {
  percentage: number;
  voltage: number;
  currentAmps: number;
  tempC: number;
  health: number; // %
  cells: number[]; // e.g. 6 cells voltage (3.2V - 4.2V)
  charging: boolean;
  timeRemainingMinutes: number;
}

export interface SystemHealth {
  cpuUsage: number;
  cpuCores: number[];
  ramUsedGb: number;
  ramTotalGb: number;
  gpuUsage: number;
  gpuTempC: number;
  socTempC: number;
  motorDriversOk: boolean;
  cameraFps: number;
  networkLatencyMs: number;
  wifiSignalDbm: number;
  rosDomainId: number;
  activeNodes: { name: string; status: 'active' | 'degraded' | 'stopped'; rateHz: number }[];
}

export interface AlertItem {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  category: 'Obstacle' | 'Battery' | 'Thermal' | 'System' | 'Mission' | 'Security';
  title: string;
  message: string;
  acknowledged: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  completed: boolean;
  type: 'patrol' | 'inspection' | 'charging' | 'hazard' | 'delivery';
}

export interface Mission {
  id: string;
  title: string;
  type: 'inspection' | 'patrol' | 'delivery' | 'search_rescue' | 'mapping';
  startPoint: string;
  destination: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'aborted';
  progress: number; // 0 - 100
  waypoints: Waypoint[];
  currentWaypointIndex: number;
  startTime?: string;
  completedTime?: string;
  distanceTravelledM: number;
  obstaclesAvoided: number;
  notes?: string;
}

export interface RestrictedZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dangerLevel: 'caution' | 'prohibited';
}

export interface ReplayFrame {
  timestamp: number;
  position: Position2D;
  heading: number;
  speed: number;
  battery: number;
  action: string;
  detectedCount: number;
}
