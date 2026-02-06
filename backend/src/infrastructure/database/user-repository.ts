import prisma from './prisma-client.js';
import { User, UserRepository } from '../../domain/user.js';
import { Decimal } from '@prisma/client/runtime/library';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'rating_avg' | 'is_active' | 'rating_count' | 'updated_at'>): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password_hash: userData.password_hash,
        role: userData.role,
        phone: userData.phone,
      },
    });
    return this.mapToDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  private mapToDomain(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role as 'passenger' | 'driver' | 'admin',
      phone: prismaUser.phone,
      password_hash: prismaUser.password_hash,
      rating_avg: Number(prismaUser.rating_avg),
      is_active: prismaUser.is_active,
      created_at: prismaUser.created_at,
    };
  }
}
