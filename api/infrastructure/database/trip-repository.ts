import prisma from './prisma-client.js';
import { Trip, TripRepository } from '../../domain/trip.js';

export class PrismaTripRepository implements TripRepository {
  async create(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'status' | 'passenger' | 'driver'>): Promise<Trip> {
    const trip = await prisma.trip.create({
      data: {
        passenger_id: tripData.passenger_id,
        pickup_lat: tripData.pickup_lat,
        pickup_lng: tripData.pickup_lng,
        pickup_address: tripData.pickup_address,
        dropoff_lat: tripData.dropoff_lat,
        dropoff_lng: tripData.dropoff_lng,
        dropoff_address: tripData.dropoff_address,
        proposed_price: tripData.proposed_price,
        status: 'CREATED',
        has_pets: tripData.has_pets,
        more_than_four: tripData.more_than_four,
        notes: tripData.notes,
        type: tripData.type,
      },
      include: { passenger: true },
    });
    return this.mapToDomain(trip);
  }

  async findById(id: string): Promise<Trip | null> {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { passenger: true, driver: true },
    });
    if (!trip) return null;
    return this.mapToDomain(trip);
  }

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<Trip[]> {
    // SQLite implementation: fetch all active trips and filter in JS
    const activeTrips = await prisma.trip.findMany({
      where: {
        status: { in: ['CREATED', 'PUBLISHED'] },
      },
      include: { passenger: true },
    });

    return activeTrips
      .map(this.mapToDomain)
      .filter((trip) => {
        const distance = this.calculateDistance(lat, lng, trip.pickup_lat, trip.pickup_lng);
        return distance <= radiusKm;
      });
  }

  async updateStatus(id: string, status: Trip['status']): Promise<Trip> {
    const trip = await prisma.trip.update({
      where: { id },
      data: { status },
      include: { passenger: true, driver: true },
    });
    return this.mapToDomain(trip);
  }

  async assignDriver(id: string, driverId: string, finalPrice: number): Promise<Trip> {
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        driver_id: driverId,
        final_price: finalPrice,
        status: 'ASSIGNED',
      },
      include: { passenger: true, driver: true },
    });
    return this.mapToDomain(trip);
  }

  private mapToDomain(prismaTrip: any): Trip {
    return {
      id: prismaTrip.id,
      passenger_id: prismaTrip.passenger_id,
      driver_id: prismaTrip.driver_id,
      pickup_lat: Number(prismaTrip.pickup_lat),
      pickup_lng: Number(prismaTrip.pickup_lng),
      pickup_address: prismaTrip.pickup_address,
      dropoff_lat: Number(prismaTrip.dropoff_lat),
      dropoff_lng: Number(prismaTrip.dropoff_lng),
      dropoff_address: prismaTrip.dropoff_address,
      proposed_price: Number(prismaTrip.proposed_price),
      final_price: prismaTrip.final_price ? Number(prismaTrip.final_price) : null,
      status: prismaTrip.status as Trip['status'],
      has_pets: prismaTrip.has_pets,
      more_than_four: prismaTrip.more_than_four,
      notes: prismaTrip.notes,
      type: prismaTrip.type as Trip['type'],
      created_at: prismaTrip.created_at,
      updated_at: prismaTrip.updated_at,
      passenger: prismaTrip.passenger ? {
        ...prismaTrip.passenger,
        rating_avg: Number(prismaTrip.passenger.rating_avg),
        role: prismaTrip.passenger.role as any
      } : undefined,
      driver: prismaTrip.driver ? {
        ...prismaTrip.driver,
        rating_avg: Number(prismaTrip.driver.rating_avg),
        role: prismaTrip.driver.role as any
      } : undefined,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
