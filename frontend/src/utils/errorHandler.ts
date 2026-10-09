import { AxiosError } from 'axios';

interface ApiError {
  detail?: string;
  type?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.detail) {
      return data.detail;
    }

    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The record may already exist.';
      case 413:
        return 'The file is too large. Please try a smaller file.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}
