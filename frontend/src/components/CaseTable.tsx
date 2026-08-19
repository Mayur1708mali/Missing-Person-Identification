import { MissingPerson } from '../types';

interface CaseTableProps {
  cases: MissingPerson[];
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number, name: string) => void;
}

const statusOptions = [
  { value: 'missing', label: 'Missing' },
  { value: 'found', label: 'Found' },
  { value: 'under_investigation', label: 'Under Investigation' },
];

export default function CaseTable({ cases, onStatusChange, onDelete }: CaseTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Case Management</h3>
        <p className="text-sm text-gray-500">{cases.length} cases shown</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Seen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cases.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{person.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/person/${person.id}`}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    {person.full_name}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[200px] truncate">
                  {person.last_seen_location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(person.last_seen_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={person.case_status}
                    onChange={(e) => onStatusChange(person.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onDelete(person.id, person.full_name)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
