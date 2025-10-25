// availability.js
// Funciones para calcular disponibilidad de productos en rangos de fechas

import { getReservationsByRange, getProduct } from './firebaseConfig';

/**
 * Verifica si dos rangos de fechas se solapan
 * @param {string} start1 - Fecha inicio rango 1 (YYYY-MM-DD)
 * @param {string} end1 - Fecha fin rango 1 (YYYY-MM-DD)
 * @param {string} start2 - Fecha inicio rango 2 (YYYY-MM-DD)
 * @param {string} end2 - Fecha fin rango 2 (YYYY-MM-DD)
 * @returns {boolean} true si se solapan
 */
export const datesOverlap = (start1, end1, start2, end2) => {
  return start1 <= end2 && end1 >= start2;
};

/**
 * Calcula cuántos días hay entre dos fechas (inclusive)
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {number} Número de días
 */
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 para incluir ambos días
};

/**
 * Verifica la disponibilidad de un producto para un rango de fechas
 * Esta es la función principal de verificación de disponibilidad
 * 
 * @param {string} productId - ID del producto
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @param {number} requestedQuantity - Cantidad solicitada
 * @returns {Promise<Object>} {available: boolean, maxAvailable: number, message: string}
 */
export const checkAvailability = async (productId, startDate, endDate, requestedQuantity) => {
  try {
    // 1. Obtener el producto para conocer la cantidad total
    const product = await getProduct(productId);
    
    if (!product) {
      return {
        available: false,
        maxAvailable: 0,
        message: 'Producto no encontrado'
      };
    }
    
    // 2. Obtener todas las reservas confirmadas en el rango
    const reservations = await getReservationsByRange(startDate, endDate);
    
    // 3. Calcular cuántas unidades están reservadas
    let reservedQuantity = 0;
    
    reservations.forEach(reservation => {
      // Buscar si este producto está en la reserva
      const item = reservation.items.find(i => i.productId === productId);
      if (item) {
        reservedQuantity += item.quantity;
      }
    });
    
    // 4. Calcular disponibilidad
    const maxAvailable = product.totalQuantity - reservedQuantity;
    const available = requestedQuantity <= maxAvailable;
    
    // 5. Construir mensaje
    let message = '';
    if (available) {
      message = `✓ ${requestedQuantity} unidades disponibles de ${product.name}`;
    } else {
      message = `✗ Solo hay ${maxAvailable} unidades disponibles de ${product.name}. Solicitaste ${requestedQuantity}.`;
    }
    
    return {
      available,
      maxAvailable,
      totalQuantity: product.totalQuantity,
      reservedQuantity,
      message
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return {
      available: false,
      maxAvailable: 0,
      message: `Error al verificar disponibilidad: ${error.message}`
    };
  }
};

/**
 * Verifica la disponibilidad de múltiples productos simultáneamente
 * Útil para validar una reserva completa
 * 
 * @param {Array} items - Array de {productId, quantity}
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} {allAvailable: boolean, results: Array, messages: Array}
 */
export const checkMultipleAvailability = async (items, startDate, endDate) => {
  try {
    // Verificar cada producto en paralelo
    const checks = await Promise.all(
      items.map(item => 
        checkAvailability(item.productId, startDate, endDate, item.quantity)
      )
    );
    
    // Determinar si todos están disponibles
    const allAvailable = checks.every(check => check.available);
    
    // Recopilar mensajes
    const messages = checks.map(check => check.message);
    
    return {
      allAvailable,
      results: checks,
      messages
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad múltiple:', error);
    throw error;
  }
};

/**
 * Obtiene la disponibilidad día por día para un producto en un rango
 * Útil para visualizar en calendarios
 * 
 * @param {string} productId - ID del producto
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Objeto con disponibilidad por día {YYYY-MM-DD: available}
 */
export const getAvailabilityByDay = async (productId, startDate, endDate) => {
  try {
    const product = await getProduct(productId);
    const reservations = await getReservationsByRange(startDate, endDate);
    
    // Generar array de fechas
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calcular disponibilidad para cada día
    const availability = {};
    
    dates.forEach(date => {
      let reserved = 0;
      
      // Contar reservas que incluyen este día
      reservations.forEach(reservation => {
        if (date >= reservation.startDate && date <= reservation.endDate) {
          const item = reservation.items.find(i => i.productId === productId);
          if (item) {
            reserved += item.quantity;
          }
        }
      });
      
      availability[date] = {
        total: product.totalQuantity,
        reserved,
        available: product.totalQuantity - reserved
      };
    });
    
    return availability;
  } catch (error) {
    console.error('Error al obtener disponibilidad por día:', error);
    throw error;
  }
};

/**
 * Encuentra el próximo período disponible para una cantidad específica
 * 
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad deseada
 * @param {string} startSearchDate - Desde qué fecha buscar (YYYY-MM-DD)
 * @param {number} daysNeeded - Duración del alquiler en días
 * @returns {Promise<Object>} {available: boolean, startDate: string, endDate: string}
 */
export const findNextAvailablePeriod = async (productId, quantity, startSearchDate, daysNeeded) => {
  try {
    // Buscar en los próximos 90 días
    const searchEndDate = new Date(startSearchDate);
    searchEndDate.setDate(searchEndDate.getDate() + 90);
    
    const availabilityByDay = await getAvailabilityByDay(
      productId, 
      startSearchDate, 
      searchEndDate.toISOString().split('T')[0]
    );
    
    const dates = Object.keys(availabilityByDay).sort();
    
    // Buscar secuencia de días consecutivos con disponibilidad
    for (let i = 0; i < dates.length - daysNeeded + 1; i++) {
      let consecutiveAvailable = true;
      
      for (let j = 0; j < daysNeeded; j++) {
        if (availabilityByDay[dates[i + j]].available < quantity) {
          consecutiveAvailable = false;
          break;
        }
      }
      
      if (consecutiveAvailable) {
        return {
          available: true,
          startDate: dates[i],
          endDate: dates[i + daysNeeded - 1]
        };
      }
    }
    
    return {
      available: false,
      startDate: null,
      endDate: null,
      message: `No hay ${daysNeeded} días consecutivos con ${quantity} unidades disponibles en los próximos 90 días`
    };
  } catch (error) {
    console.error('Error al buscar período disponible:', error);
    throw error;
  }
};

/**
 * Valida que un rango de fechas sea válido
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Object} {valid: boolean, message: string}
 */
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start > end) {
    return {
      valid: false,
      message: 'La fecha de inicio debe ser anterior a la fecha de fin'
    };
  }
  
  if (start < today) {
    return {
      valid: false,
      message: 'La fecha de inicio no puede ser en el pasado'
    };
  }
  
  return {
    valid: true,
    message: 'Rango de fechas válido'
  };
};

/**
 * Obtiene un resumen de ocupación para todos los productos en un rango
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Array con resumen por producto
 */
export const getOccupancySummary = async (startDate, endDate) => {
  try {
    const reservations = await getReservationsByRange(startDate, endDate);
    
    // Agrupar por producto
    const productOccupancy = {};
    
    reservations.forEach(reservation => {
      reservation.items.forEach(item => {
        if (!productOccupancy[item.productId]) {
          productOccupancy[item.productId] = {
            productId: item.productId,
            totalReserved: 0,
            reservationsCount: 0
          };
        }
        productOccupancy[item.productId].totalReserved += item.quantity;
        productOccupancy[item.productId].reservationsCount += 1;
      });
    });
    
    return Object.values(productOccupancy);
  } catch (error) {
    console.error('Error al obtener resumen de ocupación:', error);
    throw error;
  }
};
