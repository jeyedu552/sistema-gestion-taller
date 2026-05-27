import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

/**
 * Endpoint para la autogestión del perfil del usuario (HU-02).
 * Permite actualizar nombre, correo y contraseña.
 */
export async function PATCH(request: Request) {
  // 1. Verificar la identidad mediante la cookie de sesión
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const userId = session.id; 
    
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // 2. Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Objeto para almacenar los datos que se van a actualizar
    const updateData: any = {};

    // 3. Actualizar datos básicos si fueron enviados
    if (name) updateData.name = name;
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 409 });
      }
      updateData.email = email;
    }

    // 4. Lógica de Seguridad: Cambio de Contraseña
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Debe proporcionar su contraseña actual por seguridad' }, 
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 403 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // 5. Persistir los cambios
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}