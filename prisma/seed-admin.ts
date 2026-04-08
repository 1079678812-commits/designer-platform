import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      name: '平台管理员',
      email: 'admin@platform.com',
      password,
      role: 'admin',
      slug: 'admin',
    },
  })

  console.log('✅ Admin user created: admin@platform.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
