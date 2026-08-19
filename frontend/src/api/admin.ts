import client from './client';
import { User, Statistics, MissingPersonListResponse } from '../types';

export async function fetchStatistics(): Promise<Statistics> {
  const response = await client.get('/missing-persons/statistics');
  return response.data;
}

export async function fetchAllUsers(): Promise<User[]> {
  const response = await client.get('/admin/users');
  return response.data;
}

export async function updateUserRole(userId: number, role: string): Promise<User> {
  const response = await client.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function fetchAllCases(params: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<MissingPersonListResponse> {
  const response = await client.get('/missing-persons', { params: { ...params, page_size: 20 } });
  return response.data;
}
