import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

/**
 * Endpoint para autenticación de usuarios.
 * Capa: App Router - API Routes (HU-01)
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo (HU-02)
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Su cuenta ha sido desactivada. Contacte al administrador.' },
        { status: 403 }
      );
    }

    // Validar la contraseña con bcrypt (HU-01 Regla Técnica)
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Actualizar la última conexión (HU-02)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Crear la sesión mediante una cookie (Simplificado para este prototipo)
    // En una implementación real, se usaría un token firmado (JWT) o una sesión en BD
    const cookieStore = await cookies();
    
    // Almacenamos el ID, el Rol y el Nombre en la cookie para que los layouts puedan leerlo
    const sessionData = JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    cookieStore.set('session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener la sesión actual (GET).
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      authenticated: true,
      user: {
        name: session.name,
        email: session.email,
        role: session.role
      }
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

/**
 * Endpoint para cerrar sesión.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ message: 'Sesión cerrada' });
}
