import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para obtener las órdenes asignadas a un mecánico.
 * Capa: App Router - API Routes (HU-05)
 */

async function getMechanicSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) return null;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role === 'MECANICO') {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getMechanicSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    // Filtrar validando que mechanicId == currentUser.id
    const orders = await prisma.workOrder.findMany({
      where: {
        mechanicId: session.id
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true,
            year: true,
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes del mecánico:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
