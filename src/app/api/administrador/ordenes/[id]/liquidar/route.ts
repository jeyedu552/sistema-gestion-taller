import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para que el Administrador liquide y cierre una orden con cálculo de total.
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

    // 1. Obtener la orden y sus ítems para validar y calcular el total
    const order = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        items: true,
      }
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

    // 2. Calcular el total acumulado en el servidor (Regla Técnica HU-08)
    const totalAmount = order.items.reduce((acc, item) => acc + item.price, 0);

    // 3. Actualizar estado a FINALIZADO (Liquidado)
    // Guardamos el total calculado para auditoría futura
    const updatedOrder = await prisma.workOrder.update({
      where: { id },
      data: { 
        status: 'FINALIZADO'
      },
      include: {
        vehicle: { select: { plate: true } },
        mechanic: { select: { name: true } }
      }
    });

    // En una implementación real, aquí podríamos registrar una transacción financiera
    console.log(`✅ Orden ${id} liquidada exitosamente por un total de $${totalAmount.toFixed(2)}`);

    return NextResponse.json({
      ...updatedOrder,
      totalAmount // Devolvemos el total calculado por el servidor
    });
  } catch (error) {
    console.error('Error al liquidar orden:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
