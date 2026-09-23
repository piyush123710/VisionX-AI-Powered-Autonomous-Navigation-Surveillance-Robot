import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  RobotStatus,
  NavigationMode,
  UserRole,
  Position2D,
  DetectedObject,
  DecisionLogItem,
  SensorData,
  BatteryState,
  SystemHealth,
  AlertItem,
  Mission,
  Waypoint,
  RestrictedZone,
  ReplayFrame
} from '../types/robot';

interface DynamicEntity {
  id: string;
  trackingId: string;
  label: string;
  category: 'person' | 'vehicle' | 'obstacle' | 'chair' | 'box';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface RobotContextType {
  // Core state
  robotId: string;
  robotName: string;
  status: RobotStatus;
  mode: NavigationMode;
  userRole: UserRole;
  speed: number;
  maxSpeed: number;
  heading: number; // degrees
  position: Position2D;
  targetPosition: Position2D | null;
  pathTrail: Position2D[];
  plannedPath: Position2D[];

  // Perception & AI
  detectedObjects: DetectedObject[];
  decisionLogs: DecisionLogItem[];
  yoloModel: string;
  confidenceThreshold: number;
  collisionBufferDistance: number;
  cameraSource: 'simulation' | 'webcam' | 'depth' | 'thermal';
  cameraFps: number;

  // Telemetry & Hardware
  sensors: SensorData;
  battery: BatteryState;
  health: SystemHealth;
  alerts: AlertItem[];
  activeMissions: Mission[];
  currentMission: Mission | null;
  restrictedZones: RestrictedZone[];
  replayFrames: ReplayFrame[];

  // Gimbal PTZ
  gimbalPan: number;
  gimbalTilt: number;

  // Actions
  setMode: (mode: NavigationMode) => void;
  setUserRole: (role: UserRole) => void;
  setRobotName: (name: string) => void;
  setMaxSpeed: (speed: number) => void;
  setConfidenceThreshold: (thresh: number) => void;
  setCollisionBufferDistance: (dist: number) => void;
  setCameraSource: (src: 'simulation' | 'webcam' | 'depth' | 'thermal') => void;
  setTargetPosition: (pos: Position2D | null) => void;
  driveManual: (linear: number, angular: number) => void;
  triggerEmergencyStop: () => void;
  resetEmergencyStop: () => void;
  setGimbal: (pan: number, tilt: number) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  startMission: (missionId: string) => void;
  pauseMission: () => void;
  abortMission: () => void;
  createMission: (mission: Omit<Mission, 'id' | 'status' | 'progress' | 'currentWaypointIndex' | 'distanceTravelledM' | 'obstaclesAvoided'>) => void;
  addWaypoint: (name: string, x: number, y: number) => void;
  removeWaypoint: (waypointId: string) => void;
  askVisionVLM: (query: string) => Promise<string>;
}

const RobotContext = createContext<RobotContextType | null>(null);

// Preset initial waypoints in warehouse coordinates (0 - 100)
const INITIAL_WAYPOINTS: Waypoint[] = [
  { id: 'wp-1', name: 'Zone A - Receiving Dock', x: 20, y: 30, completed: true, type: 'patrol' },
  { id: 'wp-2', name: 'Zone B - Storage Bay 4', x: 45, y: 70, completed: false, type: 'inspection' },
  { id: 'wp-3', name: 'Zone C - Automated Conveyor', x: 80, y: 65, completed: false, type: 'patrol' },
  { id: 'wp-4', name: 'Zone D - Dispatch Station', x: 75, y: 25, completed: false, type: 'delivery' },
  { id: 'wp-5', name: 'Dock 0 - Fast Charger', x: 15, y: 15, completed: false, type: 'charging' }
];

const INITIAL_RESTRICTED_ZONES: RestrictedZone[] = [
  { id: 'rz-1', name: 'High Voltage Transformer', x: 50, y: 10, width: 14, height: 16, dangerLevel: 'prohibited' },
  { id: 'rz-2', name: 'Robotic Arm Swing Cell', x: 28, y: 45, width: 12, height: 12, dangerLevel: 'caution' }
];

export const RobotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [robotId] = useState('VX-01');
  const [robotName, setRobotName] = useState('VisionX Pro Rover');
  const [status, setStatus] = useState<RobotStatus>('autonomous');
  const [mode, setModeState] = useState<NavigationMode>('autonomous');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [speed, setSpeed] = useState(1.15);
  const [maxSpeed, setMaxSpeed] = useState(1.8);
  const [heading, setHeading] = useState(45); // degrees 0-360
  const [position, setPosition] = useState<Position2D>({ x: 22, y: 32 });
  const [targetPosition, setTargetPosition] = useState<Position2D | null>({ x: 45, y: 70 });
  const [pathTrail, setPathTrail] = useState<Position2D[]>([{ x: 20, y: 30 }, { x: 22, y: 32 }]);
  const [plannedPath, setPlannedPath] = useState<Position2D[]>([]);

