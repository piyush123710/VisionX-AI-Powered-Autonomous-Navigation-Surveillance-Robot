# VisionX Autonomous Robot — Backend Architecture

The VisionX platform backend is organized into two distinct layers:

```
backend/
├── server.ts                       # Node.js / Express Web & Telemetry API Gateway
├── api/
│   ├── routes.ts                   # REST API routes (/api/robot/*, /api/vlm/*)
│   └── gemini.ts                   # Server-side @google/genai VLM integration
└── ros2_ws/                        # Embedded Onboard Edge Robotics ROS 2 Workspace
    ├── package.xml                 # ROS 2 Package Manifest (Humble Hawksbill)
    ├── CMakeLists.txt              # Colcon Build Configuration
    └── src/
        ├── vision_perception/
        │   └── vision_node.py      # RealSense D435i + YOLOv8 TensorRT Perception
        ├── navigation/
        │   └── nav2_commander.py   # Nav2 Simple Commander & Trajectory Controller
        ├── telemetry_bridge/
        │   └── mqtt_bridge.py      # ROS 2 to Web Dashboard WebSocket / MQTT Bridge
        └── motor_driver/
            └── cmd_vel_controller.py# Differential Drive Motor PWM / CAN Bus Driver
```

---

## 1. Node.js & Express API Gateway (`backend/server.ts`)
Provides the bridge between browser clients and the robot:
- **`POST /api/vlm/ask`**: Server-side multimodal Vision-Language reasoning powered by `@google/genai` (Gemini 3.8 Flash).
- **`GET /api/robot/telemetry`**: Live sensor fusion stream (LiDAR, ultrasonic, IMU, battery BMS, RTK-GPS).
- **`POST /api/robot/cmd_vel`**: Dispatches linear and angular velocity commands to onboard motor drivers.
- **`POST /api/robot/waypoint`**: Dispatches target navigation coordinates to Nav2.
- **`POST /api/robot/emergency_stop`**: Immediate hardware safety interlock.

## 2. Onboard ROS 2 Robotics Workspace (`backend/ros2_ws/`)
Runs on the NVIDIA Jetson Orin Nano / AGX edge computer:
- **`vision_node.py`**: Subscribes to `/camera/color/image_raw` and `/camera/aligned_depth_to_color/image_raw`, executes YOLOv8x inference via TensorRT FP16, and calculates 3D Euclidean coordinates.
- **`nav2_commander.py`**: Interacts with the Nav2 Action Server (`navigate_to_pose`) and handles real-time dynamic obstacle avoidance.
- **`mqtt_bridge.py`**: Serializes ROS 2 topics (`/odom`, `/scan`, `/visionx/detected_objects`) to WebSockets with sub-25ms latency.
- **`cmd_vel_controller.py`**: Translates `/cmd_vel` geometry messages into dual-channel PWM / CAN bus commands for brushless DC traction motors.
