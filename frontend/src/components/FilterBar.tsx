interface FilterBarProps {
  search: string;
  location: string;
  status: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSubmit: () => void;
}

export default function FilterBar({
  search,
  location,
  status,
  onSearchChange,
  onLocationChange,
  onStatusChange,
  onSubmit,
}: FilterBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Search by location..."
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All statuses</option>
            <option value="missing">Missing</option>
            <option value="found">Found</option>
            <option value="under_investigation">Under Investigation</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onSubmit}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
