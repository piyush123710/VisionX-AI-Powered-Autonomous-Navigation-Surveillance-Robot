import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './backend/api/routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// JSON body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Mount Robotics & VLM API router under /api
app.use('/api', apiRouter);

// Serve Vite production build artifacts if present
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other GET requests to index.html for SPA client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode where dist might not exist yet, return lightweight status
      res.status(200).send('VisionX Backend Server is Running. In development, access the Vite frontend.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[VisionX] Backend & Telemetry Server listening on port ${PORT}`);
  console.log(`[VisionX] API endpoints available at http://localhost:${PORT}/api/health`);
});

export default app;
