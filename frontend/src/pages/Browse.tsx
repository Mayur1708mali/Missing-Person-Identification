import { useState, useEffect } from 'react';
import client from '../api/client';
import { MissingPersonListResponse } from '../types';
import PersonCard from '../components/PersonCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

export default function Browse() {
  const [data, setData] = useState<MissingPersonListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('page_size', '12');
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      if (status) params.set('status', status);

      const response = await client.get(`/missing-persons?${params.toString()}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to load missing persons data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Missing Persons Database</h1>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            search={search}
            location={location}
            status={status}
            onSearchChange={setSearch}
            onLocationChange={setLocation}
            onStatusChange={setStatus}
            onSubmit={handleSearch}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && data && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {data.items.length} of {data.total} results
            </p>

            {data.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No results found</p>
                <p className="text-sm">Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.items.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={data.page}
              totalPages={data.total_pages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
