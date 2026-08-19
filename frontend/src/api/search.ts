import client from './client';
import { FaceSearchResponse } from '../types';

export async function searchByFace(
  file: File,
  threshold: number = 0.6,
  limit: number = 10
): Promise<FaceSearchResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post(
    `/search/face?threshold=${threshold}&limit=${limit}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
}
