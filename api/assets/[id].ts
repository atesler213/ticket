import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id },
        include: {
          assignedTo: true,
          company: true,
        }
      });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      return res.status(200).json(asset);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch asset' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const data = req.body;
      
      // Fix date fields for Prisma
      if (data.purchaseDate === '') data.purchaseDate = null;
      if (data.warrantyExpiry === '') data.warrantyExpiry = null;
      
      // Convert to ISO-8601 if valid strings
      if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate).toISOString();
      if (data.warrantyExpiry) data.warrantyExpiry = new Date(data.warrantyExpiry).toISOString();
      
      const asset = await prisma.asset.update({
        where: { id },
        data,
        include: {
          assignedTo: true,
        }
      });
      return res.status(200).json(asset);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update asset' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.asset.delete({
        where: { id }
      });
      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete asset' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
