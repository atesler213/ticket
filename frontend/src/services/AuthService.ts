import { apiClient } from './apiClient';
import type { User } from '../types/User';

export interface LoginResult {
  token: string;
  user: User;
  mfaRequired: boolean;
  mfaChallengeId?: string;
}

export const AuthService = {
  async login(email: string, _password: string):Promise<LoginResult> {
    // We fetch all users from mock and find the matching email
    const users = await apiClient.get<User[]>('/users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    // In real app, apiClient.post('/auth/login', { email, password }) returns JWT.
    return {
      token: "mock.jwt.token.12345",
      user,
      mfaRequired: user.role !== 'Employee',
      mfaChallengeId: user.role !== 'Employee' ? `mfa-${Date.now()}` : undefined
    };
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
    // Mock validating a JWT by returning a fixed admin user or reading from local storage
    const users = await apiClient.get<User[]>('/users');
    return users[0];
  }
};