  // Gimbal
  const [gimbalPan, setGimbalPan] = useState(0);
  const [gimbalTilt, setGimbalTilt] = useState(-5);

  // AI & Vision
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [yoloModel] = useState('YOLOv8x-Autonomous (TensorRT 8.6)');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
  const [collisionBufferDistance, setCollisionBufferDistance] = useState(0.85); // meters
  const [cameraSource, setCameraSource] = useState<'simulation' | 'webcam' | 'depth' | 'thermal'>('simulation');
  const [cameraFps, setCameraFps] = useState(30);

  // Dynamic moving entities inside the simulated environment
  const dynamicEntitiesRef = useRef<DynamicEntity[]>([
    { id: 'e-1', trackingId: '#P102', label: 'Inspector Sharma', category: 'person', x: 38, y: 55, vx: 0.25, vy: -0.15, radius: 2.5 },
    { id: 'e-2', trackingId: '#V04', label: 'Automated Forklift', category: 'vehicle', x: 62, y: 40, vx: -0.2, vy: 0.1, radius: 3.5 },
    { id: 'e-3', trackingId: '#O21', label: 'Pallet Crate Stack', category: 'obstacle', x: 42, y: 62, vx: 0, vy: 0, radius: 2.0 },
    { id: 'e-4', trackingId: '#C08', label: 'Mobile Workstation', category: 'chair', x: 72, y: 58, vx: 0.05, vy: 0.05, radius: 1.8 }
  ]);

  // Decision Logs
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogItem[]>([
    {
      id: 'dl-1',
      timestamp: new Date(Date.now() - 32000).toLocaleTimeString(),
      timeSec: Math.floor(Date.now() / 1000) - 32,
      stage: 'Perception',
      title: 'Human Worker Detected',
      description: 'Inspector Sharma detected at 2.4m bearing +12° (confidence 96.8%)',
      severity: 'info',
      actionTaken: 'Tracking ID #P102 assigned'
    },
    {
      id: 'dl-2',
      timestamp: new Date(Date.now() - 26000).toLocaleTimeString(),
      timeSec: Math.floor(Date.now() / 1000) - 26,
      stage: 'Risk Evaluation',
      title: 'Path Clearance Risk: Medium',
      description: 'Pedestrian velocity vector intersects planned corridor in 3.2s',
      severity: 'warning',
      actionTaken: 'Velocity throttled from 1.5 m/s to 0.85 m/s'
    },
    {
      id: 'dl-3',
      timestamp: new Date(Date.now() - 18000).toLocaleTimeString(),
      timeSec: Math.floor(Date.now() / 1000) - 18,
      stage: 'Path Replanning',
      title: 'TEB Local Planner Rerouting',
      description: 'Generated collision-free spline detour around Zone B waypoint',
      severity: 'info',
      actionTaken: 'Steered left +24° offset trajectory'
    },
    {
      id: 'dl-4',
      timestamp: new Date(Date.now() - 6000).toLocaleTimeString(),
      timeSec: Math.floor(Date.now() / 1000) - 6,
      stage: 'Actuation',
      title: 'Autonomous Trajectory Resumed',
      description: 'Clear line of sight established toward Storage Bay 4',
      severity: 'success',
      actionTaken: 'Accelerated to cruise speed 1.2 m/s'
    }
  ]);

