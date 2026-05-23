import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Función auxiliar para obtener la sesión del cliente
 */
async function getClientSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) return null;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role === 'CLIENTE') {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Endpoint para obtener los vehículos del cliente logueado.
 * Capa: App Router - API Routes (HU-06)
 */
export async function GET() {
  const session = await getClientSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: session.id,
        isActive: true // Solo vehículos activos
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos del cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
