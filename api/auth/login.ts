import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        department: true,
      }
    });

    // In a real app we would use bcrypt or argon2 to verify passwordHash
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Determine MFA requirement (mocking this based on user role)
    const isCiso = user.role === 'CISO / ISB';
    
    const { passwordHash, ...safeUser } = user;
    
    if (isCiso) {
      return res.status(200).json({
        user: safeUser,
        mfaRequired: true,
        mfaChallengeId: 'mock-mfa-req-' + Date.now(),
        token: ''
      });
    }

    return res.status(200).json({
      user: safeUser,
      mfaRequired: false,
      mfaChallengeId: null,
      token: 'demo-jwt-token-12345'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
