import { Router, Request, Response } from 'express';
import { askGeminiVLM, VlmContext } from './gemini';

export const apiRouter = Router();

// In-memory robot telemetry state buffer
const robotTelemetry = {
  robotId: 'ROB-VX-9021',
  name: 'VisionX-Alpha',
  mode: 'autonomous',
  status: 'online',
  speed: 1.15,
  heading: 45.2,
  position: { x: 45.2, y: 62.1 },
  battery: {
    percentage: 82,
    voltage: 25.4,
    health: 98,
    tempC: 38.6
  },
  sensors: {
    lidarMinDist: 1.84,
    ultrasonicFront: 1.82,
    imuPitch: 0.4,
    imuRoll: -0.2
  },
  lastHeartbeat: Date.now()
};

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now(),
    robotId: robotTelemetry.robotId,
    services: {
      perception_node: 'active',
      nav2_action_server: 'active',
      telemetry_bridge: 'active',
      gemini_vlm: process.env.GEMINI_API_KEY ? 'ready' : 'fallback'
    }
  });
});

// Telemetry state endpoint
apiRouter.get('/robot/telemetry', (_req: Request, res: Response) => {
  robotTelemetry.lastHeartbeat = Date.now();
  res.json(robotTelemetry);
});

// Motor velocity command endpoint (/cmd_vel)
apiRouter.post('/robot/cmd_vel', (req: Request, res: Response) => {
  const { linear, angular } = req.body;
  
  if (typeof linear !== 'number' || typeof angular !== 'number') {
    return res.status(400).json({ error: 'Linear and angular velocities must be numbers' });
  }

  // Update in-memory speed & publish to ROS 2 in physical deployment
  robotTelemetry.speed = Math.abs(linear);
  res.json({
    success: true,
    dispatched: { linear, angular },
    timestamp: Date.now()
  });
});

// Waypoint dispatch endpoint
apiRouter.post('/robot/waypoint', (req: Request, res: Response) => {
  const { x, y, label } = req.body;
  if (typeof x !== 'number' || typeof y !== 'number') {
    return res.status(400).json({ error: 'Coordinates x and y must be numbers' });
  }

  res.json({
    success: true,
    action: 'Nav2 Action Goal Created',
    target: { x, y, label: label || 'Custom Waypoint' },
    status: 'executing'
  });
});

// Emergency stop endpoint
apiRouter.post('/robot/emergency_stop', (_req: Request, res: Response) => {
  robotTelemetry.status = 'emergency_stop';
  robotTelemetry.speed = 0;
  res.json({
    success: true,
    status: 'EMERGENCY_STOP_ACTIVATED',
    message: 'Zero velocity command pushed. Hardware brakes engaged.'
  });
});

// Server-side Gemini Vision-Language Model endpoint
apiRouter.post('/vlm/ask', async (req: Request, res: Response) => {
  try {
    const { query, robotName, position, heading, detectedObjects, sensors } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const context: VlmContext = {
      query,
      robotName,
      position,
      heading,
      detectedObjects,
      sensors
    };

    const answer = await askGeminiVLM(context);
    res.json({ success: true, answer, timestamp: Date.now() });
  } catch (err: any) {
    console.error('VLM endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate VLM answer' });
  }
});
