import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/smokes - List all smokes
router.get('/', async (_, res) => {
  try {
    const smokes = await prisma.smoke.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(smokes);
  } catch (error) {
    console.error('Error fetching smokes:', error);
    res.status(500).json({ error: 'Failed to fetch smokes' });
  }
});

// GET /api/smokes/:id - Get single smoke
router.get('/:id', async (req, res) => {
  try {
    const smoke = await prisma.smoke.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!smoke) {
      return res.status(404).json({ error: 'Smoke not found' });
    }
    res.json(smoke);
  } catch (error) {
    console.error('Error fetching smoke:', error);
    res.status(500).json({ error: 'Failed to fetch smoke' });
  }
});

// POST /api/smokes - Create smoke
router.post('/', async (req, res) => {
  try {
    const { name, notes } = req.body;
    const smoke = await prisma.smoke.create({
      data: { name, notes: notes || '' }
    });
    res.status(201).json(smoke);
  } catch (error) {
    console.error('Error creating smoke:', error);
    res.status(500).json({ error: 'Failed to create smoke' });
  }
});

// PUT /api/smokes/:id - Update smoke
router.put('/:id', async (req, res) => {
  try {
    const { name, notes } = req.body;
    const smoke = await prisma.smoke.update({
      where: { id: parseInt(req.params.id) },
      data: { name, notes }
    });
    res.json(smoke);
  } catch (error) {
    console.error('Error updating smoke:', error);
    res.status(500).json({ error: 'Failed to update smoke' });
  }
});

export default router;
