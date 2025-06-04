import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'fellipefreiire3@gmail.com'

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existing) {
    console.log('Admin user already exists.')
    return
  }

  const passwordHash = await hash('123456', 8)

  await prisma.user.create({
    data: {
      name: 'Felipe Freire',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    }
  })

  console.log('✅ Admin user created.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })