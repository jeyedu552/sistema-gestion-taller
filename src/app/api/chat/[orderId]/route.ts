import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Función auxiliar para obtener la sesión actual
 */
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Endpoint para obtener el historial de chat de una orden.
 * Capa: App Router - API Routes (HU-07)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { orderId } = await params;

    // Verificar si la orden existe y si el usuario tiene permiso (Mecánico o Dueño)
    const order = await prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        vehicle: { select: { ownerId: true } }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Seguridad: Solo el administrador, el mecánico asignado o el dueño del vehículo pueden ver el chat
    const isOwner = order.vehicle.ownerId === session.id;
    const isMechanic = order.mechanicId === session.id;
    const isAdmin = session.role === 'ADMIN';

    if (!isOwner && !isMechanic && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para ver este chat' }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { workOrderId: orderId },
      include: {
        sender: {
          select: { name: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Endpoint para guardar un nuevo mensaje en la base de datos.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { orderId } = await params;
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    // Verificar permisos de envío (Admin no puede enviar mensajes según HU-09)
    if (session.role === 'ADMIN') {
      return NextResponse.json({ error: 'Los administradores solo pueden auditar el chat' }, { status: 403 });
    }

    const order = await prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        vehicle: { select: { ownerId: true } }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Regla de Negocio: No se pueden enviar mensajes si la orden ya está liquidada
    if (order.status === 'FINALIZADO') {
      return NextResponse.json({ error: 'El chat está cerrado para órdenes liquidadas' }, { status: 400 });
    }

    // Verificar si el usuario es el dueño o el mecánico
    const isAuthorized = order.vehicle.ownerId === session.id || order.mechanicId === session.id;
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No tienes permiso para enviar mensajes en esta orden' }, { status: 403 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        text,
        workOrderId: orderId,
        senderId: session.id
      },
      include: {
        sender: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error al guardar mensaje:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
