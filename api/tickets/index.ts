import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const tickets = await prisma.ticket.findMany({
        include: {
          requester: true,
          agent: true,
          department: true,
          category: true,
          asset: true,
          events: true,
          company: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return res.status(200).json(tickets);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Typically we would validate the payload here
      const data = req.body;
      const ticket = await prisma.ticket.create({
        data,
        include: {
          requester: true,
          agent: true,
          department: true,
          category: true,
          asset: true,
        }
      });
      return res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
