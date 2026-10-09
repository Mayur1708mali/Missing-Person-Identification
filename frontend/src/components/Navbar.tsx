import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

export default function Navbar() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xl font-bold text-gray-900">MPI System</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-gray-600 hover:text-primary-600 transition-colors">
              Browse Cases
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/report" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Report
                </Link>
                <Link to="/search" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Face Search
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center">
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
