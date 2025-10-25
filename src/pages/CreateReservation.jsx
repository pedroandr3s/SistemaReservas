// CreateReservation.jsx
// Página para crear nuevas reservas

import ReservationForm from '../components/ReservationForm';

const CreateReservation = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <h1 className="text-4xl font-bold mb-2">Nueva Reserva</h1>
        <p className="text-primary-100">
          Completa el formulario para crear una reserva. Verificaremos la disponibilidad en tiempo real.
        </p>
      </div>

      {/* Formulario */}
      <ReservationForm />

      {/* Ayuda */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="font-bold text-yellow-900 mb-2">💡 Consejos para tu reserva</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Verifica disponibilidad:</strong> Siempre haz clic en "Verificar Disponibilidad" antes de confirmar</li>
          <li>• <strong>Fechas flexibles:</strong> Si un producto no está disponible, intenta con otras fechas</li>
          <li>• <strong>Descuentos:</strong> Alquileres de 7+ días tienen descuento automático</li>
          <li>• <strong>Contacto:</strong> Si tienes dudas, contáctanos antes de confirmar</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateReservation;
