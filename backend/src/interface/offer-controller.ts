import { Request, Response } from 'express';
import { CreateOfferUseCase, GetTripOffersUseCase, AcceptOfferUseCase } from '../application/offer-use-cases.js';
import { PrismaOfferRepository } from '../infrastructure/database/offer-repository.js';
import { PrismaTripRepository } from '../infrastructure/database/trip-repository.js';
import { createOfferSchema, acceptOfferSchema } from './schemas.js';

const offerRepository = new PrismaOfferRepository();
const tripRepository = new PrismaTripRepository();
const createOfferUseCase = new CreateOfferUseCase(offerRepository);
const getTripOffersUseCase = new GetTripOffersUseCase(offerRepository);
const acceptOfferUseCase = new AcceptOfferUseCase(offerRepository, tripRepository);

export class OfferController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createOfferSchema.parse(req.body);
      const result = await createOfferUseCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getByTrip(req: Request, res: Response) {
    try {
      const { tripId } = req.params;
      const result = await getTripOffersUseCase.execute(tripId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const validatedData = acceptOfferSchema.parse(req.body);
      const result = await acceptOfferUseCase.execute(validatedData.offer_id);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}
