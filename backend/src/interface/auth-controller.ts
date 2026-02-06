import { Request, Response } from 'express';
import { RegisterUserUseCase, LoginUserUseCase } from '../application/auth-use-cases.js';
import { PrismaUserRepository } from '../infrastructure/database/user-repository.js';
import { AuthService } from '../infrastructure/auth/auth-service.js';
import { registerSchema, loginSchema } from './schemas.js';

const userRepository = new PrismaUserRepository();
const authService = new AuthService();
const registerUserUseCase = new RegisterUserUseCase(userRepository, authService);
const loginUserUseCase = new LoginUserUseCase(userRepository, authService);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await registerUserUseCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else if (error.message === 'User already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await loginUserUseCase.execute(validatedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}
