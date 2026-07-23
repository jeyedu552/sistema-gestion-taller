import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoints para gestionar ítems de servicio (repuestos/mano de obra).
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

// Obtener todos los ítems de una orden específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMechanicSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Verificar orden y permisos
    const order = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.mechanicId !== session.id) {
      return NextResponse.json({ error: 'No tienes permiso para ver esta orden' }, { status: 403 });
    }

    const items = await prisma.serviceItem.findMany({
      where: { workOrderId: id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error al obtener ítems:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Añadir un nuevo ítem a la orden
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMechanicSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, price } = body;

    if (!description || price === undefined || price < 0) {
      return NextResponse.json({ error: 'Descripción y precio válido son obligatorios' }, { status: 400 });
    }

    // Verificar orden y permisos
    const order = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.mechanicId !== session.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta orden' }, { status: 403 });
    }

    // Regla Técnica HU-05: Rechazar inserción si la orden tiene estado FINALIZADO
    if (order.status === 'FINALIZADO') {
      return NextResponse.json({ error: 'No se pueden añadir ítems a una orden que ya fue finalizada' }, { status: 400 });
    }

    const newItem = await prisma.serviceItem.create({
      data: {
        description,
        price: parseFloat(price),
        workOrderId: id
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error al añadir ítem:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
