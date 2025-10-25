// Header.jsx
// Componente de encabezado para sistema interno

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, logoutUser } from '../utils/firebaseConfig';

const Header = () => {
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `hover:text-primary-200 transition font-medium ${
      isActive(path) ? 'text-white border-b-2 border-white pb-1' : 'text-primary-100'
    }`;
  };

  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-700 font-bold text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold block">Sistema Interno</span>
              <span className="text-xs text-primary-200">Gestión de Inventario</span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              🏠 Dashboard
            </Link>
            <Link to="/crear-reserva" className={navLinkClass('/crear-reserva')}>
              ➕ Nueva Reserva
            </Link>
            <Link to="/reservas" className={navLinkClass('/reservas')}>
              📋 Reservas
            </Link>
            <Link to="/calendario" className={navLinkClass('/calendario')}>
              📅 Calendario
            </Link>
            <Link to="/inventario" className={navLinkClass('/inventario')}>
              📦 Inventario
            </Link>
            <Link to="/clientes" className={navLinkClass('/clientes')}>
              👥 Clientes
            </Link>
          </nav>

          {/* Usuario y logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-primary-200">Administrador</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm"
            >
              Cerrar Sesión
            </button>
            
            {/* Botón menú móvil */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {showMobileMenu && (
          <nav className="lg:hidden py-4 border-t border-primary-600">
            <div className="space-y-2">
              <Link 
                to="/dashboard" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                🏠 Dashboard
              </Link>
              <Link 
                to="/crear-reserva" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                ➕ Nueva Reserva
              </Link>
              <Link 
                to="/reservas" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                📋 Reservas
              </Link>
              <Link 
                to="/calendario" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                📅 Calendario
              </Link>
              <Link 
                to="/inventario" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                📦 Inventario
              </Link>
              <Link 
                to="/clientes" 
                className="block px-4 py-2 hover:bg-white/10 rounded"
                onClick={() => setShowMobileMenu(false)}
              >
                👥 Clientes
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
