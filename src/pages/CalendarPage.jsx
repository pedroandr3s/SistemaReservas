// CalendarPage.jsx
// Página principal del calendario

import CalendarView from '../components/CalendarView';

const CalendarPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <h1 className="text-4xl font-bold mb-2">Calendario de Reservas</h1>
        <p className="text-primary-100">
          Visualiza la disponibilidad y reservas existentes por fecha
        </p>
      </div>

      {/* Componente de calendario */}
      <CalendarView />

      {/* Instrucciones */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Cómo usar el calendario</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los días con fondo amarillo tienen reservas activas</li>
          <li>• Haz clic en cualquier día para ver detalles de las reservas</li>
          <li>• El número en cada día indica la cantidad de reservas</li>
          <li>• Solo se muestran reservas con estado "confirmado"</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarPage;
