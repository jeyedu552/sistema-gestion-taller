import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para que el Administrador liquide y cierre una orden.
 * Capa: App Router - API Routes (HU-08)
 */

async function isAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) return false;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Verificar si la orden existe y su estado actual
    const order = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Regla de Negocio: Solo se pueden liquidar órdenes en LISTO_PARA_LIQUIDAR
    if (order.status !== 'LISTO_PARA_LIQUIDAR') {
      return NextResponse.json(
        { error: 'Solo se pueden liquidar órdenes que estén en estado LISTO PARA ENTREGA' },
        { status: 400 }
      );
    }

    // Actualizar estado a FINALIZADO (Liquidado)
    const updatedOrder = await prisma.workOrder.update({
      where: { id },
      data: { status: 'FINALIZADO' }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al liquidar orden:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
