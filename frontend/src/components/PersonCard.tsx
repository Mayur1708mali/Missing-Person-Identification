import { Link } from 'react-router-dom';
import { MissingPerson } from '../types';

interface PersonCardProps {
  person: MissingPerson;
}

const statusColors: Record<string, string> = {
  missing: 'bg-red-100 text-red-800',
  found: 'bg-green-100 text-green-800',
  under_investigation: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  missing: 'Missing',
  found: 'Found',
  under_investigation: 'Under Investigation',
};

export default function PersonCard({ person }: PersonCardProps) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  return (
    <Link
      to={`/person/${person.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-square overflow-hidden bg-gray-200">
        <img
          src={`${apiBase}${person.photo_url}`}
          alt={person.full_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Photo';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{person.full_name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[person.case_status]}`}>
            {statusLabels[person.case_status]}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          {person.age && <p>Age: {person.age}</p>}
          <p className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{person.last_seen_location}</span>
          </p>
          <p className="text-xs text-gray-500">
            Last seen: {new Date(person.last_seen_date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
