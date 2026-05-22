export type UserRole = 'ADMIN' | 'MECANICO' | 'CLIENTE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
