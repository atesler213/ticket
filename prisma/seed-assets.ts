import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding assets...')

  const company = await prisma.company.findFirst()
  if (!company) {
    console.log('No company found. Exiting.')
    return
  }

  const user = await prisma.user.findFirst({ where: { email: 'admin@test.com' } })
  const agent = await prisma.user.findFirst({ where: { email: 'agent@test.com' } })

  const assets = [
    {
      companyId: company.id,
      name: 'MacBook Pro 16" M2 Max',
      assetTag: 'AST-2024-001',
      type: 'Laptop',
      status: 'In Use',
      assignedToId: user?.id,
      department: 'IT',
      serialNumber: 'C02F314XXY',
      purchaseDate: new Date('2024-01-15T00:00:00Z'),
      warrantyExpiry: new Date('2027-01-15T00:00:00Z'),
      ownerEmail: 'admin@test.com',
      classification: 'Confidential',
      confidentiality: 'High',
      integrity: 'High',
      availability: 'Medium'
    },
    {
      companyId: company.id,
      name: 'Dell XPS 15',
      assetTag: 'AST-2024-002',
      type: 'Laptop',
      status: 'Available',
      assignedToId: null,
      department: 'HR',
      serialNumber: 'DXPS15-8890',
      purchaseDate: new Date('2023-11-05T00:00:00Z'),
      warrantyExpiry: new Date('2026-11-05T00:00:00Z'),
      ownerEmail: null,
      classification: 'Internal',
      confidentiality: 'Medium',
      integrity: 'Medium',
      availability: 'Medium'
    },
    {
      companyId: company.id,
      name: 'iPhone 15 Pro',
      assetTag: 'AST-2024-003',
      type: 'Mobile',
      status: 'In Use',
      assignedToId: agent?.id,
      department: 'IT',
      serialNumber: 'IP15P-33421',
      purchaseDate: new Date('2024-03-20T00:00:00Z'),
      warrantyExpiry: new Date('2025-03-20T00:00:00Z'),
      ownerEmail: 'agent@test.com',
      classification: 'Confidential',
      confidentiality: 'High',
      integrity: 'High',
      availability: 'High'
    },
    {
      companyId: company.id,
      name: 'Cisco Meraki MX64',
      assetTag: 'AST-2023-004',
      type: 'Network',
      status: 'In Use',
      assignedToId: null,
      department: 'IT',
      serialNumber: 'Q2MM-XXXX-YYYY',
      purchaseDate: new Date('2023-05-10T00:00:00Z'),
      warrantyExpiry: new Date('2028-05-10T00:00:00Z'),
      ownerEmail: 'it-infra@techcorp.com',
      classification: 'Restricted',
      confidentiality: 'High',
      integrity: 'High',
      availability: 'High'
    }
  ]

  for (const assetData of assets) {
    await prisma.asset.upsert({
      where: { assetTag: assetData.assetTag },
      update: {},
      create: assetData
    })
  }

  console.log('Seeded 4 assets.')
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
