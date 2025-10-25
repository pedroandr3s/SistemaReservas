// Dashboard.jsx
// Dashboard principal para empleados de la empresa

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getClients, getReservations } from '../utils/firebaseConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalClients: 0,
    activeReservations: 0,
    pendingReservations: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [products, clients, reservations] = await Promise.all([
        getProducts(),
        getClients(),
        getReservations()
      ]);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const activeReservations = reservations.filter(
        r => r.status === 'confirmed' && r.endDate >= today
      );
      const pendingReservations = reservations.filter(
        r => r.status === 'pending'
      );

      setStats({
        totalProducts: products.length,
        totalClients: clients.length,
        activeReservations: activeReservations.length,
        pendingReservations: pendingReservations.length
      });

      // Reservas recientes (últimas 5)
      const recent = reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentReservations(recent);

      // Productos con stock bajo (menos de 5 unidades disponibles)
      // Por simplificación, mostramos productos con totalQuantity < 10
      const lowStock = products.filter(p => p.totalQuantity < 10);
      setLowStockProducts(lowStock);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Control
          </h1>
          <p className="text-gray-600">
            Bienvenido al sistema de gestión de inventario y reservas
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Productos */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Productos en Inventario
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-3xl">📦</span>
              </div>
            </div>
            <Link 
              to="/inventario"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-block"
            >
              Ver inventario →
            </Link>
          </div>

          {/* Clientes Registrados */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Clientes Registrados
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalClients}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-3xl">👥</span>
              </div>
            </div>
            <Link 
              to="/clientes"
              className="text-green-600 hover:text-green-700 text-sm font-medium mt-4 inline-block"
            >
              Ver clientes →
            </Link>
          </div>

          {/* Reservas Activas */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Reservas Activas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeReservations}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-3xl">📅</span>
              </div>
            </div>
            <Link 
              to="/calendario"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-4 inline-block"
            >
              Ver calendario →
            </Link>
          </div>

          {/* Reservas Pendientes */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Reservas Pendientes
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingReservations}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <Link 
              to="/reservas"
              className="text-yellow-600 hover:text-yellow-700 text-sm font-medium mt-4 inline-block"
            >
              Ver reservas →
            </Link>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/crear-reserva"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-6 transition group"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">Nueva Reserva</h3>
              <p className="text-primary-100 text-sm">
                Crear una reserva para un cliente
              </p>
            </Link>

            <Link
              to="/inventario"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-6 transition group"
            >
              <div className="text-4xl mb-3">➕</div>
              <h3 className="font-bold text-lg mb-2">Agregar Producto</h3>
              <p className="text-primary-100 text-sm">
                Añadir nuevo producto al inventario
              </p>
            </Link>

            <Link
              to="/calendario"
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-6 transition group"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2">Ver Disponibilidad</h3>
              <p className="text-primary-100 text-sm">
                Consultar calendario de reservas
              </p>
            </Link>
          </div>
        </div>

        {/* Dos columnas: Reservas recientes y Stock bajo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservas Recientes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Reservas Recientes
              </h2>
              <Link 
                to="/reservas"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>

            {recentReservations.length > 0 ? (
              <div className="space-y-3">
                {recentReservations.map(reservation => (
                  <div 
                    key={reservation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        #{reservation.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.status === 'confirmed' ? 'Confirmada' :
                         reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      📅 {format(new Date(reservation.startDate), "d MMM", { locale: es })} - {format(new Date(reservation.endDate), "d MMM yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-600">
                      📦 {reservation.items.length} producto(s)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay reservas recientes
              </div>
            )}
          </div>

          {/* Productos con Stock Bajo */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Alerta de Stock Bajo
              </h2>
              <Link 
                to="/inventario"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver inventario →
              </Link>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map(product => (
                  <div 
                    key={product.id}
                    className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-orange-600 font-bold text-lg">
                          {product.totalQuantity}
                        </span>
                        <p className="text-xs text-gray-600">unidades</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                ✅ Todos los productos tienen stock suficiente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
