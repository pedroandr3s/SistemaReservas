// Clients.jsx
// Gestión completa de clientes (vista interna)

import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../utils/firebaseConfig';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
    setFilteredClients(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar cliente');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
      return;
    }

    try {
      await deleteClient(clientId);
      loadClients();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar cliente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      notes: ''
    });
    setEditingClient(null);
    setShowForm(false);
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
              Gestión de Clientes
            </h1>
            <p className="text-gray-600">
              Administra la base de datos de clientes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="label">Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Teléfono *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full"
                  placeholder="+56912345678"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Notas / Observaciones</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full"
                  rows="3"
                  placeholder="Ej: Cliente frecuente, descuento aplicado, etc."
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Actualizar' : 'Crear'} Cliente
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Búsqueda */}
        <div className="card">
          <div className="input-group">
            <label className="label">Buscar Cliente</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              placeholder="Buscar por nombre, email o teléfono..."
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {filteredClients.length} de {clients.length} clientes
          </p>
        </div>

        {/* Lista de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cliente desde {new Date(client.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="bg-primary-100 rounded-full p-2">
                  <span className="text-xl">👤</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">📧</span>
                  <a href={`mailto:${client.email}`} className="hover:text-primary-600">
                    {client.email}
                  </a>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="mr-2">📞</span>
                  <a href={`tel:${client.phone}`} className="hover:text-primary-600">
                    {client.phone}
                  </a>
                </div>
                {client.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                    📝 {client.notes}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(client)}
                  className="btn btn-secondary text-sm flex-1"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="btn btn-danger text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea el primer cliente para comenzar'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
