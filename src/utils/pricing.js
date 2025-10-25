// pricing.js
// Funciones para cálculos de precios y costos

import { calculateDays } from './availability';
import { getProduct } from './firebaseConfig';

/**
 * Formatea un número como precio en pesos chilenos
 * @param {number} amount - Monto a formatear
 * @returns {string} Precio formateado (ej: "$15.000")
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calcula el precio de un producto por un rango de fechas
 * @param {number} pricePerDay - Precio por día del producto
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @param {number} quantity - Cantidad de unidades
 * @returns {Object} {days, pricePerDay, quantity, subtotal, total}
 */
export const calculateItemPrice = (pricePerDay, startDate, endDate, quantity) => {
  const days = calculateDays(startDate, endDate);
  const subtotal = pricePerDay * quantity;
  const total = subtotal * days;
  
  return {
    days,
    pricePerDay,
    quantity,
    subtotal, // Precio por día para todas las unidades
    total     // Precio total por todos los días
  };
};

/**
 * Calcula el precio total de una reserva
 * @param {Array} items - Array de {productId, quantity, pricePerDay}
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Object} Desglose de precios
 */
export const calculateReservationPrice = (items, startDate, endDate) => {
  const days = calculateDays(startDate, endDate);
  
  const itemsBreakdown = items.map(item => {
    const calculation = calculateItemPrice(
      item.pricePerDay,
      startDate,
      endDate,
      item.quantity
    );
    
    return {
      productId: item.productId,
      productName: item.productName || 'Producto',
      ...calculation
    };
  });
  
  const subtotal = itemsBreakdown.reduce((sum, item) => sum + item.total, 0);
  
  return {
    days,
    startDate,
    endDate,
    items: itemsBreakdown,
    subtotal,
    total: subtotal // Aquí podrías agregar descuentos, impuestos, etc.
  };
};

/**
 * Calcula el precio total obteniendo los productos desde Firestore
 * Útil cuando solo tienes los IDs de productos
 * @param {Array} items - Array de {productId, quantity}
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Desglose de precios completo
 */
export const calculateReservationPriceWithProducts = async (items, startDate, endDate) => {
  try {
    // Obtener información de productos
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        const product = await getProduct(item.productId);
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          pricePerDay: product.pricePerDay
        };
      })
    );
    
    return calculateReservationPrice(itemsWithPrices, startDate, endDate);
  } catch (error) {
    console.error('Error al calcular precio con productos:', error);
    throw error;
  }
};

/**
 * Aplica un descuento porcentual
 * @param {number} amount - Monto original
 * @param {number} discountPercent - Porcentaje de descuento (0-100)
 * @returns {Object} {original, discount, final}
 */
export const applyDiscount = (amount, discountPercent) => {
  const discount = Math.round(amount * (discountPercent / 100));
  const final = amount - discount;
  
  return {
    original: amount,
    discountPercent,
    discount,
    final
  };
};

/**
 * Calcula descuentos por volumen (ejemplo: 10+ días = 10% descuento)
 * @param {number} days - Número de días
 * @param {number} basePrice - Precio base
 * @returns {Object} {discount, finalPrice}
 */
export const calculateVolumeDiscount = (days, basePrice) => {
  let discountPercent = 0;
  
  if (days >= 30) {
    discountPercent = 20; // 20% para 30+ días
  } else if (days >= 14) {
    discountPercent = 15; // 15% para 14-29 días
  } else if (days >= 7) {
    discountPercent = 10; // 10% para 7-13 días
  }
  
  if (discountPercent > 0) {
    return applyDiscount(basePrice, discountPercent);
  }
  
  return {
    original: basePrice,
    discountPercent: 0,
    discount: 0,
    final: basePrice
  };
};

/**
 * Genera un resumen de cotización para mostrar al cliente
 * @param {Array} items - Items con productos
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {Promise<Object>} Cotización completa
 */
export const generateQuote = async (items, startDate, endDate) => {
  try {
    const pricing = await calculateReservationPriceWithProducts(items, startDate, endDate);
    const volumeDiscount = calculateVolumeDiscount(pricing.days, pricing.subtotal);
    
    return {
      ...pricing,
      volumeDiscount,
      finalTotal: volumeDiscount.final,
      formattedTotal: formatPrice(volumeDiscount.final)
    };
  } catch (error) {
    console.error('Error al generar cotización:', error);
    throw error;
  }
};

/**
 * Calcula el depósito de garantía (ej: 30% del total)
 * @param {number} totalAmount - Monto total
 * @param {number} depositPercent - Porcentaje de depósito (default: 30)
 * @returns {Object} {total, depositPercent, deposit, remaining}
 */
export const calculateDeposit = (totalAmount, depositPercent = 30) => {
  const deposit = Math.round(totalAmount * (depositPercent / 100));
  const remaining = totalAmount - deposit;
  
  return {
    total: totalAmount,
    depositPercent,
    deposit,
    remaining
  };
};

/**
 * Valida que el precio calculado sea correcto
 * @param {number} price - Precio a validar
 * @returns {boolean}
 */
export const isValidPrice = (price) => {
  return typeof price === 'number' && price > 0 && !isNaN(price);
};
