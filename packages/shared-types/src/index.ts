// Roles del sistema
export type Role = 'ADMIN' | 'MECANICO' | 'CLIENTE';

// Payload que viaja dentro del JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Estados de una orden de trabajo
export type OrderStatus =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'LISTO_PARA_LIQUIDAR'
  | 'FINALIZADO';
