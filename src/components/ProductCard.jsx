// ProductCard.jsx
// Tarjeta de producto para mostrar en listas

import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/pricing';

const ProductCard = ({ product }) => {
  const getCategoryIcon = (category) => {
    const icons = {
      silla: '🪑',
      mesa: '🪑',
      sillon: '🛋️',
      otro: '📦'
    };
    return icons[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colors = {
      silla: 'bg-blue-100 text-blue-800',
      mesa: 'bg-green-100 text-green-800',
      sillon: 'bg-purple-100 text-purple-800',
      otro: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      {/* Imagen del producto */}
      <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden -mx-6 -mt-6 mb-4">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getCategoryIcon(product.category)}
          </div>
        )}
        
        {/* Badge de categoría */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
        </div>
      </div>

      {/* Información del producto */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-2">
          {product.description || 'Sin descripción disponible'}
        </p>

        {/* Disponibilidad y precio */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Disponibles</p>
            <p className="text-lg font-bold text-primary-600">
              {product.totalQuantity} unidades
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Precio/día</p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(product.pricePerDay)}
            </p>
          </div>
        </div>

        {/* Botón ver detalles */}
        <Link 
          to={`/producto/${product.id}`}
          className="btn btn-primary w-full text-center block"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
