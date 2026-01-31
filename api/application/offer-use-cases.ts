import { OfferRepository, Offer } from '../domain/offer.js';
import { TripRepository } from '../domain/trip.js';

export class CreateOfferUseCase {
  constructor(private offerRepository: OfferRepository) {}

  async execute(input: {
    trip_id: string;
    driver_id: string;
    price: number;
    estimated_time?: number;
    is_counter_offer: boolean;
  }) {
    return this.offerRepository.create(input);
  }
}

export class GetTripOffersUseCase {
  constructor(private offerRepository: OfferRepository) {}

  async execute(tripId: string) {
    return this.offerRepository.findByTripId(tripId);
  }
}

export class AcceptOfferUseCase {
  constructor(
    private offerRepository: OfferRepository,
    private tripRepository: TripRepository
  ) {}

  async execute(offerId: string) {
    // 1. Mark offer as accepted
    const offer = await this.offerRepository.acceptOffer(offerId);

    // 2. Assign driver to trip and update trip status
    await this.tripRepository.assignDriver(offer.trip_id, offer.driver_id, offer.price);

    return offer;
  }
}
