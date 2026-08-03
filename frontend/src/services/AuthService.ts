import { apiClient } from './apiClient';
import type { User } from '../types/User';

export interface LoginResult {
  token: string;
  user: User;
  mfaRequired: boolean;
  mfaChallengeId?: string;
}

export const AuthService = {
  async login(email: string, password: string):Promise<LoginResult> {
    // Send POST to Vercel Serverless Function
    const response = await apiClient.post<LoginResult>('/auth/login', { email, password });
    return response;
  },

  async verifyMfa(_challengeId: string, otpCode: string): Promise<{ verified: boolean }> {
    // Test mode: accept only the fixed MFA code.
    return { verified: otpCode.trim() === '1234' };
  },

  async getSsoProviders(): Promise<Array<{ id: string; name: string; protocol: 'OIDC' | 'SAML2' }>> {
    return [
      { id: 'entra-id', name: 'Microsoft Entra ID', protocol: 'OIDC' },
      { id: 'okta-main', name: 'Okta', protocol: 'SAML2' }
    ];
  },
  
  async validateSession(_token: string): Promise<User> {
    const users = await apiClient.get<User[]>('/users');
    const email = localStorage.getItem('user_email');
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return user;
  }
};
