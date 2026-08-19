import { useState, useEffect } from 'react';
import { fetchStatistics, fetchAllUsers, updateUserRole, fetchAllCases } from '../api/admin';
import { updateCaseStatus, deleteMissingPerson } from '../api/missingPersons';
import { Statistics, User, MissingPerson } from '../types';
import StatsCards from '../components/StatsCards';
import UserTable from '../components/UserTable';
import CaseTable from '../components/CaseTable';
import ConfirmModal from '../components/ConfirmModal';

export default function Admin() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cases'>('overview');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number; name: string }>({
    isOpen: false,
    id: 0,
    name: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, casesData] = await Promise.all([
        fetchStatistics(),
        fetchAllUsers().catch(() => []),
        fetchAllCases({ page: 1 }),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setCases(casesData.items);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as 'admin' | 'user' } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await updateCaseStatus(id, status);
      setCases((prev) => prev.map((c) => (c.id === id ? updated : c)));
      // Refresh stats
      const newStats = await fetchStatistics();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMissingPerson(deleteModal.id);
      setCases((prev) => prev.filter((c) => c.id !== deleteModal.id));
      // Refresh stats
      const newStats = await fetchStatistics();
      setStats(newStats);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleteModal({ isOpen: false, id: 0, name: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex gap-8">
            {(['overview', 'users', 'cases'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome, Admin</h3>
                <p className="text-gray-600">
                  Use this dashboard to manage users, update case statuses, and monitor the system.
                  Navigate to the Users or Cases tabs to manage records.
                </p>
              </div>
              {stats && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Total registered users: {users.length}</li>
                    <li>Active missing cases: {stats.missing}</li>
                    <li>Cases resolved (found): {stats.found}</li>
                    <li>Under investigation: {stats.under_investigation}</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <UserTable users={users} onRoleChange={handleRoleChange} />
          )}

          {activeTab === 'cases' && (
            <CaseTable
              cases={cases}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteRequest}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Case"
        message={`Are you sure you want to delete the case for "${deleteModal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, id: 0, name: '' })}
        variant="danger"
      />
    </div>
  );
}
