import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import RiskMapPage from './pages/RiskMapPage';
import LocationSearchPage from './pages/LocationSearchPage';
import EmergencyResourcesPage from './pages/EmergencyResourcesPage';
import AlertHistoryPage from './pages/AlertHistoryPage';
import AdminDashboard from './pages/AdminDashboard';

// Session protection component for routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout coordinator adapting depending on user sessions
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {user && <Sidebar />}
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${user ? (isLandingPage ? 'p-0 lg:pl-64' : 'p-6 sm:p-8 lg:pl-72 pt-20 lg:pt-8') : 'p-0'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><RiskMapPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><LocationSearchPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><EmergencyResourcesPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertHistoryPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
