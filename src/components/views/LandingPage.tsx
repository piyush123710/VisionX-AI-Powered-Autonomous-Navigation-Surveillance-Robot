import React from 'react';
import { 
  Bot, 
  Eye, 
  Compass, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Radio, 
  Play, 
  Server,
  FileCode,
  Gauge
} from 'lucide-react';
import { useRobot } from '../../context/RobotContext';
import { CameraHUD } from '../common/CameraHUD';
import { SlamMapCanvas } from '../common/SlamMapCanvas';

export const LandingPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { robotId, status, battery, speed, health, sensors, detectedObjects } = useRobot();

  const capabilities = [
    {
      title: 'Real-Time Object Detection',
      desc: 'YOLOv8 & YOLO11 accelerated with TensorRT at 70+ FPS for multi-class classification and dynamic bounding boxes.',
      icon: Eye,
      tag: 'CV / Deep Learning'
    },
    {
      title: 'Human Detection & Tracking',
      desc: 'Persistent ID assignment (ByteTrack/DeepSORT) with 3D spatial distancing to adhere to ISO 3691-4 industrial safety zones.',
      icon: Bot,
      tag: 'Safety Critical'
    },
    {
      title: 'Dynamic Obstacle Avoidance',
      desc: '360° LiDAR point-cloud raycasting fused with ultrasonic sonar sensors for sub-second reactive collision avoidance.',
      icon: ShieldCheck,
      tag: 'LiDAR / Sonar'
    },
    {
      title: 'Autonomous SLAM Navigation',
      desc: 'Simultaneous Localization and Mapping (SLAM Toolbox) + Nav2 costmaps with A* and TEB local trajectory planners.',
      icon: Compass,
      tag: 'ROS 2 Nav2'
    },
    {
      title: 'Intelligent Decision Engine',
      desc: 'Perception-to-action state machine evaluating collision risks, corridor clearance, and auto-rerouting in real time.',
      icon: BrainCircuit,
      tag: 'Edge AI Brain'
    },
    {
      title: 'Multimodal Vision-Language Reasoning',
      desc: 'VLM semantic scene understanding allowing operators to query environment states using natural language prompts.',
      icon: Zap,
      tag: 'Gemini VLM'
    }
  ];

  const techStack = [
    { name: 'ROS 2 Humble', role: 'Robotics Middleware & DDS Node Bus' },
    { name: 'YOLOv8x / YOLO11', role: 'Edge Object Detection & Semantic Segmentation' },
    { name: 'Nav2 & SLAM Toolbox', role: 'Lifelong Occupancy Mapping & Dynamic Path Planning' },
    { name: 'Intel RealSense & LiDAR', role: 'Stereo Depth Vision & 360° Laser Point Clouds' },
    { name: 'Python & OpenCV', role: 'Perception Node, Bounding Boxes, & Feature Extraction' },
    { name: 'Node.js & Express', role: 'High-Throughput Telemetry API & Event Streaming' },
    { name: 'WebSocket & MQTT', role: 'Bi-directional Edge-to-Cloud Low-Latency Pub/Sub' },
    { name: 'React 19 & Tailwind CSS', role: 'Military-Grade Command Center Web Interface' }
  ];

  const useCases = [
    {
      title: 'Industrial Warehouses & Logistics',
      desc: 'Autonomous pallet inspection, rack inventory verification, and collision-free transport alongside human forklift operators.',
      badge: 'Smart Factory'
    },
    {
      title: 'Autonomous Security & Perimeter Surveillance',
      desc: '24/7 scheduled night patrol, thermal hotspot identification, perimeter breach logging, and automated threat alert dispatch.',
      badge: 'Surveillance'
    },
    {
      title: 'Hazardous Environment & Gas Leak Inspection',
      desc: 'Navigating toxic, explosive, or radioactive zones with onboard gas sensors, thermal cameras, and autonomous egress paths.',
      badge: 'HazMat / Safety'
    },
    {
      title: 'Disaster Search & Rescue Reconnaissance',
      desc: 'Mapping collapsed structures in real time, detecting human survivors via infrared body heat, and relaying 3D maps to base.',
      badge: 'Search & Rescue'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SYSTEM ACTIVE &bull; ROBOT: {robotId} &bull; BATTERY: {battery.percentage}%</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Vision<span className="text-cyan-400">X</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mt-2">
                AI-Powered Autonomous Navigation & Surveillance Robot
              </span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-cyan-400 tracking-wide font-mono">
              See. Understand. Decide. Navigate.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              An enterprise-grade autonomous robotics platform engineered for physical and simulated environments.
              Equipped with real-time deep learning vision, 360° LiDAR SLAM mapping, dynamic obstacle avoidance,
              and a military-style web command center with low-latency edge telemetry.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
            >
              <span>Launch Command Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('navigation')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore SLAM Map</span>
            </button>
            <button
              onClick={() => onNavigate('vision')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>AI Vision & VLM</span>
            </button>
            <button
              onClick={() => onNavigate('control')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Teleoperation (WASD)</span>
            </button>
          </div>

          {/* Live Quick Glance Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CURRENT SPEED</span>
              <span className="text-white font-bold text-base">{speed.toFixed(1)} m/s</span>
              <span className="text-slate-500 text-[10px] block">Max {1.8} m/s</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BATTERY SOC</span>
              <span className="text-emerald-400 font-bold text-base">{battery.percentage}%</span>
              <span className="text-slate-500 text-[10px] block">{battery.voltage}V LiFePO4</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DETECTED ENTITIES</span>
              <span className="text-cyan-400 font-bold text-base">{detectedObjects.length} Active</span>
              <span className="text-slate-500 text-[10px] block">YOLOv8 @ 70 FPS</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NETWORK & LATENCY</span>
              <span className="text-indigo-400 font-bold text-base">{health.networkLatencyMs} ms</span>
              <span className="text-slate-500 text-[10px] block">ROS 2 DDS (Domain 42)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Live Dual Preview: Live Camera HUD & Live SLAM Map */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <span>Real-Time Autonomous System Preview</span>
            </h2>
            <p className="text-xs text-slate-400">Live synchronized sensor perception and digital SLAM occupancy grid</p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>Open Full Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Live RGB + YOLO HUD Stream</span>
              </span>
              <span className="text-[10px] text-slate-500">Includes Bounding Boxes & Distance</span>
            </div>
            <CameraHUD compact={true} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Live SLAM 2D Navigation Radar</span>
              </span>
              <span className="text-[10px] text-slate-500">Interactive: Click to dispatch</span>
            </div>
            <SlamMapCanvas compact={true} interactive={true} />
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>Autonomous Robotics Capabilities</span>
          </h2>
          <p className="text-xs text-slate-400">Deep technical competencies integrated into the VisionX software architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {cap.tag}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-100">{cap.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. High-Level Architecture Flow */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>End-to-End System Architecture</span>
            </h2>
            <p className="text-xs text-slate-400">Edge-to-cloud robotics pipeline with real-time perception-to-action feedback loops</p>
          </div>
          <button
            onClick={() => onNavigate('architecture')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>View ROS 2 Nodes & Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Pipeline Flowchart */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">1. SENSORS</span>
            <div className="font-bold text-cyan-400">Camera + LiDAR + IMU</div>
            <div className="text-[10px] text-slate-400">RealSense & RPLiDAR</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">2. PERCEPTION</span>
            <div className="font-bold text-indigo-400">YOLOv8 DeepNet</div>
            <div className="text-[10px] text-slate-400">Object & Person ID</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">3. FUSION</span>
            <div className="font-bold text-blue-400">Spatial Depth Net</div>
            <div className="text-[10px] text-slate-400">Point Cloud Matching</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">4. DECISION</span>
            <div className="font-bold text-amber-400">AI Decision Engine</div>
            <div className="text-[10px] text-slate-400">Risk & Reroute Logic</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">5. NAVIGATION</span>
            <div className="font-bold text-emerald-400">Nav2 / SLAM</div>
            <div className="text-[10px] text-slate-400">A* & TEB Trajectory</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">6. ACTUATION</span>
            <div className="font-bold text-pink-400">Motor Drivers</div>
            <div className="text-[10px] text-slate-400">Differential Cmd_Vel</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[9px] text-slate-500">7. TELEMETRY</span>
            <div className="font-bold text-cyan-400">Web Dashboard</div>
            <div className="text-[10px] text-slate-400">WebSocket & MQTT</div>
          </div>
        </div>
      </section>

      {/* 5. Technology Stack Badges */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <span>Industrial Tech Stack</span>
          </h2>
          <p className="text-xs text-slate-400">Proven technologies engineered for low latency, determinism, and safety</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {techStack.map((tech, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="font-bold text-xs text-cyan-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tech.name}</span>
              </div>
              <p className="text-[11px] text-slate-400">{tech.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Use Cases */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Target Deployments & Use Cases</span>
          </h2>
          <p className="text-xs text-slate-400">Deployable across complex, real-world commercial and industrial sectors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((uc, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">{uc.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {uc.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
