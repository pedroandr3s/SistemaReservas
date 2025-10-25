// ProductDetail.jsx
// Página de detalle de un producto individual

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../utils/firebaseConfig';
import { formatPrice } from '../utils/pricing';
import { getAvailabilityByDay } from '../utils/availability';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);

  // Fechas para verificar disponibilidad (próximos 30 días)
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const future = futureDate.toISOString().split('T')[0];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(id);
      setProduct(data);
      
      // Cargar disponibilidad para los próximos 30 días
      const avail = await getAvailabilityByDay(id, today, future);
      setAvailability(avail);
    } catch (error) {
      setError('Error al cargar el producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      silla: '🪑',
      mesa: '🪑',
      sillon: '🛋️',
      otro: '📦'
    };
    return icons[category] || '📦';
  };

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
        <Link to="/inventario" className="btn btn-primary">
          Volver al Inventario
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Inicio</Link>
        {' / '}
        <Link to="/inventario" className="hover:text-primary-600">Inventario</Link>
        {' / '}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Detalle del producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="card">
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                {getCategoryIcon(product.category)}
              </div>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Precio por día</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatPrice(product.pricePerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inventario total</p>
                  <p className="text-3xl font-bold">
                    {product.totalQuantity}
                  </p>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Descripción</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Link 
                to="/crear-reserva"
                state={{ selectedProduct: product.id }}
                className="btn btn-primary w-full text-center block"
              >
                Reservar Este Producto
              </Link>
              <Link 
                to="/calendario"
                className="btn btn-secondary w-full text-center block"
              >
                Ver Calendario
              </Link>
            </div>
          </div>

          {/* Disponibilidad reciente */}
          {availability && (
            <div className="card bg-gray-50">
              <h3 className="font-bold mb-3">Disponibilidad Próximos Días</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(availability).slice(0, 10).map(([date, info]) => {
                  const available = info.available;
                  const total = info.total;
                  return (
                    <div 
                      key={date}
                      className="flex items-center justify-between text-sm p-2 bg-white rounded"
                    >
                      <span className="text-gray-700">
                        {new Date(date).toLocaleDateString('es-CL', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <span className={`font-semibold ${getAvailabilityColor(available, total)}`}>
                        {available} / {total} disponibles
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * La disponibilidad se actualiza en tiempo real según las reservas confirmadas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Información de Alquiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">📋 Condiciones</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Mínimo 1 día de alquiler</li>
              <li>• Descuentos para 7+ días</li>
              <li>• Depósito de garantía requerido</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🚚 Entrega</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Entrega en Santiago incluida</li>
              <li>• Coordinación previa requerida</li>
              <li>• Retiro el último día del alquiler</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
