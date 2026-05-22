import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para actualizar el estado de una orden.
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getMechanicSession();
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 400 });
    }

    // Verificar si la orden existe
    const order = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Seguridad: Verificar que la orden pertenece al mecánico actual
    if (order.mechanicId !== session.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta orden' }, { status: 403 });
    }

    // Regla Técnica HU-05: Rechazar cualquier operación si la orden tiene estado FINALIZADO
    if (order.status === 'FINALIZADO') {
      return NextResponse.json({ error: 'No se puede modificar una orden que ya fue finalizada y facturada' }, { status: 400 });
    }

    // Validar estados permitidos para el mecánico
    const allowedStatuses = ['PENDIENTE', 'EN_PROGRESO', 'LISTO_PARA_LIQUIDAR'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido o no permitido para este rol' }, { status: 400 });
    }

    // Actualizar estado
    const updatedOrder = await prisma.workOrder.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
