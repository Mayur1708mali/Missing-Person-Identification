export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface MissingPerson {
  id: number;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other';
  photo_url: string;
  last_seen_location: string;
  last_seen_date: string;
  height: string | null;
  weight: string | null;
  distinguishing_marks: string | null;
  reporter_contact: string;
  case_status: 'missing' | 'found' | 'under_investigation';
  reported_by: number;
  created_at: string;
  updated_at: string;
}

export interface MissingPersonListResponse {
  items: MissingPerson[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FaceSearchMatch {
  person: {
    id: number;
    full_name: string;
    age: number | null;
    gender: string;
    photo_url: string;
    last_seen_location: string;
    last_seen_date: string;
    case_status: string;
  };
  similarity: number;
  distance: number;
}

export interface FaceSearchResponse {
  matches: FaceSearchMatch[];
  message: string;
  total: number;
}

export interface Statistics {
  total: number;
  missing: number;
  found: number;
  under_investigation: number;
}
