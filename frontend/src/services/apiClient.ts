// API Client Abstraction
// In the future, this will use Axios or fetch to call ASP.NET Core endpoints.
// Currently, it loads from mock JSON data to satisfy the UI completely decoupled from data source.

const USE_MOCK = false; // Set to false to use Vercel API
const API_BASE = '/api';

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simple mock router based on endpoint prefix
      const resourceName = endpoint.split('/')[1] || endpoint;
      try {
        const data = await import(`../mock/${resourceName}.json`);
        return data.default as T;
      } catch (error) {
        console.error(`Failed to load mock for ${resourceName}`, error);
        throw new Error('Not found');
      }
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  },
  
  async post<T>(endpoint: string, body: any): Promise<T> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`[MOCK POST] ${endpoint}`, body);
      return body as T; // Echo back for mocking
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  },
  
  async put<T>(endpoint: string, body: any): Promise<T> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`[MOCK PUT] ${endpoint}`, body);
      return body as T;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  async delete(endpoint: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`[MOCK DELETE] ${endpoint}`);
      return;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed with status ${response.status}`);
    }
  }
};
