import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/weight-logs - List weight logs (filtered by item_id)
router.get('/', async (req, res) => {
  try {
    const itemId = req.query.item_id ? parseInt(req.query.item_id as string) : undefined;
    const logs = await prisma.weightLog.findMany({
      where: itemId ? { item_id: itemId } : undefined,
      orderBy: { date: 'asc' }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    res.status(500).json({ error: 'Failed to fetch weight logs' });
  }
});

// POST /api/weight-logs - Create weight log(s)
router.post('/', async (req, res) => {
  try {
    // Support both single object and array
    const data = Array.isArray(req.body) ? req.body : [req.body];

    const logs = await prisma.weightLog.createManyAndReturn({
      data: data.map((log: { item_id: number; weight: number; date?: string }) => ({
        item_id: log.item_id,
        weight: log.weight,
        date: log.date ? new Date(log.date) : new Date()
      }))
    });

    res.status(201).json(logs);
  } catch (error) {
    console.error('Error creating weight log:', error);
    res.status(500).json({ error: 'Failed to create weight log' });
  }
});

// DELETE /api/weight-logs/:id - Delete weight log
router.delete('/:id', async (req, res) => {
  try {
    await prisma.weightLog.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting weight log:', error);
    res.status(500).json({ error: 'Failed to delete weight log' });
  }
});

export default router;
