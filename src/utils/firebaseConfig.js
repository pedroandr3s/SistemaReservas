// firebaseConfig.js
// Configuración y funciones utilitarias para Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, writeBatch, runTransaction } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqlmVPU9_crWt_TGpkLMrtl9XdwSKCbVk",
  authDomain: "muebles-2025.firebaseapp.com",
  projectId: "muebles-2025",
  storageBucket: "muebles-2025.firebasestorage.app",
  messagingSenderId: "272746128095",
  appId: "1:272746128095:web:ced156c72f1bbd29ccff6a",
  measurementId: "G-YR9HYZKLHB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener un producto por ID
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const getProduct = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    } else {
      throw new Error('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

/**
 * Crear un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<string>} ID del producto creado
 */
export const createProduct = async (productData) => {
  try {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto existente
 * @param {string} id - ID del producto
 * @param {Object} updates - Datos a actualizar
 */
export const updateProduct = async (id, updates) => {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Eliminar un producto
 * @param {string} id - ID del producto
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE CLIENTES
// ============================================

/**
 * Obtener todos los clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export const getClients = async () => {
  try {
    const clientsRef = collection(db, 'clients');
    const snapshot = await getDocs(clientsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

/**
 * Obtener un cliente por ID
 * @param {string} id - ID del cliente
 * @returns {Promise<Object>} Datos del cliente
 */
export const getClient = async (id) => {
  try {
    const clientRef = doc(db, 'clients', id);
    const clientSnap = await getDoc(clientRef);
    
    if (clientSnap.exists()) {
      return {
        id: clientSnap.id,
        ...clientSnap.data()
      };
    } else {
      throw new Error('Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

/**
 * Crear un nuevo cliente
 * @param {Object} clientData - Datos del cliente {name, email, phone, notes}
 * @returns {Promise<string>} ID del cliente creado
 */
export const createClient = async (clientData) => {
  try {
    const clientsRef = collection(db, 'clients');
    const docRef = await addDoc(clientsRef, {
      ...clientData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

/**
 * Actualizar un cliente existente
 * @param {string} id - ID del cliente
 * @param {Object} updates - Datos a actualizar
 */
export const updateClient = async (id, updates) => {
  try {
    const clientRef = doc(db, 'clients', id);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw error;
  }
};

/**
 * Eliminar un cliente
 * @param {string} id - ID del cliente
 */
export const deleteClient = async (id) => {
  try {
    const clientRef = doc(db, 'clients', id);
    await deleteDoc(clientRef);
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE RESERVAS
// ============================================

/**
 * Obtener todas las reservas
 * @returns {Promise<Array>} Lista de reservas
 */
export const getReservations = async () => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const snapshot = await getDocs(reservationsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    throw error;
  }
};

/**
 * Obtener reservas por rango de fechas
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Reservas en el rango
 */
export const getReservationsByRange = async (startDate, endDate) => {
  try {
    const reservationsRef = collection(db, 'reservations');
    
    // Buscar reservas que se solapen con el rango especificado
    // Una reserva se solapa si: su inicio es antes del fin del rango Y su fin es después del inicio del rango
    const q = query(
      reservationsRef,
      where('status', '==', 'confirmed') // Solo reservas confirmadas
    );
    
    const snapshot = await getDocs(q);
    const allReservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrar en memoria las que realmente se solapan
    // (Firestore no permite queries complejas con rangos en múltiples campos)
    return allReservations.filter(reservation => {
      const resStart = reservation.startDate;
      const resEnd = reservation.endDate;
      
      // Verificar solapamiento: reserva.inicio <= rango.fin AND reserva.fin >= rango.inicio
      return resStart <= endDate && resEnd >= startDate;
    });
  } catch (error) {
    console.error('Error al obtener reservas por rango:', error);
    throw error;
  }
};

/**
 * Crear una nueva reserva con validación de disponibilidad
 * Usa transacciones para prevenir overbooking
 * @param {Object} reservationData - {clientId, items: [{productId, quantity}], startDate, endDate, status}
 * @returns {Promise<string>} ID de la reserva creada
 */
export const createReservation = async (reservationData) => {
  try {
    const { items, startDate, endDate } = reservationData;
    
    // Ejecutar en una transacción para garantizar consistencia
    const reservationId = await runTransaction(db, async (transaction) => {
      // 1. Verificar disponibilidad de cada producto
      for (const item of items) {
        const { productId, quantity } = item;
        
        // Obtener el producto
        const productRef = doc(db, 'products', productId);
        const productSnap = await transaction.get(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`Producto ${productId} no encontrado`);
        }
        
        const product = productSnap.data();
        
        // Obtener reservas existentes en el rango
        const reservationsRef = collection(db, 'reservations');
        const q = query(
          reservationsRef,
          where('status', '==', 'confirmed')
        );
        
        const reservationsSnap = await getDocs(q);
        const overlappingReservations = reservationsSnap.docs
          .map(doc => doc.data())
          .filter(res => {
            // Filtrar reservas que se solapen
            return res.startDate <= endDate && res.endDate >= startDate;
          });
        
        // Calcular cantidad ya reservada
        let reservedQuantity = 0;
        overlappingReservations.forEach(res => {
          const resItem = res.items.find(i => i.productId === productId);
          if (resItem) {
            reservedQuantity += resItem.quantity;
          }
        });
        
        // Verificar disponibilidad
        const available = product.totalQuantity - reservedQuantity;
        
        if (quantity > available) {
          throw new Error(
            `No hay suficiente disponibilidad de ${product.name}. ` +
            `Solicitado: ${quantity}, Disponible: ${available}`
          );
        }
      }
      
      // 2. Si todo está disponible, crear la reserva
      const reservationsRef = collection(db, 'reservations');
      const newReservationRef = doc(reservationsRef);
      
      transaction.set(newReservationRef, {
        ...reservationData,
        createdAt: new Date().toISOString()
      });
      
      return newReservationRef.id;
    });
    
    return reservationId;
  } catch (error) {
    console.error('Error al crear reserva:', error);
    throw error;
  }
};

/**
 * Actualizar el estado de una reserva
 * @param {string} id - ID de la reserva
 * @param {string} status - Nuevo estado (confirmed/cancelled/pending)
 */
export const updateReservationStatus = async (id, status) => {
  try {
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error);
    throw error;
  }
};

/**
 * Cancelar una reserva (cambiar estado a cancelled)
 * @param {string} id - ID de la reserva
 */
export const cancelReservation = async (id) => {
  try {
    await updateReservationStatus(id, 'cancelled');
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    throw error;
  }
};

/**
 * Obtener reservas de un cliente específico
 * @param {string} clientId - ID del cliente
 * @returns {Promise<Array>} Reservas del cliente
 */
export const getClientReservations = async (clientId) => {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(reservationsRef, where('clientId', '==', clientId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener reservas del cliente:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Registrar un nuevo usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Usuario creado
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Iniciar sesión
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Usuario autenticado
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Observar cambios en el estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 * @returns {Function} Función para cancelar la suscripción
 */
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// FUNCIONES DE STORAGE (OPCIONAL)
// ============================================

/**
 * Subir una imagen y obtener su URL
 * @param {File} file - Archivo a subir
 * @param {string} path - Ruta en Storage
 * @returns {Promise<string>} URL de descarga
 */
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

// Exportar la app inicializada por si se necesita en otros lugares
export default app;
