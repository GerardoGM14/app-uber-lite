import { Router } from 'express';
import { TripController } from '../interface/trip-controller.js';

const router = Router();
const tripController = new TripController();

router.post('/create', (req, res) => tripController.create(req, res));
router.get('/nearby', (req, res) => tripController.getNearby(req, res));
router.get('/:id', (req, res) => tripController.getDetails(req, res));
router.patch('/:id/status', (req, res) => tripController.updateStatus(req, res));

export default router;
