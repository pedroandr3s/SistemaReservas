// CalendarView.jsx
// Vista de calendario con reservas

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getReservations } from '../utils/firebaseConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CalendarView = () => {
  const [date, setDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getReservations();
      // Filtrar solo reservas confirmadas
      const confirmed = data.filter(r => r.status === 'confirmed');
      setReservations(confirmed);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una fecha tiene reservas
  const hasReservations = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.some(reservation => {
      return dateStr >= reservation.startDate && dateStr <= reservation.endDate;
    });
  };

  // Obtener reservas de una fecha específica
  const getReservationsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(reservation => {
      return dateStr >= reservation.startDate && dateStr <= reservation.endDate;
    });
  };

  // Personalizar el aspecto de cada día
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (hasReservations(date)) {
        return 'react-calendar__tile--hasReservation';
      }
    }
    return null;
  };

  // Contenido adicional en cada día
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayReservations = getReservationsForDate(date);
      if (dayReservations.length > 0) {
        return (
          <div className="text-xs mt-1">
            <span className="bg-yellow-500 text-white rounded-full px-1">
              {dayReservations.length}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  const handleDateClick = (value) => {
    setSelectedDate(value);
  };

  const selectedDateReservations = selectedDate 
    ? getReservationsForDate(selectedDate)
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <div className="lg:col-span-2">
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Calendario de Reservas</h2>
          
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 mr-2"></div>
              <span>Días con reservas</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary-100 mr-2"></div>
              <span>Hoy</span>
            </div>
          </div>

          <Calendar
            onChange={handleDateClick}
            value={date}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="es-ES"
            className="w-full"
          />
        </div>
      </div>

      {/* Panel de detalles */}
      <div className="lg:col-span-1">
        <div className="card sticky top-4">
          {selectedDate ? (
            <>
              <h3 className="text-xl font-bold mb-4">
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </h3>

              {selectedDateReservations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedDateReservations.length} reserva(s) activa(s)
                  </p>

                  {selectedDateReservations.map(reservation => (
                    <div 
                      key={reservation.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          Reserva #{reservation.id.slice(0, 8)}
                        </span>
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          {reservation.status}
                        </span>
                      </div>

                      <div className="text-sm space-y-1 text-gray-700">
                        <p>
                          <strong>Período:</strong>{' '}
                          {format(new Date(reservation.startDate), 'dd/MM/yy')} - {' '}
                          {format(new Date(reservation.endDate), 'dd/MM/yy')}
                        </p>
                        <p>
                          <strong>Items:</strong> {reservation.items.length} producto(s)
                        </p>
                        <div className="mt-2 text-xs">
                          {reservation.items.map((item, idx) => (
                            <div key={idx} className="text-gray-600">
                              • {item.quantity} unidad(es) de producto {item.productId.slice(0, 8)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No hay reservas para esta fecha
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    ¡Disponible para nuevas reservas!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Selecciona una fecha en el calendario
              </p>
              <p className="text-sm text-gray-400 mt-2">
                para ver las reservas del día
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
