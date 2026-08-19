import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Browse from './pages/Browse';
import PersonDetail from './pages/PersonDetail';
import Report from './pages/Report';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/person/:id" element={<PersonDetail />} />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
