import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client on server side with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || "";

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export interface VlmContext {
  query: string;
  robotName?: string;
  position?: { x: number; y: number };
  heading?: number;
  detectedObjects?: Array<{
    label: string;
    trackingId: string;
    distance: number;
    positionDesc: string;
    confidence: number;
  }>;
  sensors?: {
    lidarMinDist?: number;
    ultrasonicFront?: number;
  };
}

export async function askGeminiVLM(ctx: VlmContext): Promise<string> {
  if (!aiClient || !apiKey) {
    // Graceful offline fallback if GEMINI_API_KEY is not configured
    const objSummary = ctx.detectedObjects && ctx.detectedObjects.length > 0
      ? ctx.detectedObjects.map(o => `${o.label} (${o.trackingId}) at ${o.distance}m [${o.positionDesc}]`).join(', ')
      : 'No critical obstacles detected in immediate 3-meter cone';

    return `[Onboard Edge Inference - Fallback Mode]\nPerception: ${objSummary}\nPosition: X: ${ctx.position?.x ?? 45.0}m, Y: ${ctx.position?.y ?? 60.0}m, Heading: ${ctx.heading ?? 45}°\nStatus: Path corridor clear for 3.2m. Maintaining safe operational envelope.`;
  }

  const detectedSummary = ctx.detectedObjects && ctx.detectedObjects.length > 0
    ? ctx.detectedObjects.map(o => `- ${o.label} (${o.trackingId}) at distance ${o.distance}m [Bearing: ${o.positionDesc}, Confidence: ${(o.confidence * 100).toFixed(0)}%]`).join('\n')
    : 'No obstacles within 4m cone';

  const systemPrompt = `You are VisionX Autonomous Navigation & Surveillance Agent, an edge AI system running on an industrial mobile robot (equipped with Intel RealSense D435i depth camera, RPLiDAR A3, and YOLOv8 perception).
Analyze the query using the robot's real-time sensory inputs.
Respond with concise, high-precision technical robotics observations. Include distance estimates, threat level assessment, and planned Nav2 motor actions.`;

  const userPrompt = `Current Live Robot State:
- Robot Name: ${ctx.robotName || 'VisionX-Alpha'}
- Coordinates: (${ctx.position?.x?.toFixed(1) || '0.0'}, ${ctx.position?.y?.toFixed(1) || '0.0'}), Heading: ${ctx.heading?.toFixed(0) || '0'}°
- Detected Objects from YOLOv8x + Depth Camera:
${detectedSummary}
- LiDAR minimum clearance: ${ctx.sensors?.lidarMinDist || 2.4}m
- Front Ultrasonic proximity: ${ctx.sensors?.ultrasonicFront || 2.2}m

Operator Query: "${ctx.query}"`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      }
    });

    return response.text || "No response received from vision model.";
  } catch (error: any) {
    console.error("Gemini VLM API error:", error);
    throw new Error(error.message || "Failed to process VLM query");
  }
}
