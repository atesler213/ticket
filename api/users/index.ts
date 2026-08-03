import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        include: {
          company: true,
          department: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Exclude passwordHash from all users
      const safeUsers = users.map(user => {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      });

      return res.status(200).json(safeUsers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      const user = await prisma.user.create({
        data,
        include: {
          company: true,
          department: true,
        }
      });
      const { passwordHash, ...safeUser } = user;
      return res.status(201).json(safeUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
