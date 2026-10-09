import client from './client';
import { MissingPersonListResponse, MissingPerson } from '../types';

export async function fetchMissingPersons(params: {
  page?: number;
  page_size?: number;
  search?: string;
  location?: string;
  status?: string;
}): Promise<MissingPersonListResponse> {
  const response = await client.get('/missing-persons', { params });
  return response.data;
}

export async function fetchMissingPerson(id: number): Promise<MissingPerson> {
  const response = await client.get(`/missing-persons/${id}`);
  return response.data;
}

export async function uploadPhoto(file: File): Promise<{ filename: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function createMissingPerson(
  data: Record<string, unknown>,
  photoUrl: string
): Promise<MissingPerson> {
  const response = await client.post(`/missing-persons?photo_url=${encodeURIComponent(photoUrl)}`, data);
  return response.data;
}

export async function updateMissingPerson(
  id: number,
  data: Record<string, unknown>
): Promise<MissingPerson> {
  const response = await client.put(`/missing-persons/${id}`, data);
  return response.data;
}

export async function deleteMissingPerson(id: number): Promise<void> {
  await client.delete(`/missing-persons/${id}`);
}

export async function updateCaseStatus(
  id: number,
  caseStatus: string
): Promise<MissingPerson> {
  const response = await client.patch(`/missing-persons/${id}/status`, {
    case_status: caseStatus,
  });
  return response.data;
}
