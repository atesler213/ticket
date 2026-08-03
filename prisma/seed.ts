import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // 1. Create a Company
  const company = await prisma.company.upsert({
    where: { subdomain: 'techcorp' },
    update: {},
    create: {
      name: 'Hess Support',
      subdomain: 'techcorp',
      supportEmail: 'support@hess.com',
      supportPhone: '1-800-HESS-IT',
      theme: 'dark',
      primaryColor: '#3B82F6'
    }
  })

  // 2. Create Departments
  const itDept = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Information Technology',
      description: 'Core IT and Infrastructure'
    }
  })

  const hrDept = await prisma.department.create({
    data: {
      companyId: company.id,
      name: 'Human Resources',
      description: 'Employee relations and services'
    }
  })

  // 3. Create Categories
  const hwCategory = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'Hardware Issue',
      defaultDepartmentId: itDept.id,
      defaultPriority: 'Medium'
    }
  })

  const accessCategory = await prisma.category.create({
    data: {
      companyId: company.id,
      name: 'Access Request',
      defaultDepartmentId: itDept.id,
      defaultPriority: 'Low'
    }
  })

  // 4. Create Demo Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      companyId: company.id,
      departmentId: itDept.id,
      name: 'Hess Admin',
      email: 'admin@test.com',
      passwordHash: 'password', // Note: We use plain 'password' for demo matching
      role: 'System Administrator'
    }
  })

  const agent = await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: {
      companyId: company.id,
      departmentId: itDept.id,
      name: 'Hess Support Agent',
      email: 'agent@test.com',
      passwordHash: 'password',
      role: 'Support Agent'
    }
  })

  const employee = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      companyId: company.id,
      departmentId: hrDept.id,
      name: 'Hess Employee',
      email: 'employee@test.com',
      passwordHash: 'password',
      role: 'Employee'
    }
  })

  const ciso = await prisma.user.upsert({
    where: { email: 'isb@company.de' },
    update: {},
    create: {
      companyId: company.id,
      departmentId: itDept.id,
      name: 'Hess CISO',
      email: 'isb@company.de',
      passwordHash: 'password',
      role: 'CISO / ISB'
    }
  })

  console.log('Seeding finished.')
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
