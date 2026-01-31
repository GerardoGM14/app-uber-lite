import prisma from './prisma-client.js';
import { Offer, OfferRepository } from '../../domain/offer.js';

export class PrismaOfferRepository implements OfferRepository {
  async create(offerData: Omit<Offer, 'id' | 'created_at' | 'is_accepted' | 'trip' | 'driver'>): Promise<Offer> {
    const offer = await prisma.offer.create({
      data: {
        trip_id: offerData.trip_id,
        driver_id: offerData.driver_id,
        price: offerData.price,
        estimated_time: offerData.estimated_time,
        is_counter_offer: offerData.is_counter_offer,
      },
      include: { driver: true },
    });
    return this.mapToDomain(offer);
  }

  async findByTripId(tripId: string): Promise<Offer[]> {
    const offers = await prisma.offer.findMany({
      where: { trip_id: tripId },
      include: { driver: true },
      orderBy: { created_at: 'desc' },
    });
    return offers.map(this.mapToDomain);
  }

  async acceptOffer(offerId: string): Promise<Offer> {
    const offer = await prisma.offer.update({
      where: { id: offerId },
      data: { is_accepted: true },
      include: { driver: true },
    });
    return this.mapToDomain(offer);
  }

  private mapToDomain(prismaOffer: any): Offer {
    return {
      id: prismaOffer.id,
      trip_id: prismaOffer.trip_id,
      driver_id: prismaOffer.driver_id,
      price: Number(prismaOffer.price),
      estimated_time: prismaOffer.estimated_time,
      is_counter_offer: prismaOffer.is_counter_offer,
      is_accepted: prismaOffer.is_accepted,
      created_at: prismaOffer.created_at,
      driver: prismaOffer.driver ? {
        ...prismaOffer.driver,
        rating_avg: Number(prismaOffer.driver.rating_avg),
        role: prismaOffer.driver.role as any
      } : undefined,
    };
  }
}
