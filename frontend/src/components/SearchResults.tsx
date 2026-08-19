import { Link } from 'react-router-dom';
import { FaceSearchMatch } from '../types';

interface SearchResultsProps {
  matches: FaceSearchMatch[];
}

export default function SearchResults({ matches }: SearchResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">No matches found</p>
        <p className="text-sm">Try uploading a different photo or adjusting the threshold.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Found {matches.length} potential match{matches.length > 1 ? 'es' : ''}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Link
            key={match.person.id}
            to={`/person/${match.person.id}`}
            className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={match.person.photo_url}
                alt={match.person.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=No+Photo';
                }}
              />
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{match.person.full_name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    match.similarity >= 80
                      ? 'bg-green-100 text-green-800'
                      : match.similarity >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {match.similarity}% match
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                {match.person.age && <p>Age: {match.person.age}</p>}
                <p>Location: {match.person.last_seen_location}</p>
                <p>Last seen: {new Date(match.person.last_seen_date).toLocaleDateString()}</p>
                <p className="capitalize">Status: {match.person.case_status.replace('_', ' ')}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
