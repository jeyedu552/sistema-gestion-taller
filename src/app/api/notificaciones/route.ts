import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para gestionar las notificaciones "In-App" (HU-03).
 */

// Obtener las notificaciones del usuario logueado
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // Obtener las últimas 20 notificaciones, ordenadas por las más recientes
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Marcar todas las notificaciones no leídas como leídas
export async function PATCH() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;
    
    await prisma.notification.updateMany({
      where: { 
        userId: userId, 
        isRead: false 
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}