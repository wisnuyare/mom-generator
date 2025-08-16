import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './routes.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '8081', 10);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://*.firebaseio.com",
        "https://oauth2.googleapis.com",
        "wss://*.firebaseio.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files from the React app build directory
// In Docker: /app/web/dist, In dev: ../web/dist relative to compiled server
const isDocker = process.env.NODE_ENV === 'production';
const staticPath = isDocker ? '/app/web/dist' : path.join(__dirname, '../web/dist');
const indexPath = isDocker ? '/app/web/dist/index.html' : path.join(__dirname, '../web/dist/index.html');

app.use(express.static(staticPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MOM Generator server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN}`);
});

// Graceful shutdown for Cloud Run
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app };