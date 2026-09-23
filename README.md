# VisionX — AI-Powered Autonomous Navigation & Surveillance Robot

[![Live Demo](https://img.shields.io/badge/Live%20Demo-VisionX%20Dashboard-06b6d4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/)
[![ROS 2](https://img.shields.io/badge/ROS_2-Humble_Hawksbill-22c55e?style=for-the-badge&logo=ros&logoColor=white)](https://docs.ros.org/en/humble/)
[![Edge AI](https://img.shields.io/badge/Edge_AI-TensorRT_%7C_YOLOv8-f59e0b?style=for-the-badge&logo=nvidia&logoColor=white)](https://developer.nvidia.com/tensorrt)
[![Gemini 3.8](https://img.shields.io/badge/VLM-Gemini_3.8_Flash-3b82f6?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Device Support](https://img.shields.io/badge/Responsive-Mobile_%26_Laptop-8b5cf6?style=for-the-badge)](https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/)

**VisionX** is a production-grade autonomous robotics platform and command center designed for precision navigation, spatial perception, multi-sensor telemetry, and real-time vision-language reasoning. Built for deployment on NVIDIA Jetson edge compute and accessible across both **smartphones and laptops/desktops**.

🔗 **Live Platform URL**: [https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/](https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/)

---

## 🌟 Key Features

* **Live Teleoperation & Responsive Controls**:
  * **Laptop/Desktop**: Precision keyboard controls (**W, A, S, D**, `Space` for Brake) with dynamic linear/angular throttle meters.
  * **Mobile & Tablet**: Touch-optimized directional D-Pad, safe-area gestures, thumb-friendly bottom navigation bar, and slide-out module drawer.
* **Multimodal AI Vision & VLM Reasoning**:
  * Real-time spatial tracking with YOLOv8x TensorRT FP16 (70+ FPS).
  * 3D Euclidean depth projection via Intel RealSense D435i aligned depth streams.
  * Natural language spatial reasoning via server-side **Google Gemini 3.8 Flash** (`@google/genai`), grounded in live LiDAR clearance, bearing, and obstacle coordinates.
* **Autonomous 2D SLAM & Nav2 Path Planning**:
  * Real-time occupancy grid mapping with A* global planning and TEB local trajectory optimization.
  * Interactive Click/Touch-to-Goal waypoint dispatching directly on the SLAM canvas.
* **Full-Sensor Telemetry Fusion**:
  * 360° RPLiDAR A3 point cloud simulation (16m range, 0.22° angular resolution).
  * 6-axis MPU-9250 IMU pitch/roll/yaw attitude indicators.
  * 4-quadrant ultrasonic proximity array with distance warnings.
  * 24V 30Ah LiFePO4 Smart BMS monitoring (cell balance, discharge rates, temperature).
  * RTK-GPS centimeter-level geolocation tracking.
* **Industrial Safety & Mission Control**:
  * Instant hardware/software Emergency Stop (`E-STOP`) interlock.
  * Multi-waypoint mission scheduler, queue manager, and live autonomous mission execution.
  * Historical mission recording with timeline scrubbing and event replay.
  * Role-Based Access Control (**Admin**, **Operator**, **Viewer**).

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────────────┐
                               │     VisionX Web & Mobile Dashboard     │
                               │   (React 19 + TypeScript + Tailwind)   │
                               └──────────────────┬─────────────────────┘
                                                  │ HTTP / WebSocket
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │   Express.js API Gateway (server.ts)   │
                               │  - /api/vlm/ask (Gemini 3.8 Flash)     │
                               │  - /api/robot/cmd_vel & /telemetry     │
                               └──────────────────┬─────────────────────┘
                                                  │ ROS 2 DDS / rosbridge
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
┌───────────────────────────────┐                                   ┌───────────────────────────────┐
│     vision_perception_node    │                                   │       nav2_commander          │
│ - Intel RealSense D435i RGB-D │                                   │ - Nav2 Simple Commander       │
│ - TensorRT YOLOv8 + ByteTrack │                                   │ - Global & Local Costmaps     │
│ - 3D Camera Coordinate De-proj│                                   │ - Dynamic Obstacle Avoidance  │
└───────────────┬───────────────┘                                   └───────────────┬───────────────┘
                │                                                                   │
                │ /visionx/detected_objects                                         │ /cmd_vel
                └───────────────────────────────┬───────────────────────────────────┘
                                                ▼
                                ┌───────────────────────────────┐
                                │      cmd_vel_controller       │
                                │ - Differential Drive Kinematics│
                                │ - RoboClaw 2x30A Dual BLDC    │
                                │ - Closed-Loop PID Odometry    │
                                └───────────────────────────────┘
```

---

## 📂 Repository Structure

```
.
├── README.md                      # Comprehensive project documentation (This file)
├── server.ts                      # Node.js & Express API Gateway & WebSocket entry point
├── package.json                   # Dependencies, scripts, and runtime configuration
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler with embedded API server proxy
├── index.html                     # Responsive HTML5 entry with mobile safe-area meta tags
│
├── backend/                       # Backend architecture layer
│   ├── README.md                  # Backend & ROS 2 setup guide
│   ├── server.ts                  # Backend server re-export
│   ├── api/
│   │   ├── routes.ts              # REST API routes (/api/robot/*, /api/vlm/*)
│   │   └── gemini.ts              # Server-side @google/genai VLM integration
│   └── ros2_ws/                   # Production ROS 2 Humble edge robotics workspace
│       ├── package.xml            # ROS 2 package manifest
│       ├── CMakeLists.txt         # Ament CMake build script
│       └── src/
│           ├── vision_perception/ # vision_node.py (YOLOv8 + RealSense D435i)
│           ├── navigation/        # nav2_commander.py (Nav2 action goals)
│           ├── telemetry_bridge/  # mqtt_bridge.py (Telemetry WebSocket gateway)
│           └── motor_driver/      # cmd_vel_controller.py (Differential drive motor driver)
│
└── src/                           # Frontend application source
    ├── main.tsx                   # React root mount
    ├── App.tsx                    # Master responsive layout with mobile drawer
    ├── index.css                  # Global Tailwind v4 styling
    ├── context/
    │   └── RobotContext.tsx       # Centralized telemetry, sensor, and state store
    ├── types/
    │   └── robot.ts               # Complete TypeScript robotics interfaces
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx         # Responsive telemetry header & E-STOP toggle
    │   │   ├── NavigationSidebar.tsx # Desktop persistent sidebar + mobile slide-out drawer
    │   │   └── MobileBottomNav.tsx# Mobile thumb-friendly quick navigation bar
    │   ├── common/
    │   │   ├── CameraHUD.tsx      # Interactive RealSense video feed with bounding boxes
    │   │   ├── SlamMapCanvas.tsx  # Interactive 2D SLAM canvas with click/touch-to-goal
    │   │   └── VlmQueryPanel.tsx  # Natural language VLM assistant panel
    │   └── views/
    │       ├── LandingPage.tsx    # Robot overview, specs, and feature showcase
    │       ├── DashboardView.tsx  # High-density operational cockpit
    │       ├── NavigationMapView.tsx # Full SLAM navigation and waypoint controls
    │       ├── AiVisionView.tsx   # Camera feed with YOLOv8 inference & VLM chat
    │       ├── RobotControlView.tsx # Manual teleoperation & D-Pad driving
    │       ├── SensorsView.tsx    # Detailed hardware sensor diagnostics
    │       ├── SystemHealthView.tsx# CPU, GPU, memory, and thermal telemetry
    │       ├── MissionControlView.tsx # Autonomous mission queue builder
    │       ├── AnalyticsView.tsx  # Operational uptime & distance metrics
    │       ├── MissionReplayView.tsx # Historical playback & incident analysis
    │       ├── ArchitectureView.tsx # Interactive ROS 2 code & node explorer
    │       ├── AlertsView.tsx     # Faults, warnings, and safety log
    │       └── SettingsView.tsx   # Network, ROS bridge, and drive tuning
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later
* **npm**: v9.0.0 or later
* *(Optional)* **Gemini API Key**: Set `GEMINI_API_KEY` for live AI multimodal reasoning.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/visionx-robotics.git
   cd visionx-robotics
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```

4. **Start the development environment**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build and run for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and ROS node status |
| `GET` | `/api/robot/telemetry` | Real-time odometry, battery BMS, and sensor readings |
| `POST` | `/api/robot/cmd_vel` | Dispatch linear and angular motor velocities |
| `POST` | `/api/robot/waypoint` | Send target coordinates to the Nav2 action server |
| `POST` | `/api/robot/emergency_stop` | Engage immediate safety brake interlock |
| `POST` | `/api/vlm/ask` | Server-side Gemini 3.8 Flash multimodal reasoning |

---

## 🤖 Hardware Specifications

| Component | Hardware Specification |
|---|---|
| **Edge Compute** | NVIDIA Jetson Orin Nano (40 TOPS) / AGX Orin |
| **Operating System** | Ubuntu 22.04 LTS with ROS 2 Humble Hawksbill |
| **Vision Sensor** | Intel RealSense D435i (Stereo Depth + RGB + IMU) |
| **Range Sensor** | Slamtec RPLiDAR A3 360° (16m range, 16kHz sampling) |
| **Ultrasonic Array** | 4x HC-SR04 ultrasonic distance sensors (15° field) |
| **Motor Controller** | RoboClaw 2x30A Motor Driver (USB / CAN interface) |
| **Traction System** | Dual 24V Brushless DC Planetary Geared Motors |
| **Wheel Diameter** | 165mm All-Terrain Pneumatic Wheels (0.44m track width) |
| **Battery Pack** | 24V 30Ah LiFePO4 (8S BMS with cell-level telemetry) |
| **Geolocation** | U-Blox ZED-F9P RTK-GPS (Centimeter-level accuracy) |

---

## 📱 Mobile & Laptop Compatibility

VisionX is engineered with an adaptive viewport strategy:
* **Smartphones & Tablets**: Touch-to-goal navigation, zero-delay touch driving D-Pad (`touch-manipulation`), safe-area insets, mobile bottom bar, and collapsible navigation drawer.
* **Laptops & Desktops**: Full-screen telemetry cockpit, multi-column data views, keyboard teleoperation, and live code inspection.

---

## 📄 License & Maintainers

* **Platform**: VisionX Autonomous Robotics Stack
* **License**: [Apache-2.0](./LICENSE)
* **Lead Engineer**: VisionX Robotics Core Team
* **Live Deployment**: [https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/](https://visionx-ai-powered-autonomous-navigation-surveill.ai.studio/)
