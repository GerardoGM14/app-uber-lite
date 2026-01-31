import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const users = [
    {
      email: 'admin@indrive.local',
      name: 'Administrador',
      role: 'admin',
      phone: '+1234567890',
      rating_avg: 5.0,
    },
    {
      email: 'passenger1@demo.com',
      name: 'Juan Pérez',
      role: 'passenger',
      phone: '+1234567891',
      rating_avg: 4.8,
    },
    {
      email: 'passenger2@demo.com',
      name: 'María García',
      role: 'passenger',
      phone: '+1234567892',
      rating_avg: 4.5,
    },
    {
      email: 'driver1@demo.com',
      name: 'Carlos Rodríguez',
      role: 'driver',
      phone: '+1234567893',
      rating_avg: 4.9,
    },
    {
      email: 'driver2@demo.com',
      name: 'Ana Martínez',
      role: 'driver',
      phone: '+1234567894',
      rating_avg: 4.7,
    },
  ]

  for (const user of users) {
    const upsertUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        password_hash: hashedPassword,
        rating_avg: user.rating_avg,
      },
    })
    console.log(`Upserted user: ${upsertUser.email}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
