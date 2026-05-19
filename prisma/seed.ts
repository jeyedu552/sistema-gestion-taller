import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando la siembra de datos (Database Seeding)...')

  const defaultPassword = 'admin123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taller.com' },
    update: {}, 
    create: {
      email: 'admin@taller.com',
      password: hashedPassword,
      name: 'Administrador Maestro',
      role: Role.ADMIN, 
    },
  })

  console.log('Base de datos inicializada exitosamente.')
  console.log(`Usuario Admin: ${adminUser.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en la siembra:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
