import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['passenger', 'driver', 'admin']),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createTripSchema = z.object({
  passenger_id: z.string().uuid(),
  pickup_lat: z.number(),
  pickup_lng: z.number(),
  pickup_address: z.string(),
  dropoff_lat: z.number(),
  dropoff_lng: z.number(),
  dropoff_address: z.string(),
  proposed_price: z.number().positive(),
  has_pets: z.boolean().default(false),
  more_than_four: z.boolean().default(false),
  notes: z.string().optional(),
  type: z.enum(['trip', 'delivery']).default('trip'),
});

export const nearbyTripsSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(5),
});

export const createOfferSchema = z.object({
  trip_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  price: z.number().positive(),
  estimated_time: z.number().int().optional(),
  is_counter_offer: z.boolean().default(false),
});

export const acceptOfferSchema = z.object({
  offer_id: z.string().uuid(),
});

