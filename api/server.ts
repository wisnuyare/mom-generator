import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { router } from './routes.js';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(helmet());
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
app.use(express.static(path.join(__dirname, '../web/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`MOM Generator server running on port ${PORT}`);
});

export { app };