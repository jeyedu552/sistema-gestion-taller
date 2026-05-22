import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para gestión de órdenes de trabajo por el administrador.
 * Capa: App Router - API Routes (HU-04)
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

/**
 * Obtener todas las órdenes de trabajo.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const orders = await prisma.workOrder.findMany({
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
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Crear una nueva orden de trabajo.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { description, vehicleId, mechanicId } = await request.json();

    // 1. Validaciones básicas
    if (!description || !vehicleId || !mechanicId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // 2. Verificar existencia del vehículo
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'El vehículo seleccionado no existe' }, { status: 404 });
    }

    if (!vehicle.isActive) {
      return NextResponse.json({ error: 'No se pueden crear órdenes para vehículos fuera de servicio' }, { status: 400 });
    }

    // 3. Verificar existencia y rol del mecánico
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId },
    });

    if (!mechanic || mechanic.role !== 'MECANICO') {
      return NextResponse.json({ error: 'El mecánico asignado no es válido o no existe' }, { status: 400 });
    }

    if (!mechanic.isActive) {
      return NextResponse.json({ error: 'El mecánico seleccionado está inactivo' }, { status: 400 });
    }

    // 4. Crear la orden (El estado PENDIENTE y las fechas se asignan por default)
    const newOrder = await prisma.workOrder.create({
      data: {
        description,
        vehicleId,
        mechanicId,
        status: 'PENDIENTE',
      },
      include: {
        vehicle: {
          select: { plate: true }
        },
        mechanic: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error al crear orden de trabajo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Actualizar descripción de una orden (ADMIN).
 */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id, description } = await request.json();

    if (!id || !description) {
      return NextResponse.json({ error: 'ID y descripción son requeridos' }, { status: 400 });
    }

    const updatedOrder = await prisma.workOrder.update({
      where: { id },
      data: { description },
      include: {
        vehicle: { select: { plate: true, brand: true, model: true } },
        mechanic: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

