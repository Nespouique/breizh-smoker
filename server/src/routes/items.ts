import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/items - List items (optionally filtered by smoke_id)
router.get('/', async (req, res) => {
  try {
    const smokeId = req.query.smoke_id ? parseInt(req.query.smoke_id as string) : undefined;
    const items = await prisma.item.findMany({
      where: smokeId ? { smoke_id: smokeId } : undefined,
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items - Create item
router.post('/', async (req, res) => {
  try {
    const item = await prisma.item.create({
      data: {
        smoke_id: req.body.smoke_id,
        name: req.body.name,
        type: req.body.type,
        icon: req.body.icon,
        cut: req.body.cut,
        initial_weight: req.body.initial_weight,
        diameter: req.body.diameter,
        target_weight: req.body.target_weight,
        curing_method: req.body.curing_method,
        status: req.body.status || 'prep',
        salt_amount: req.body.salt_amount,
        sugar_amount: req.body.sugar_amount,
        pepper_amount: req.body.pepper_amount,
        spices: req.body.spices,
        curing_start_date: req.body.curing_start_date,
        curing_end_date: req.body.curing_end_date,
        rinsing_date: req.body.rinsing_date,
        drying_start_date: req.body.drying_start_date,
        smoking_date: req.body.smoking_date,
        aging_start_date: req.body.aging_start_date
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: req.body.name,
        type: req.body.type,
        icon: req.body.icon,
        cut: req.body.cut,
        initial_weight: req.body.initial_weight,
        diameter: req.body.diameter,
        target_weight: req.body.target_weight,
        curing_method: req.body.curing_method,
        status: req.body.status,
        salt_amount: req.body.salt_amount,
        sugar_amount: req.body.sugar_amount,
        pepper_amount: req.body.pepper_amount,
        spices: req.body.spices,
        curing_start_date: req.body.curing_start_date,
        curing_end_date: req.body.curing_end_date,
        rinsing_date: req.body.rinsing_date,
        drying_start_date: req.body.drying_start_date,
        smoking_date: req.body.smoking_date,
        aging_start_date: req.body.aging_start_date
      }
    });
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.item.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