  // Sensors Data
  const [sensors, setSensors] = useState<SensorData>({
    lidar: {
      distances: Array.from({ length: 360 }, (_, i) => 3.5 + Math.sin(i * 0.1) * 2),
      closestObstacleAngle: 18,
      minDistance: 1.84,
      rpm: 600,
      scanRateHz: 15
    },
    ultrasonic: {
      front: 1.82,
      frontLeft: 2.35,
      frontRight: 0.94,
      rear: 3.12,
      rearLeft: 2.85,
      rearRight: 2.9
    },
    imu: {
      pitch: 0.4,
      roll: -0.2,
      yaw: 45.0,
      ax: 0.08,
      ay: -0.04,
      az: 9.81,
      gx: 0.01,
      gy: -0.02,
      gz: 0.04
    },
    encoders: {
      leftTicks: 45280,
      rightTicks: 45310,
      speedLeftMps: 1.14,
      speedRightMps: 1.16,
      totalDistanceMeters: 486.4
    },
    gps: {
      lat: 28.613939,
      lng: 77.209021,
      altitude: 216.4,
      satellites: 18,
      fixType: '3D RTK FIXED',
      hdop: 0.78
    },
    thermal: {
      ambientTempC: 24.2,
      hotspotTempC: 44.8,
      maxSafeTempC: 75.0
    }
  });

  // Battery State
  const [battery, setBattery] = useState<BatteryState>({
    percentage: 82,
    voltage: 25.4,
    currentAmps: -3.8,
    tempC: 38.6,
    health: 98,
    cells: [4.23, 4.22, 4.24, 4.23, 4.24, 4.24],
    charging: false,
    timeRemainingMinutes: 245
  });

