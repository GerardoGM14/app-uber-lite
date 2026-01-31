import { Router } from 'express';
import { OfferController } from '../interface/offer-controller.js';

const router = Router();
const offerController = new OfferController();

router.post('/create', (req, res) => offerController.create(req, res));
router.get('/by-trip/:tripId', (req, res) => offerController.getByTrip(req, res));
router.post('/accept', (req, res) => offerController.accept(req, res));

export default router;
