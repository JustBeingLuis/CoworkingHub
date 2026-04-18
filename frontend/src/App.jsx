import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyReservations from './pages/MyReservations';
import AdminEspacios from './pages/admin/AdminEspacios';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminReservas from './pages/admin/AdminReservas';
import AdminReportes from './pages/admin/AdminReportes';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-zinc-950 dark:text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        {/* User Routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mis-reservas" element={<MyReservations />} />
          
          {/* Admin Routes */}
          <Route path="admin/espacios" element={<ProtectedRoute requireAdmin><AdminEspacios /></ProtectedRoute>} />
          <Route path="admin/reservas" element={<ProtectedRoute requireAdmin><AdminReservas /></ProtectedRoute>} />
          <Route path="admin/usuarios" element={<ProtectedRoute requireAdmin><AdminUsuarios /></ProtectedRoute>} />
          <Route path="admin/reportes" element={<ProtectedRoute requireAdmin><AdminReportes /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
