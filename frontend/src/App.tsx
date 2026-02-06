import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import PassengerHome from './pages/PassengerHome';
import DriverHome from './pages/DriverHome';
import PassengerNegotiation from './pages/PassengerNegotiation';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import TripHistory from './pages/TripHistory';
import Settings from './pages/Settings';
import DriverProfile from './pages/DriverProfile';
import AdminHome from './pages/AdminHome';

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'passenger' | 'driver' | 'admin' }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their own dashboard if role mismatch
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
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
          path="/passenger/negotiation/:id"
          element={
            <ProtectedRoute role="passenger">
              <PassengerNegotiation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <TripHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
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
          path="/driver/profile"
          element={
            <ProtectedRoute role="driver">
              <DriverProfile />
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
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
