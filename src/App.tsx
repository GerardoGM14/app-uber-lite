import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerHome from './pages/PassengerHome';
import DriverHome from './pages/DriverHome';
import TripDetails from './pages/TripDetails';

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'passenger' | 'driver' }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their own dashboard if role mismatch
    return <Navigate to={user.role === 'passenger' ? '/passenger' : '/driver'} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/passenger"
          element={
            <ProtectedRoute role="passenger">
              <PassengerHome />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverHome />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
