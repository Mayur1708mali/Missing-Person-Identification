import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { MissingPerson } from '../types';

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

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<MissingPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await client.get(`/missing-persons/${id}`);
        setPerson(response.data);
      } catch (err) {
        setError('Failed to load person details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || 'Person not found.'}
          </div>
          <Link to="/browse" className="mt-4 inline-block text-primary-600 hover:underline">
            &larr; Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/browse" className="text-primary-600 hover:underline mb-6 inline-block">
          &larr; Back to Browse
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Photo */}
            <div className="md:w-1/3">
              <img
                src={`${apiBase}${person.photo_url}`}
                alt={person.full_name}
                className="w-full h-full object-cover min-h-[300px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Photo';
                }}
              />
            </div>

            {/* Details */}
            <div className="md:w-2/3 p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{person.full_name}</h1>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[person.case_status]}`}>
                  {statusLabels[person.case_status]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Gender:</span>
                  <p className="text-gray-900 capitalize">{person.gender}</p>
                </div>
                {person.age && (
                  <div>
                    <span className="font-medium text-gray-500">Age:</span>
                    <p className="text-gray-900">{person.age}</p>
                  </div>
                )}
                {person.date_of_birth && (
                  <div>
                    <span className="font-medium text-gray-500">Date of Birth:</span>
                    <p className="text-gray-900">{new Date(person.date_of_birth).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-500">Last Seen Location:</span>
                  <p className="text-gray-900">{person.last_seen_location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Seen Date:</span>
                  <p className="text-gray-900">{new Date(person.last_seen_date).toLocaleDateString()}</p>
                </div>
                {person.height && (
                  <div>
                    <span className="font-medium text-gray-500">Height:</span>
                    <p className="text-gray-900">{person.height}</p>
                  </div>
                )}
                {person.weight && (
                  <div>
                    <span className="font-medium text-gray-500">Weight:</span>
                    <p className="text-gray-900">{person.weight}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-500">Reporter Contact:</span>
                  <p className="text-gray-900">{person.reporter_contact}</p>
                </div>
              </div>

              {person.distinguishing_marks && (
                <div className="mt-4">
                  <span className="font-medium text-gray-500 text-sm">Distinguishing Marks:</span>
                  <p className="text-gray-900 text-sm mt-1">{person.distinguishing_marks}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Reported: {new Date(person.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(person.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
