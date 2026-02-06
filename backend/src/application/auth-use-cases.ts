import { UserRepository, User } from '../domain/user.js';
import { AuthService } from '../infrastructure/auth/auth-service.js';

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async execute(input: {
    email: string;
    password: string;
    name: string;
    role: 'passenger' | 'driver' | 'admin';
    phone?: string;
  }) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.authService.hashPassword(input.password);

    const newUser = await this.userRepository.create({
      email: input.email,
      name: input.name,
      password_hash: passwordHash,
      role: input.role,
      phone: input.phone || null,
    });

    const token = this.authService.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser, token };
  }
}

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.authService.comparePassword(
      input.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }
}
