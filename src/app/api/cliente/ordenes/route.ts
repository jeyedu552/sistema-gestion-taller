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
 * Endpoint para obtener el historial de órdenes del cliente logueado.
 * Capa: App Router - API Routes (HU-06)
 */
export async function GET() {
  const session = await getClientSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const orders = await prisma.workOrder.findMany({
      where: {
        vehicle: {
          ownerId: session.id
        }
      },
      include: {
        vehicle: {
          select: {
            plate: true,
            brand: true,
            model: true
          }
        },
        mechanic: {
          select: {
            name: true
          }
        },
        items: {
          select: {
            description: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes del cliente:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
