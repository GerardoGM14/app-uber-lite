import { Request, Response } from 'express';
import { CreateTripUseCase, GetNearbyTripsUseCase, GetTripDetailsUseCase } from '../application/trip-use-cases.js';
import { PrismaTripRepository } from '../infrastructure/database/trip-repository.js';
import { createTripSchema, nearbyTripsSchema } from './schemas.js';

const tripRepository = new PrismaTripRepository();
const createTripUseCase = new CreateTripUseCase(tripRepository);
const getNearbyTripsUseCase = new GetNearbyTripsUseCase(tripRepository);
const getTripDetailsUseCase = new GetTripDetailsUseCase(tripRepository);

export class TripController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createTripSchema.parse(req.body);
      const result = await createTripUseCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getNearby(req: Request, res: Response) {
    try {
      const validatedQuery = nearbyTripsSchema.parse(req.query);
      const result = await getNearbyTripsUseCase.execute(validatedQuery.lat, validatedQuery.lng, validatedQuery.radius);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await getTripDetailsUseCase.execute(id);
      if (!result) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      // In a real app, use a use case for this
      const result = await tripRepository.updateStatus(id, status);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