  // System Health
  const [health, setHealth] = useState<SystemHealth>({
    cpuUsage: 63,
    cpuCores: [68, 59, 72, 61, 55, 64, 70, 58],
    ramUsedGb: 4.8,
    ramTotalGb: 8.0,
    gpuUsage: 71,
    gpuTempC: 54,
    socTempC: 42,
    motorDriversOk: true,
    cameraFps: 30,
    networkLatencyMs: 21,
    wifiSignalDbm: -54,
    rosDomainId: 42,
    activeNodes: [
      { name: '/camera_node', status: 'active', rateHz: 30 },
      { name: '/yolo_perception', status: 'active', rateHz: 28 },
      { name: '/slam_toolbox', status: 'active', rateHz: 10 },
      { name: '/nav2_planner', status: 'active', rateHz: 20 },
      { name: '/motor_bridge', status: 'active', rateHz: 50 },
      { name: '/vlm_bridge', status: 'active', rateHz: 2 }
    ]
  });

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'a-1',
      timestamp: new Date(Date.now() - 14000).toLocaleTimeString(),
      level: 'warning',
      category: 'Obstacle',
      title: 'Pedestrian Approaching Blind Corner',
      message: 'Human detected within 2.5m corridor threshold at Bay 4.',
      acknowledged: false
    },
    {
      id: 'a-2',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      level: 'info',
      category: 'Mission',
      title: 'Zone A Inspection Completed',
      message: 'Barcode and volumetric scan synchronized with ERP.',
      acknowledged: true
    },
    {
      id: 'a-3',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      level: 'info',
      category: 'System',
      title: 'RTK-GPS Dual Antenna Lock',
      message: 'Centimeter precision acquired (HDOP: 0.78, 18 Satellites).',
      acknowledged: true
    }
  ]);

  // Missions
  const [activeMissions, setActiveMissions] = useState<Mission[]>([
    {
      id: 'm-1024',
      title: 'Warehouse Zone Inspection & Hazard Audit',
      type: 'inspection',
      startPoint: 'Zone A - Receiving Dock',
      destination: 'Zone B - Storage Bay 4',
      status: 'in_progress',
      progress: 64,
      waypoints: INITIAL_WAYPOINTS,
      currentWaypointIndex: 1,
      startTime: '14:15:00',
      distanceTravelledM: 840,
      obstaclesAvoided: 14,
      notes: 'Automated thermal audit & aisle path obstruction checking.'
    },
    {
      id: 'm-1025',
      title: 'Perimeter Security Patrol Wave #4',
      type: 'patrol',
      startPoint: 'Dock 0',
      destination: 'Zone D - Dispatch Station',
      status: 'pending',
      progress: 0,
      waypoints: INITIAL_WAYPOINTS.slice(2),
      currentWaypointIndex: 0,
      distanceTravelledM: 0,
      obstaclesAvoided: 0,
      notes: 'Night surveillance with infrared sensor active.'
    }
  ]);

  const [currentMission, setCurrentMission] = useState<Mission | null>(activeMissions[0]);
  const [restrictedZones] = useState<RestrictedZone[]>(INITIAL_RESTRICTED_ZONES);

  // Replay memory buffer
  const [replayFrames, setReplayFrames] = useState<ReplayFrame[]>([]);

  // Push an alert
  const pushAlert = useCallback((level: 'info' | 'warning' | 'critical', category: AlertItem['category'], title: string, message: string) => {
    const newAlert: AlertItem = {
      id: 'alt-' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      title,
      message,
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
  }, []);

  // Push a decision log item
  const pushDecisionLog = useCallback((
    stage: DecisionLogItem['stage'],
    title: string,
    description: string,
    severity: DecisionLogItem['severity'] = 'info',
    actionTaken?: string
  ) => {
    const item: DecisionLogItem = {
      id: 'dl-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      timeSec: Math.floor(Date.now() / 1000),
      stage,
      title,
      description,
      severity,
      actionTaken
    };
    setDecisionLogs(prev => [item, ...prev.slice(0, 39)]);
  }, []);

  // Mode changes
  const setMode = useCallback((newMode: NavigationMode) => {
    setModeState(newMode);
    if (newMode === 'estop') {
      setStatus('emergency_stop');
      setSpeed(0);
      pushAlert('critical', 'System', 'EMERGENCY STOP (E-STOP) ENGAGED', 'All drive motor solenoids disengaged immediately.');
      pushDecisionLog('Safety Override', 'Emergency Stop Activated', 'Hardware interlock triggered. Relays open.', 'critical', 'Motor RPM: 0');
    } else if (newMode === 'manual') {
      setStatus('manual');
      pushDecisionLog('Actuation', 'Switched to Manual Teleoperation', 'Operator joystick taking direct velocity authority.', 'info');
    } else if (newMode === 'autonomous') {
      setStatus('autonomous');
      pushDecisionLog('Actuation', 'Autonomous Nav2 Engine Resumed', 'Pure pursuit path tracking activated.', 'success');
    } else if (newMode === 'assisted') {
      setStatus('autonomous');
      pushDecisionLog('Actuation', 'Assisted Avoidance Active', 'User teleop with active proximity braking bubble.', 'info');
    }
  }, [pushAlert, pushDecisionLog]);

  const triggerEmergencyStop = useCallback(() => {
    setMode('estop');
  }, [setMode]);

  const resetEmergencyStop = useCallback(() => {
    setMode('autonomous');
    setStatus('autonomous');
    pushAlert('info', 'System', 'E-STOP Cleared', 'Drive system re-armed successfully.');
  }, [setMode, pushAlert]);

  const setGimbal = useCallback((pan: number, tilt: number) => {
    setGimbalPan(Math.max(-90, Math.min(90, pan)));
    setGimbalTilt(Math.max(-45, Math.min(45, tilt)));
  }, []);

  // Manual drive inputs
  const driveManual = useCallback((linear: number, angular: number) => {
    if (mode === 'estop') return;
    setSpeed(Number((linear * maxSpeed).toFixed(2)));
    setHeading(prev => (prev + angular * 4 + 360) % 360);
    setPosition(prev => {
      const rad = (heading * Math.PI) / 180;
      const dx = Math.sin(rad) * linear * 0.4;
      const dy = -Math.cos(rad) * linear * 0.4;
      return {
        x: Math.max(5, Math.min(95, prev.x + dx)),
        y: Math.max(5, Math.min(95, prev.y + dy))
      };
    });
  }, [mode, maxSpeed, heading]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const addWaypoint = useCallback((name: string, x: number, y: number) => {
    const wp: Waypoint = {
      id: 'wp-' + Date.now(),
      name,
      x,
      y,
      completed: false,
      type: 'inspection'
    };
    setCurrentMission(prev => {
      if (!prev) return null;
      return { ...prev, waypoints: [...prev.waypoints, wp] };
    });
  }, []);

  const removeWaypoint = useCallback((waypointId: string) => {
    setCurrentMission(prev => {
      if (!prev) return null;
      return { ...prev, waypoints: prev.waypoints.filter(w => w.id !== waypointId) };
    });
  }, []);

  const startMission = useCallback((missionId: string) => {
    setActiveMissions(prev =>
      prev.map(m => (m.id === missionId ? { ...m, status: 'in_progress' } : m))
    );
    const target = activeMissions.find(m => m.id === missionId);
    if (target) {
      setCurrentMission({ ...target, status: 'in_progress' });
      setMode('autonomous');
      if (target.waypoints.length > 0) {
        setTargetPosition({ x: target.waypoints[0].x, y: target.waypoints[0].y });
      }
      pushDecisionLog('Perception', `Mission Started: ${target.title}`, `Waypoint chain dispatched. Leaving ${target.startPoint}`, 'info');
    }
  }, [activeMissions, setMode, pushDecisionLog]);

  const pauseMission = useCallback(() => {
    if (currentMission) {
      setCurrentMission(prev => prev ? { ...prev, status: 'paused' } : null);
      setSpeed(0);
      pushDecisionLog('Safety Override', 'Mission Paused by Operator', 'Rover holds stationary position in current cell.', 'warning');
    }
  }, [currentMission, pushDecisionLog]);

  const abortMission = useCallback(() => {
    if (currentMission) {
      setCurrentMission(prev => prev ? { ...prev, status: 'aborted' } : null);
      setSpeed(0);
      pushAlert('warning', 'Mission', 'Mission Aborted', `Mission ${currentMission.title} was terminated.`);
      pushDecisionLog('Safety Override', 'Mission Aborted', 'Immediate stop executed. Standing by for instructions.', 'warning');
    }
  }, [currentMission, pushAlert, pushDecisionLog]);

  const createMission = useCallback((m: Omit<Mission, 'id' | 'status' | 'progress' | 'currentWaypointIndex' | 'distanceTravelledM' | 'obstaclesAvoided'>) => {
    const newMission: Mission = {
      ...m,
      id: 'm-' + Math.floor(1000 + Math.random() * 9000),
      status: 'pending',
      progress: 0,
      currentWaypointIndex: 0,
      distanceTravelledM: 0,
      obstaclesAvoided: 0
    };
    setActiveMissions(prev => [newMission, ...prev]);
    pushAlert('info', 'Mission', 'New Mission Created', `Mission "${newMission.title}" registered with ${newMission.waypoints.length} waypoints.`);
  }, [pushAlert]);

  // Multimodal Vision Query using Server-side Gemini API or Onboard Edge Inference
  const askVisionVLM = useCallback(async (query: string): Promise<string> => {
    try {
      const response = await fetch('/api/vlm/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          robotName,
          position,
          heading,
          detectedObjects: detectedObjects.map(o => ({
            label: o.label,
            trackingId: o.trackingId,
            distance: o.distance,
            positionDesc: o.positionDesc,
            confidence: o.confidence
          })),
          sensors: {
            lidarMinDist: sensors.lidar.minDistance,
            ultrasonicFront: sensors.ultrasonic.front
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.answer) return data.answer;
      }
    } catch (err) {
      console.warn('Backend VLM fetch error, using edge fallback:', err);
    }

    await new Promise(res => setTimeout(res, 600));

    const objSummary = detectedObjects.map(o => `${o.label} (${o.trackingId}) at ${o.distance}m [${o.positionDesc}]`).join(', ') || 'No critical obstacles detected in immediate 3-meter cone';
    const currentLoc = `X: ${position.x.toFixed(1)}m, Y: ${position.y.toFixed(1)}m, Heading: ${heading.toFixed(0)}°`;
    const target = targetPosition ? `Target: (${targetPosition.x}, ${targetPosition.y})` : 'Target: None';

    const qLower = query.toLowerCase();
    if (qLower.includes('front') || qLower.includes('ahead') || qLower.includes('see') || qLower.includes('what is')) {
      return `Visual Perception Analysis [Model: YOLOv8x + DepthNet]:\nAhead of robot at ${currentLoc}:\n- Detected Entities: ${objSummary}\n- Path Corridor: ${detectedObjects.some(o => o.distance < 2.0) ? 'Partially obstructed. Nav2 local planner is steering +18° offset.' : 'Clear 3.4m free corridor. Cruise speed 1.2 m/s maintained.'}\n- Ground Plane: Level concrete surface, friction coefficient 0.82 (normal).`;
    }
    if (qLower.includes('people') || qLower.includes('human') || qLower.includes('person') || qLower.includes('sharma')) {
      const person = detectedObjects.find(o => o.category === 'person');
      if (person) {
        return `Human Presence Detection:\n- Identity/Track: ${person.label} (${person.trackingId})\n- Proximity: ${person.distance} meters bearing ${person.positionDesc}\n- Confidence: ${(person.confidence * 100).toFixed(1)}%\n- Safety Action: Robot is maintaining safe 1.5m personal boundary buffer according to ISO 3691-4 industrial safety standards.`;
      }
      return `No human personnel currently in immediate camera FOV (field of view 78°). Radar scan clear for 5 meters.`;
    }
    if (qLower.includes('exit') || qLower.includes('door') || qLower.includes('way out')) {
      return `Facility Spatial Grounding:\n- Nearest emergency egress is Dispatch Station (Zone D) at coordinates (75, 25), approximately 42 meters northeast.\n- Current path has 0 hazardous blockages. Estimated transit time: 35 seconds.`;
    }
    if (qLower.includes('battery') || qLower.includes('health') || qLower.includes('power')) {
      return `Energy & Hardware Status:\n- Battery SOC: ${battery.percentage}% (25.4V LiFePO4, 6-cell balanced)\n- Est. Remaining Runtime: ${battery.timeRemainingMinutes} mins\n- System Thermals: SoC 42°C, Motor Drivers OK, Camera FPS: ${cameraFps}`;
    }

    return `Autonomous Agent Reasoning [Perception & Navigation Engine]:\nQuery: "${query}"\n- Current Position: ${currentLoc} | ${target}\n- Sensor State: LiDAR 360° online (closest contact ${sensors.lidar.minDistance}m), Ultrasonic front ${sensors.ultrasonic.front}m, RTK-GPS FIX.\n- Active Objects: ${objSummary}\n- Recommended Action: Proceeding along calculated Dijkstra trajectory towards current waypoint.`;
  }, [robotName, detectedObjects, position, heading, targetPosition, battery, cameraFps, sensors]);

  // Main Simulation & Kinematics Heartbeat Loop (Runs at 10Hz)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Move dynamic obstacles in warehouse
      const entities = dynamicEntitiesRef.current;
      entities.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;
        // Bounce off bounds
        if (e.x < 15 || e.x > 85) e.vx = -e.vx;
        if (e.y < 15 || e.y > 85) e.vy = -e.vy;
      });

      // 2. Robot Autonomous Navigation step
      if (mode === 'autonomous' && targetPosition && status !== 'emergency_stop') {
        setPosition(currentPos => {
          const dx = targetPosition.x - currentPos.x;
          const dy = targetPosition.y - currentPos.y;
          const distToTarget = Math.sqrt(dx * dx + dy * dy);

          // Check if waypoint reached
          if (distToTarget < 2.5) {
            // Advance to next waypoint if on mission
            setCurrentMission(prev => {
              if (!prev) return null;
              const nextIdx = (prev.currentWaypointIndex + 1) % prev.waypoints.length;
              const updatedWaypoints = prev.waypoints.map((w, i) =>
                i === prev.currentWaypointIndex ? { ...w, completed: true } : w
              );
              setTargetPosition({ x: prev.waypoints[nextIdx].x, y: prev.waypoints[nextIdx].y });
              return {
                ...prev,
                currentWaypointIndex: nextIdx,
                waypoints: updatedWaypoints,
                progress: Math.min(100, Math.round(((nextIdx) / prev.waypoints.length) * 100))
              };
            });
            pushDecisionLog('Actuation', 'Waypoint Objective Reached', `Reached coordinates (${targetPosition.x.toFixed(0)}, ${targetPosition.y.toFixed(0)}). Moving to next corridor.`, 'success');
            return currentPos;
          }

          // Calculate desired heading towards target
          // In screen coords, dy is downwards
          let targetAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;
          if (targetAngle < 0) targetAngle += 360;

          // Check for dynamic obstacles in front
          let collisionRisk = false;
          let avoidanceSteer = 0;
          let closestDist = 999;

          entities.forEach(ent => {
            const edx = ent.x - currentPos.x;
            const edy = ent.y - currentPos.y;
            const edist = Math.sqrt(edx * edx + edy * edy);
            if (edist < closestDist) closestDist = edist;

            if (edist < collisionBufferDistance * 3.5) {
              // Calculate relative angle to obstacle
              let obsAngle = (Math.atan2(edx, -edy) * 180) / Math.PI;
              if (obsAngle < 0) obsAngle += 360;
              const angleDiff = ((obsAngle - heading + 540) % 360) - 180;

              // If within front 60 degrees cone
              if (Math.abs(angleDiff) < 50) {
                collisionRisk = true;
                avoidanceSteer = angleDiff > 0 ? -35 : 35; // steer away
              }
            }
          });

          // Smoothly rotate heading towards target or avoidance
          setHeading(currHeading => {
            let desired = (targetAngle + avoidanceSteer + 360) % 360;
            let diff = ((desired - currHeading + 540) % 360) - 180;
            let step = Math.sign(diff) * Math.min(Math.abs(diff), 8);
            return (currHeading + step + 360) % 360;
          });

          // Adjust speed based on obstacles
          let curSpeed = maxSpeed;
          if (collisionRisk) {
            curSpeed = 0.45;
          }
          setSpeed(Number(curSpeed.toFixed(2)));

          // Step forward along heading
          const rad = (heading * Math.PI) / 180;
          const stepDist = curSpeed * 0.18;
          const newX = Math.max(5, Math.min(95, currentPos.x + Math.sin(rad) * stepDist));
          const newY = Math.max(5, Math.min(95, currentPos.y - Math.cos(rad) * stepDist));

          // Append trail occasionally
          setPathTrail(trail => {
            const last = trail[trail.length - 1];
            if (!last || Math.hypot(newX - last.x, newY - last.y) > 2.0) {
              return [...trail.slice(-80), { x: newX, y: newY }];
            }
            return trail;
          });

          return { x: newX, y: newY };
        });
      }

      // 3. Compute live camera detections based on robot position & heading
      const visibleObjects: DetectedObject[] = [];
      const robotRad = (heading * Math.PI) / 180;

      entities.forEach((ent, idx) => {
        const dx = ent.x - position.x;
        const dy = ent.y - position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Angle relative to robot heading
        let angleToEnt = (Math.atan2(dx, -dy) * 180) / Math.PI;
        if (angleToEnt < 0) angleToEnt += 360;
        let relAngle = ((angleToEnt - heading + 540) % 360) - 180;

        // Camera FOV ~ 70 degrees (-35 to +35) and distance < 18m
        if (Math.abs(relAngle) < 38 && dist < 18) {
          // Screen projection
          // X: -35° -> 10%, 0° -> 50%, +35° -> 90%
          const screenX = 50 + (relAngle / 38) * 35;
          const screenY = Math.min(75, 45 + (1 / Math.max(1.5, dist)) * 20);
          const boxW = Math.max(8, Math.min(32, (1 / Math.max(1.2, dist)) * 85));
          const boxH = Math.max(14, Math.min(55, (1 / Math.max(1.2, dist)) * 140));

          let posDesc: 'Left' | 'Center' | 'Right' | 'Ahead' = 'Ahead';
          if (relAngle < -12) posDesc = 'Left';
          else if (relAngle > 12) posDesc = 'Right';

          visibleObjects.push({
            id: 'obj-' + ent.id,
            trackingId: ent.trackingId,
            label: ent.label,
            category: ent.category,
            confidence: Number((0.92 + Math.sin(idx + Date.now() * 0.001) * 0.06).toFixed(3)),
            bbox: {
              x: Math.max(5, Math.min(85, screenX - boxW / 2)),
              y: Math.max(15, Math.min(65, screenY - boxH / 2)),
              width: boxW,
              height: boxH
            },
            distance: Number(dist.toFixed(2)),
            position3D: {
              x: Number((Math.sin((relAngle * Math.PI) / 180) * dist).toFixed(2)),
              y: Number((Math.cos((relAngle * Math.PI) / 180) * dist).toFixed(2)),
              z: 0.1
            },
            positionDesc: posDesc,
            threatLevel: dist < 2.0 ? 'high' : dist < 4.0 ? 'medium' : 'low',
            velocity: { vx: ent.vx, vy: ent.vy },
            firstSeen: Date.now() - 45000,
            lastUpdated: Date.now()
          });
        }
      });

      setDetectedObjects(visibleObjects);

      // 4. Update Sensors telemetry (LiDAR distances, ultrasonic, IMU noise)
      setSensors(prev => {
        const noise = (Math.random() - 0.5) * 0.06;
        const minLidar = visibleObjects.length > 0 ? Math.min(...visibleObjects.map(o => o.distance)) : 2.8;
        return {
          ...prev,
          lidar: {
            ...prev.lidar,
            distances: prev.lidar.distances.map((d, i) => {
              const angleRad = (i * Math.PI) / 180;
              return Math.max(0.4, 3.2 + Math.sin(i * 0.08 + Date.now() * 0.002) * 1.5 + (Math.random() - 0.5) * 0.1);
            }),
            minDistance: Number(Math.max(0.4, minLidar + noise).toFixed(2)),
            closestObstacleAngle: visibleObjects[0] ? 15 : 45
          },
          ultrasonic: {
            front: Number(Math.max(0.3, (visibleObjects[0]?.distance ?? 2.4) + noise).toFixed(2)),
            frontLeft: Number(Math.max(0.5, 2.1 + (Math.random() - 0.5) * 0.15).toFixed(2)),
            frontRight: Number(Math.max(0.4, 1.2 + (Math.random() - 0.5) * 0.1).toFixed(2)),
            rear: 3.2,
            rearLeft: 2.8,
            rearRight: 2.7
          },
          imu: {
            ...prev.imu,
            pitch: Number((0.2 + (Math.random() - 0.5) * 0.3).toFixed(2)),
            roll: Number((-0.1 + (Math.random() - 0.5) * 0.2).toFixed(2)),
            yaw: Number(heading.toFixed(1)),
            ax: Number((speed > 0.1 ? 0.2 + (Math.random() - 0.5) * 0.1 : 0.01).toFixed(2))
          },
          encoders: {
            ...prev.encoders,
            speedLeftMps: Number((speed * 0.98 + (Math.random() - 0.5) * 0.04).toFixed(2)),
            speedRightMps: Number((speed * 1.02 + (Math.random() - 0.5) * 0.04).toFixed(2)),
            totalDistanceMeters: Number((prev.encoders.totalDistanceMeters + speed * 0.02).toFixed(1))
          }
        };
      });

      // 5. Update Health metrics
      setHealth(prev => ({
        ...prev,
        cpuUsage: Math.floor(58 + Math.random() * 12),
        gpuUsage: Math.floor(68 + Math.random() * 8),
        networkLatencyMs: Math.floor(18 + Math.random() * 8)
      }));

      // 6. Record Replay Frame
      setReplayFrames(prev => [
        ...prev.slice(-120),
        {
          timestamp: Date.now(),
          position: { ...position },
          heading,
          speed,
          battery: battery.percentage,
          action: mode === 'autonomous' ? 'Navigating to Waypoint' : 'Manual Control',
          detectedCount: visibleObjects.length
        }
      ]);

      // 7. Check critical alerts
      if (sensors.ultrasonic.front < 0.6 && mode === 'autonomous') {
        pushAlert('critical', 'Obstacle', 'Collision Hazard: Proximity < 0.6m', 'Front ultrasonic sensor detected immediate obstacle!');
      }

    }, 300); // 300ms update interval

    return () => clearInterval(interval);
  }, [mode, status, targetPosition, heading, speed, maxSpeed, collisionBufferDistance, battery.percentage, sensors.ultrasonic.front, pushAlert, pushDecisionLog]);

  return (
    <RobotContext.Provider
      value={{
        robotId,
        robotName,
        status,
        mode,
        userRole,
        speed,
        maxSpeed,
        heading,
        position,
        targetPosition,
        pathTrail,
        plannedPath,
        detectedObjects,
        decisionLogs,
        yoloModel,
        confidenceThreshold,
        collisionBufferDistance,
        cameraSource,
        cameraFps,
        sensors,
        battery,
        health,
        alerts,
        activeMissions,
        currentMission,
        restrictedZones,
        replayFrames,
        gimbalPan,
        gimbalTilt,
        setMode,
        setUserRole,
        setRobotName,
        setMaxSpeed,
        setConfidenceThreshold,
        setCollisionBufferDistance,
        setCameraSource,
        setTargetPosition,
        driveManual,
        triggerEmergencyStop,
        resetEmergencyStop,
        setGimbal,
        acknowledgeAlert,
        clearAllAlerts,
        startMission,
        pauseMission,
        abortMission,
        createMission,
        addWaypoint,
        removeWaypoint,
        askVisionVLM
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};
