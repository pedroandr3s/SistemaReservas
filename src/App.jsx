// App.jsx
// Aplicación con autenticación obligatoria para uso interno

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './utils/firebaseConfig';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductDetail from './pages/ProductDetail';
import CalendarPage from './pages/CalendarPage';
import CreateReservation from './pages/CreateReservation';
import Clients from './pages/Clients';
import Reservations from './pages/Reservations';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observar estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    return user ? children : <Navigate to="/login" />;
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Solo mostrar Header si está autenticado */}
        {user && <Header />}
        
        <main className="flex-1">
          <Routes>
            {/* Ruta de login */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login />} 
            />

            {/* Rutas protegidas - requieren autenticación */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/producto/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/calendario"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/crear-reserva"
              element={
                <ProtectedRoute>
                  <CreateReservation />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reservas"
              element={
                <ProtectedRoute>
                  <Reservations />
                </ProtectedRoute>
              }
            />

            {/* Ruta por defecto - redirige según autenticación */}
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />

            {/* 404 - Redirige al dashboard o login */}
            <Route
              path="*"
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        {user && <Footer />}
      </div>
    </Router>
  );
}

export default App;
