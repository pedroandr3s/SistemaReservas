// AdminProductForm.jsx
// Formulario para crear y editar productos

import { useState, useEffect } from 'react';
import { createProduct, updateProduct, deleteProduct } from '../utils/firebaseConfig';

const AdminProductForm = ({ product = null, onSuccess, onCancel }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    category: 'silla',
    totalQuantity: 1,
    pricePerDay: 1000,
    description: '',
    imageUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'silla',
        totalQuantity: product.totalQuantity || 1,
        pricePerDay: product.pricePerDay || 1000,
        description: product.description || '',
        imageUrl: product.imageUrl || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validaciones
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (formData.totalQuantity < 1) {
        throw new Error('La cantidad debe ser al menos 1');
      }
      if (formData.pricePerDay < 0) {
        throw new Error('El precio debe ser positivo');
      }

      if (isEditing) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }

      onSuccess?.();
    } catch (error) {
      setError(error.message || 'Error al guardar producto');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteProduct(product.id);
      onSuccess?.();
    } catch (error) {
      setError('Error al eliminar producto');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="input-group">
        <label className="label">Nombre del Producto *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full"
          placeholder="Ej: Silla Vintage Madera"
          required
        />
      </div>

      <div className="input-group">
        <label className="label">Categoría *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full"
          required
        >
          <option value="silla">Silla</option>
          <option value="mesa">Mesa</option>
          <option value="sillon">Sillón</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="input-group">
        <label className="label">Cantidad Total Disponible *</label>
        <input
          type="number"
          name="totalQuantity"
          value={formData.totalQuantity}
          onChange={handleChange}
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
          name="pricePerDay"
          value={formData.pricePerDay}
          onChange={handleChange}
          className="w-full"
          min="0"
          step="100"
          required
        />
      </div>

      <div className="input-group">
        <label className="label">URL de Imagen</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
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
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full"
          rows="3"
          placeholder="Describe el producto..."
        ></textarea>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary flex-1"
        >
          {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancelar
          </button>
        )}

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={submitting}
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminProductForm;
