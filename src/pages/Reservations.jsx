// Reservations.jsx
// Gestión completa de reservas (vista interna)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReservations, getClients, getProducts, updateReservationStatus } from '../utils/firebaseConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '../utils/pricing';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState({});
  const [products, setProducts] = useState({});
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [statusFilter, reservations]);

  const loadData = async () => {
    try {
      const [reservationsData, clientsData, productsData] = await Promise.all([
        getReservations(),
        getClients(),
        getProducts()
      ]);

      // Crear mapas para acceso rápido
      const clientsMap = {};
      clientsData.forEach(client => {
        clientsMap[client.id] = client;
      });

      const productsMap = {};
      productsData.forEach(product => {
        productsMap[product.id] = product;
      });

      setReservations(reservationsData);
      setClients(clientsMap);
      setProducts(productsMap);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    if (statusFilter === 'all') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(r => r.status === statusFilter));
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      loadData();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gestión de Reservas
            </h1>
            <p className="text-gray-600">
              Administra todas las reservas de la empresa
            </p>
          </div>
          <Link to="/crear-reserva" className="btn btn-primary">
            + Nueva Reserva
          </Link>
        </div>

        {/* Filtros y estadísticas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Filtrar por Estado</h2>
            <div className="text-sm text-gray-600">
              Total: {reservations.length} reservas
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({reservations.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Confirmadas ({reservations.filter(r => r.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Pendientes ({reservations.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Canceladas ({reservations.filter(r => r.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="space-y-4">
          {filteredReservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(reservation => {
              const client = clients[reservation.clientId] || {};
              
              return (
                <div key={reservation.id} className="card hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Reserva #{reservation.id.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Creada el {format(new Date(reservation.createdAt), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                      </p>
                    </div>

                    {/* Menú de estado */}
                    {reservation.status !== 'cancelled' && (
                      <div className="flex space-x-2">
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                            className="btn btn-primary text-sm"
                          >
                            Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                          className="btn btn-danger text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    {/* Información del cliente */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">👤</span>
                        Cliente
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{client.name || 'Cliente no encontrado'}</p>
                        <p className="text-gray-600">{client.email}</p>
                        <p className="text-gray-600">{client.phone}</p>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">📅</span>
                        Período
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Inicio:</span>{' '}
                          <span className="font-medium">
                            {format(new Date(reservation.startDate), "d MMM yyyy", { locale: es })}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Fin:</span>{' '}
                          <span className="font-medium">
                            {format(new Date(reservation.endDate), "d MMM yyyy", { locale: es })}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Duración: {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24)) + 1} días
                        </p>
                      </div>
                    </div>

                    {/* Monto */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">💰</span>
                        Monto
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(reservation.totalAmount || 0)}
                        </p>
                        <p className="text-gray-600">
                          {reservation.items.length} producto(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      📦 Productos Reservados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {reservation.items.map((item, idx) => {
                        const product = products[item.productId] || {};
                        return (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {product.name || `Producto ${item.productId.slice(0, 8)}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {product.category}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary-600">
                                  {item.quantity}
                                </p>
                                <p className="text-xs text-gray-600">uds.</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {filteredReservations.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay reservas {statusFilter !== 'all' ? `con estado "${getStatusText(statusFilter)}"` : ''}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Las reservas aparecerán aquí cuando sean creadas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
