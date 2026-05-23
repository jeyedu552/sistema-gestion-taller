import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para actualización e inactivación de vehículos.
 * Capa: App Router - API Routes (HU-03)
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
    const body = await request.json();
    const { plate, brand, model, year, isActive } = body;

    // Verificar si el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
    }

    // Si se intenta cambiar la placa, verificar unicidad
    if (plate && plate.toUpperCase() !== vehicle.plate) {
      const plateExists = await prisma.vehicle.findUnique({
        where: { plate: plate.toUpperCase() },
      });

      if (plateExists) {
        return NextResponse.json(
          { error: 'La placa ya está registrada en otro vehículo' },
          { status: 409 }
        );
      }
    }

    // Actualizar vehículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plate: plate ? plate.toUpperCase() : undefined,
        brand: brand ?? undefined,
        model: model ?? undefined,
        year: year ? parseInt(year) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
