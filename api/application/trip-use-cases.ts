import { TripRepository, Trip } from '../domain/trip.js';

export class CreateTripUseCase {
  constructor(private tripRepository: TripRepository) {}

  async execute(input: {
    passenger_id: string;
    pickup_lat: number;
    pickup_lng: number;
    pickup_address: string;
    dropoff_lat: number;
    dropoff_lng: number;
    dropoff_address: string;
    proposed_price: number;
    has_pets: boolean;
    more_than_four: boolean;
    notes?: string;
    type: 'trip' | 'delivery';
  }) {
    return this.tripRepository.create(input);
  }
}

export class GetNearbyTripsUseCase {
  constructor(private tripRepository: TripRepository) {}

  async execute(lat: number, lng: number, radiusKm: number = 5) {
    return this.tripRepository.findNearby(lat, lng, radiusKm);
  }
}

export class GetTripDetailsUseCase {
  constructor(private tripRepository: TripRepository) {}

  async execute(id: string) {
    return this.tripRepository.findById(id);
  }
}
