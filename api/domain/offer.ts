import { User } from './user.js';
import { Trip } from './trip.js';

export interface Offer {
  id: string;
  trip_id: string;
  driver_id: string;
  price: number;
  estimated_time?: number | null;
  is_counter_offer: boolean;
  is_accepted: boolean;
  created_at: Date;
  trip?: Trip;
  driver?: User;
}

export interface OfferRepository {
  create(offer: Omit<Offer, 'id' | 'created_at' | 'is_accepted' | 'trip' | 'driver'>): Promise<Offer>;
  findByTripId(tripId: string): Promise<Offer[]>;
  acceptOffer(offerId: string): Promise<Offer>;
}
