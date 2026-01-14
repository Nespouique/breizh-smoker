import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import smokesRouter from './routes/smokes.js';
import itemsRouter from './routes/items.js';
import weightLogsRouter from './routes/weight-logs.js';

const execAsync = promisify(exec);

const app = express();
const port = process.env.PORT || 3001;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/smokes', smokesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/weight-logs', weightLogsRouter);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    // Run migrations on startup
    console.log('Running database migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('Database migrations applied successfully');
  } catch (error) {
    console.error('Migration error:', error);
    // Continue anyway - migrations might already be applied
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
