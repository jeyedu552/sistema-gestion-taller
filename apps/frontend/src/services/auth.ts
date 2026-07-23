import { UserRole } from '@/types/auth';

/**
 * Servicio encargado de la lógica de negocio para la autenticación.
 * Capa: Business Logic (src/services)
 */
export const AuthService = {
  /**
   * Determina la ruta de redirección basada en el rol del usuario.
   * Regla de Negocio: HU-01 - Redirección por roles.
   */
  getRedirectPathByRole(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return '/administrador';
      case 'MECANICO':
        return '/mecanico';
      case 'CLIENTE':
        return '/cliente';
      default:
        return '/autenticacion/inicio-sesion';
    }
  },

  /**
   * Valida si el usuario tiene una sesión activa y el rol permitido.
   * Esta lógica se usará en componentes de servidor o middleware.
   */
  isAuthorized(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }
};
