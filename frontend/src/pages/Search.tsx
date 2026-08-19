import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchSchema, SearchFormData } from '../schemas/searchSchema';
import { searchByFace } from '../api/search';
import { FaceSearchMatch } from '../types';
import PhotoUpload from '../components/PhotoUpload';
import SearchResults from '../components/SearchResults';

export default function Search() {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [matches, setMatches] = useState<FaceSearchMatch[] | null>(null);

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      threshold: 0.6,
    },
  });

  const threshold = watch('threshold');

  const onSubmit = async (data: SearchFormData) => {
    setSearching(true);
    setSearchError(null);
    setMatches(null);

    try {
      const result = await searchByFace(data.photo, data.threshold);
      setMatches(result.matches);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setSearchError(error.response?.data?.detail || 'Face search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex-1 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Recognition Search</h1>
        <p className="text-gray-600 mb-8">
          Upload a photo to search our database for potential matches using AI-powered facial recognition.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Photo</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <PhotoUpload
                onFileSelect={(file) => setValue('photo', file, { shouldValidate: true })}
                error={errors.photo?.message}
              />

              {/* Threshold Slider */}
              <div>
                <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Sensitivity Threshold: {((1 - (threshold || 0.6)) * 100).toFixed(0)}%
                </label>
                <input
                  id="threshold"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setValue('threshold', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>More results (less strict)</span>
                  <span>Fewer results (more strict)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {searching ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </span>
                ) : (
                  'Search Database'
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div>
            {searchError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {searchError}
              </div>
            )}

            {searching && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">Analyzing face and searching database...</p>
              </div>
            )}

            {!searching && matches !== null && <SearchResults matches={matches} />}

            {!searching && matches === null && !searchError && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg">Upload a photo to begin</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
