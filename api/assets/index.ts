import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const assets = await prisma.asset.findMany({
        include: {
          assignedTo: true,
          company: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(assets);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // We need a companyId. If not provided, fetch the default one (techcorp)
      if (!data.companyId) {
        const company = await prisma.company.findFirst();
        if (company) {
          data.companyId = company.id;
        }
      }
      
      // Fix date fields for Prisma
      if (data.purchaseDate === '') data.purchaseDate = null;
      if (data.warrantyExpiry === '') data.warrantyExpiry = null;
      
      // Convert to ISO-8601 if valid strings
      if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate).toISOString();
      if (data.warrantyExpiry) data.warrantyExpiry = new Date(data.warrantyExpiry).toISOString();

      
      const asset = await prisma.asset.create({
        data,
        include: {
          assignedTo: true,
        }
      });
      return res.status(201).json(asset);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create asset' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
