// Inventory.jsx
// Página de inventario con formulario integrado

import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/firebaseConfig';
import ProductList from '../components/ProductList';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'silla',
    totalQuantity: 1,
    pricePerDay: 1000,
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setError('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      setError('Error al guardar producto');
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      totalQuantity: product.totalQuantity,
      pricePerDay: product.pricePerDay,
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (error) {
      setError('Error al eliminar producto');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'silla',
      totalQuantity: 1,
      pricePerDay: 1000,
      description: '',
      imageUrl: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gestión de Inventario
            </h1>
            <p className="text-gray-600">
              Administra el catálogo completo de productos
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Formulario de Producto */}
        {showForm && (
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="label">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full"
                    placeholder="Ej: Silla Vintage Madera"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full"
                    required
                  >
                    <option value="silla">Silla</option>
                    <option value="mesa">Mesa</option>
                    <option value="sillon">Sillón</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="label">Cantidad Total *</label>
                  <input
                    type="number"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({...formData, totalQuantity: parseInt(e.target.value) || 1})}
                    className="w-full"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inventario total físico del producto
                  </p>
                </div>

                <div className="input-group">
                  <label className="label">Precio por Día (CLP) *</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({...formData, pricePerDay: parseInt(e.target.value) || 0})}
                    className="w-full"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="label">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full"
                  rows="3"
                  placeholder="Describe el producto..."
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingProduct.id);
                      resetForm();
                    }}
                    className="btn btn-danger"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Lista de productos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <ProductList products={products} loading={false} />
            
            {products.length === 0 && !showForm && (
              <div className="card text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No hay productos en el inventario
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Crear Primer Producto
                </button>
              </div>
            )}
          </>
        )}

        {/* Información adicional */}
        {products.length > 0 && (
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">💡 Información</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los precios son por día de alquiler</li>
              <li>• La cantidad total representa el inventario físico</li>
              <li>• La disponibilidad se calcula en tiempo real según reservas</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;