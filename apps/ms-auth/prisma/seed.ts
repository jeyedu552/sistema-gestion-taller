import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de db_usuarios...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@taller.com' },
    update: {},
    create: { email: 'admin@taller.com', password: hashedPassword, name: 'Administrador Maestro', role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'mecanico@taller.com' },
    update: {},
    create: { email: 'mecanico@taller.com', password: hashedPassword, name: 'Juan Mecánico', role: Role.MECANICO },
  });

  await prisma.user.upsert({
    where: { email: 'cliente@taller.com' },
    update: {},
    create: { email: 'cliente@taller.com', password: hashedPassword, name: 'Carlos Cliente', role: Role.CLIENTE },
  });

  console.log('✅ Usuarios semilla creados correctamente.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
