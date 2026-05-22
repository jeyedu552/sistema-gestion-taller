import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Endpoint para gestión de vehículos por el administrador.
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

/**
 * Obtener todos los vehículos con la información de su dueño.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Registrar un nuevo vehículo asociado a un cliente.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { plate, brand, model, year, ownerId } = await request.json();

    // 1. Validaciones de campos obligatorios
    if (!plate || !brand || !model || !year || !ownerId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // 2. Validación de formato de placa (Alfanumérico)
    const plateRegex = /^[A-Z0-9-]+$/i;
    if (!plateRegex.test(plate)) {
      return NextResponse.json(
        { error: 'La placa debe tener un formato alfanumérico válido' },
        { status: 400 }
      );
    }

    // 3. Verificar si la placa ya existe (Regla Técnica HU-03)
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate: plate.toUpperCase() },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo registrado con esta placa' },
        { status: 409 }
      );
    }

    // 4. Verificar si el dueño existe y es un cliente
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner || owner.role !== 'CLIENTE') {
      return NextResponse.json(
        { error: 'El dueño seleccionado no es válido o no existe' },
        { status: 400 }
      );
    }

    // 5. Crear el vehículo
    const newVehicle = await prisma.vehicle.create({
      data: {
        plate: plate.toUpperCase(),
        brand,
        model,
        year: parseInt(year),
        ownerId,
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

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    console.error('Error al registrar vehículo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
