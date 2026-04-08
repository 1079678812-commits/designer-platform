import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create demo designer
  const password = await bcrypt.hash('123456', 10)
  
  const designer = await prisma.user.upsert({
    where: { email: 'demo@designer.com' },
    update: {},
    create: {
      name: '创意设计师',
      email: 'demo@designer.com',
      password,
      role: 'designer',
      title: '资深UI/UX设计师',
      bio: '8年设计经验，专注品牌视觉和界面设计，服务过50+企业客户。',
      slug: 'creative-designer',
      phone: '13800138000',
    },
  })

  // Create services
  const services = await Promise.all([
    prisma.service.create({ data: { name: '品牌Logo设计', description: '专业品牌标识设计，含3套方案', category: '品牌设计', price: 5000, status: 'active', tags: '["Logo","品牌","VI"]', rating: 4.8, orderCount: 12, designerId: designer.id } }),
    prisma.service.create({ data: { name: 'App界面设计', description: '移动端App全流程UI设计', category: '界面设计', price: 15000, status: 'active', tags: '["App","UI","移动端"]', rating: 4.9, orderCount: 8, designerId: designer.id } }),
    prisma.service.create({ data: { name: 'Keynote演示设计', description: '高端商务演示文稿设计', category: '演示设计', price: 3000, status: 'active', tags: '["Keynote","PPT","演示"]', rating: 4.7, orderCount: 15, designerId: designer.id } }),
    prisma.service.create({ data: { name: '网站视觉设计', description: '企业官网视觉设计', category: '界面设计', price: 12000, status: 'draft', tags: '["Web","网站","视觉"]', rating: 0, orderCount: 0, designerId: designer.id } }),
    prisma.service.create({ data: { name: '插画设计', description: '商业插画、品牌插画', category: '插画', price: 2000, status: 'active', tags: '["插画","商业画"]', rating: 4.6, orderCount: 5, designerId: designer.id } }),
  ])

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({ data: { name: '张总', company: '星辰科技', email: 'zhang@star.com', phone: '13900139001', designerId: designer.id } }),
    prisma.client.create({ data: { name: '李经理', company: '月光传媒', email: 'li@moon.com', phone: '13900139002', designerId: designer.id } }),
    prisma.client.create({ data: { name: '王总监', company: '朝阳投资', email: 'wang@sun.com', phone: '13900139003', status: 'inactive', designerId: designer.id } }),
  ])

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({ data: { orderNo: 'ORD20260401001', title: '星辰科技品牌设计', description: '全套品牌视觉识别系统', status: 'completed', amount: 28000, progress: 100, deadline: new Date('2026-04-15'), clientId: clients[0].id, designerId: designer.id, serviceId: services[0].id } }),
    prisma.order.create({ data: { orderNo: 'ORD20260402001', title: '月光App界面设计', description: 'iOS+Android双端UI', status: 'in_progress', amount: 30000, progress: 60, deadline: new Date('2026-05-01'), clientId: clients[1].id, designerId: designer.id, serviceId: services[1].id } }),
    prisma.order.create({ data: { orderNo: 'ORD20260405001', title: '朝阳Keynote设计', description: '融资路演PPT', status: 'pending', amount: 5000, progress: 0, deadline: new Date('2026-04-20'), clientId: clients[2].id, designerId: designer.id, serviceId: services[2].id } }),
    prisma.order.create({ data: { orderNo: 'ORD20260406001', title: '插画项目', status: 'review', amount: 8000, progress: 90, designerId: designer.id, serviceId: services[4].id } }),
    prisma.order.create({ data: { orderNo: 'ORD20260407001', title: '品牌Logo设计', status: 'confirmed', amount: 5000, progress: 10, designerId: designer.id, serviceId: services[0].id } }),
  ])

  // Create contracts
  await Promise.all([
    prisma.contract.create({ data: { title: '星辰科技品牌设计合同', description: '全套品牌视觉识别系统设计服务', status: 'signed', amount: 28000, orderId: orders[0].id, designerId: designer.id, signedAt: new Date('2026-04-01') } }),
    prisma.contract.create({ data: { title: '月光App界面设计合同', status: 'signed', amount: 30000, orderId: orders[1].id, designerId: designer.id, signedAt: new Date('2026-04-02') } }),
    prisma.contract.create({ data: { title: '朝阳Keynote设计合同', status: 'draft', amount: 5000, orderId: orders[2].id, designerId: designer.id } }),
  ])

  // Create invoices
  await Promise.all([
    prisma.invoice.create({ data: { invoiceNo: 'INV20260401001', title: '星辰科技品牌设计', amount: 28000, status: 'paid', orderId: orders[0].id, designerId: designer.id, issuedAt: new Date('2026-04-01'), paidAt: new Date('2026-04-10') } }),
    prisma.invoice.create({ data: { invoiceNo: 'INV20260402001', title: '月光App第一期', amount: 15000, status: 'pending', orderId: orders[1].id, designerId: designer.id, issuedAt: new Date('2026-04-02'), dueDate: new Date('2026-04-30') } }),
  ])

  // Create notifications
  await Promise.all([
    prisma.notification.create({ data: { title: '新订单通知', content: '你收到了一个新订单：朝阳Keynote设计', type: 'order', userId: designer.id } }),
    prisma.notification.create({ data: { title: '付款到账', content: '星辰科技品牌设计款项 ¥28,000 已到账', type: 'payment', userId: designer.id } }),
    prisma.notification.create({ data: { title: '系统通知', content: '欢迎使用设计师接单平台！完善你的个人主页，吸引更多客户。', type: 'system', read: true, userId: designer.id } }),
  ])

  // Create portfolio
  await Promise.all([
    prisma.portfolio.create({ data: { title: '星辰科技品牌全案', description: '从Logo到VI的完整品牌视觉体系', category: '品牌设计', sortOrder: 0, designerId: designer.id } }),
    prisma.portfolio.create({ data: { title: '月光App界面设计', description: '社交类App iOS+Android双端UI', category: '界面设计', sortOrder: 1, designerId: designer.id } }),
    prisma.portfolio.create({ data: { title: '商业插画系列', description: '为多个品牌创作的商业插画', category: '插画', sortOrder: 2, designerId: designer.id } }),
  ])

  console.log('✅ Seed data created successfully!')
  console.log(`   Designer: ${designer.name} (${designer.email})`)
  console.log(`   Password: 123456`)
  console.log(`   Public page: /designer/${designer.slug}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
