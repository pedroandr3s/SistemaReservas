// ReservationForm.jsx
// Formulario para crear nuevas reservas con validación de disponibilidad

import { useState, useEffect } from 'react';
import { getProducts, getClients, createClient, createReservation } from '../utils/firebaseConfig';
import { checkMultipleAvailability, validateDateRange } from '../utils/availability';
import { generateQuote, formatPrice } from '../utils/pricing';
import { useNavigate } from 'react-router-dom';

const ReservationForm = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Cliente
  const [clientId, setClientId] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quote, setQuote] = useState(null);
  const [availabilityCheck, setAvailabilityCheck] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, clientsData] = await Promise.all([
        getProducts(),
        getClients()
      ]);
      setProducts(productsData);
      setClients(clientsData);
    } catch (error) {
      setError('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto a la selección
  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  // Remover producto de la selección
  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  // Actualizar producto seleccionado
  const updateProduct = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setSelectedProducts(updated);
  };

  // Crear nuevo cliente
  const handleCreateClient = async () => {
    try {
      if (!newClient.name || !newClient.email || !newClient.phone) {
        setError('Por favor completa todos los campos del cliente');
        return;
      }

      const id = await createClient(newClient);
      setClientId(id);
      setClients([...clients, { id, ...newClient }]);
      setShowNewClientForm(false);
      setNewClient({ name: '', email: '', phone: '', notes: '' });
      setSuccess('Cliente creado exitosamente');
    } catch (error) {
      setError('Error al crear cliente');
      console.error(error);
    }
  };

  // Verificar disponibilidad y calcular cotización
  const checkAvailabilityAndQuote = async () => {
    setError('');
    setQuote(null);
    setAvailabilityCheck(null);

    // Validar fechas
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.valid) {
      setError(dateValidation.message);
      return;
    }

    // Validar que haya productos
    if (selectedProducts.length === 0 || selectedProducts.some(p => !p.productId)) {
      setError('Debes seleccionar al menos un producto');
      return;
    }

    try {
      // Verificar disponibilidad
      const availability = await checkMultipleAvailability(
        selectedProducts,
        startDate,
        endDate
      );

      setAvailabilityCheck(availability);

      if (availability.allAvailable) {
        // Generar cotización
        const quoteData = await generateQuote(selectedProducts, startDate, endDate);
        setQuote(quoteData);
      } else {
        setError('Algunos productos no tienen disponibilidad suficiente');
      }
    } catch (error) {
      setError('Error al verificar disponibilidad');
      console.error(error);
    }
  };

  // Enviar reserva
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validaciones
      if (!clientId) {
        throw new Error('Debes seleccionar o crear un cliente');
      }

      if (!availabilityCheck?.allAvailable) {
        throw new Error('Verifica la disponibilidad antes de confirmar');
      }

      // Crear reserva
      const reservationData = {
        clientId,
        items: selectedProducts,
        startDate,
        endDate,
        status: 'confirmed',
        totalAmount: quote.finalTotal
      };

      const reservationId = await createReservation(reservationData);
      
      setSuccess(`¡Reserva creada exitosamente! ID: ${reservationId}`);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/calendario');
      }, 2000);

    } catch (error) {
      setError(error.message || 'Error al crear la reserva');
      console.error(error);
    } finally {
      setSubmitting(false);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Sección 1: Cliente */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">1. Información del Cliente</h3>
        
        {!showNewClientForm ? (
          <div className="space-y-4">
            <div className="input-group">
              <label className="label">Seleccionar Cliente</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full"
                required
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => setShowNewClientForm(true)}
              className="btn btn-secondary"
            >
              + Crear Nuevo Cliente
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="input-group">
              <label className="label">Nombre Completo *</label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="w-full"
                required
              />
            </div>

            <div className="input-group">
              <label className="label">Email *</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="w-full"
                required
              />
            </div>

            <div className="input-group">
              <label className="label">Teléfono *</label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                className="w-full"
                placeholder="+56912345678"
                required
              />
            </div>

            <div className="input-group">
              <label className="label">Notas (opcional)</label>
              <textarea
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                className="w-full"
                rows="2"
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCreateClient}
                className="btn btn-primary"
              >
                Crear Cliente
              </button>
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sección 2: Fechas */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">2. Fechas de Alquiler</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Fecha Inicio *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Fecha Fin *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
              required
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Productos */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">3. Seleccionar Productos</h3>
        
        <div className="space-y-4">
          {selectedProducts.map((item, index) => (
            <div key={index} className="flex items-end space-x-3 border-b border-gray-200 pb-4">
              <div className="flex-1 input-group">
                <label className="label">Producto</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">-- Selecciona --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({formatPrice(product.pricePerDay)}/día)
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24 input-group">
                <label className="label">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="btn btn-danger mb-4"
              >
                Eliminar
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addProduct}
            className="btn btn-secondary"
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {/* Botón verificar disponibilidad */}
      <div className="card bg-primary-50">
        <button
          type="button"
          onClick={checkAvailabilityAndQuote}
          className="btn btn-primary w-full text-lg"
          disabled={!startDate || !endDate || selectedProducts.length === 0}
        >
          Verificar Disponibilidad y Ver Cotización
        </button>
      </div>

      {/* Resultados de disponibilidad */}
      {availabilityCheck && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Resultado de Disponibilidad</h3>
          <div className="space-y-2">
            {availabilityCheck.messages.map((message, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded ${
                  message.startsWith('✓') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cotización */}
      {quote && (
        <div className="card bg-green-50 border-2 border-green-200">
          <h3 className="text-xl font-bold mb-4 text-green-900">Cotización</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Período:</span>
              <span className="font-semibold">{quote.days} días</span>
            </div>

            {quote.items.map((item, idx) => (
              <div key={idx} className="border-t border-green-200 pt-2">
                <div className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>{formatPrice(item.total)}</span>
                </div>
              </div>
            ))}

            <div className="border-t-2 border-green-300 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-semibold">{formatPrice(quote.subtotal)}</span>
              </div>

              {quote.volumeDiscount.discountPercent > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Descuento ({quote.volumeDiscount.discountPercent}%):</span>
                  <span>-{formatPrice(quote.volumeDiscount.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold text-green-900 mt-2">
                <span>TOTAL:</span>
                <span>{quote.formattedTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón confirmar */}
      {availabilityCheck?.allAvailable && quote && (
        <div className="card bg-primary-600 text-white">
          <button
            type="submit"
            disabled={submitting}
            className="btn bg-white text-primary-600 hover:bg-gray-100 w-full text-lg font-bold"
          >
            {submitting ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </div>
      )}
    </form>
  );
};

export default ReservationForm;
