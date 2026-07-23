import jwt from 'jsonwebtoken';
import { JwtPayload } from '@taller/shared-types';

export class TokenService {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback_secret';
  }

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secret, { expiresIn: '8h' });
  }

  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

export const tokenService = new TokenService();
