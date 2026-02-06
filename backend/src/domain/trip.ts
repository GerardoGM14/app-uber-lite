import { User } from './user.js';

export interface Trip {
  id: string;
  passenger_id: string;
  driver_id?: string | null;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  proposed_price: number;
  final_price?: number | null;
  status: 'CREATED' | 'PUBLISHED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  has_pets: boolean;
  more_than_four: boolean;
  notes?: string | null;
  type: 'trip' | 'delivery';
  created_at: Date;
  updated_at: Date;
  passenger?: User;
  driver?: User | null;
}

export interface TripRepository {
  create(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'status' | 'passenger' | 'driver'>): Promise<Trip>;
  findById(id: string): Promise<Trip | null>;
  findNearby(lat: number, lng: number, radiusKm: number): Promise<Trip[]>;
  updateStatus(id: string, status: Trip['status']): Promise<Trip>;
  assignDriver(id: string, driverId: string, finalPrice: number): Promise<Trip>;
  findByPassengerId(passengerId: string): Promise<Trip[]>;
}
