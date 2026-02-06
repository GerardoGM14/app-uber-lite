export interface User {
  id: string;
  email: string;
  name: string;
  role: 'passenger' | 'driver' | 'admin';
  phone?: string | null;
  password_hash: string;
  rating_avg: number;
  is_active: boolean;
  created_at: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'created_at' | 'rating_avg' | 'is_active' | 'rating_count' | 'updated_at'>): Promise<User>;
  findById(id: string): Promise<User | null>;
}
