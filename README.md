# Sistema Interno de Gestión de Inventario y Reservas
## Productora de Muebles - Versión 2.0 (Uso Interno)

## 🎯 Cambios Principales vs Versión 1.0

### ✅ Nueva Perspectiva: 100% Interno
- **Login obligatorio** desde el inicio
- **Sin acceso público** - Solo empleados autenticados
- **Dashboard administrativo** como página principal
- **Gestión completa** desde perspectiva de la empresa

### 🔄 Cambios Específicos

#### Eliminado (Versión 1.0)
- ❌ Landing page pública (Home)
- ❌ Catálogo abierto sin login
- ❌ Enfoque de e-commerce
- ❌ Panel "Admin" como sección separada

#### Agregado (Versión 2.0)
- ✅ Página de Login profesional
- ✅ Dashboard interno con métricas
- ✅ Página dedicada de Clientes
- ✅ Página dedicada de Reservas
- ✅ Protección de todas las rutas
- ✅ Navegación interna mejorada

---

## 🚀 Inicio Rápido

### 1. Instalación
```bash
npm install
```

### 2. Configurar Firebase
Edita `src/utils/firebaseConfig.js` con tus credenciales (líneas 14-20)

### 3. Iniciar
```bash
npm run dev
```

### 4. Primer Acceso
1. Abre http://localhost:5173
2. Verás la página de Login
3. Click en "Registrarse"
4. Crea tu cuenta de administrador
5. ¡Listo! Accederás al Dashboard

---

## 📁 Estructura de Navegación

```
/login          → Página de inicio de sesión
/dashboard      → Panel principal (requiere login)
/crear-reserva  → Formulario para crear reservas (requiere login)
/reservas       → Lista y gestión de reservas (requiere login)
/calendario     → Vista de calendario (requiere login)
/inventario     → Gestión de productos (requiere login)
/clientes       → Gestión de clientes (requiere login)
```

**Todas las rutas (excepto /login) requieren autenticación.**

---

## 🎨 Páginas Principales

### 1. Login (`/login`)
- Inicio de sesión y registro
- Validación de credenciales
- Diseño profesional corporativo
- Sin acceso si no estás autenticado

### 2. Dashboard (`/dashboard`)
- **Estadísticas**: Productos, clientes, reservas activas y pendientes
- **Acciones rápidas**: Crear reserva, agregar producto, ver calendario
- **Reservas recientes**: Últimas 5 reservas
- **Alertas de stock**: Productos con inventario bajo

### 3. Gestión de Reservas (`/reservas`)
- Lista completa de todas las reservas
- Filtros por estado (confirmada, pendiente, cancelada)
- Cambiar estado de reservas
- Ver detalles completos (cliente, productos, fechas, monto)
- Confirmar o cancelar reservas

### 4. Gestión de Clientes (`/clientes`)
- Lista completa de clientes
- Crear, editar y eliminar clientes
- Búsqueda por nombre, email o teléfono
- Información de contacto y notas

### 5. Crear Reserva (`/crear-reserva`)
- **Perspectiva interna**: El empleado crea la reserva para el cliente
- Seleccionar o crear cliente
- Elegir productos y cantidades
- Verificar disponibilidad en tiempo real
- Calcular precio total con descuentos
- Confirmar reserva

### 6. Calendario (`/calendario`)
- Vista mensual de reservas
- Indicadores visuales de ocupación
- Click en día para ver detalles
- Solo muestra reservas confirmadas

### 7. Inventario (`/inventario`)
- Lista de productos con filtros
- CRUD completo desde la interfaz
- Búsqueda y categorías
- Ver disponibilidad por producto

---

## 🔐 Seguridad

### Autenticación Obligatoria
Todas las rutas están protegidas con `ProtectedRoute`:

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Reglas de Firestore
```javascript
// Todas las operaciones requieren autenticación
match /products/{productId} {
  allow read, write: if request.auth != null;
}
match /clients/{clientId} {
  allow read, write: if request.auth != null;
}
match /reservations/{reservationId} {
  allow read, write: if request.auth != null;
}
```

---

## 📊 Flujo de Trabajo Típico

### Caso 1: Cliente llama para reservar
1. Empleado inicia sesión en `/login`
2. Va a `/crear-reserva`
3. Busca cliente existente o crea nuevo
4. Selecciona productos y fechas
5. Sistema verifica disponibilidad
6. Confirma reserva
7. Sistema actualiza inventario y calendario

### Caso 2: Revisar reservas del día
1. Empleado va a `/dashboard`
2. Ve reservas activas en las tarjetas
3. Click en "Ver reservas"
4. Filtra por estado
5. Puede confirmar/cancelar desde ahí

### Caso 3: Agregar nuevo producto
1. Va a `/inventario`
2. Click en "Crear Nuevo Producto"
3. Completa formulario
4. Guarda
5. Producto disponible inmediatamente

---

## 🆕 Nuevas Funcionalidades

### Dashboard con Métricas
- Total de productos en inventario
- Clientes registrados
- Reservas activas
- Reservas pendientes de confirmar
- Alertas de stock bajo
- Acciones rápidas

### Gestión de Reservas Mejorada
- Cambiar estado (pending → confirmed, confirmed → cancelled)
- Ver todas las reservas en una vista
- Filtros por estado
- Información completa del cliente y productos
- Cálculo de monto total

### Gestión de Clientes Separada
- CRUD completo de clientes
- Búsqueda avanzada
- Información de contacto
- Notas sobre el cliente

---

## 🔧 Tecnologías (Sin cambios)

- React 18 + Vite
- TailwindCSS
- Firebase (Firestore + Authentication)
- React Router DOM
- React Calendar
- date-fns

---

## 📦 Archivos Modificados

### Nuevos
- `src/pages/Login.jsx` - Página de login profesional
- `src/pages/Dashboard.jsx` - Panel principal con métricas
- `src/pages/Clients.jsx` - Gestión completa de clientes
- `src/pages/Reservations.jsx` - Gestión completa de reservas

### Modificados
- `src/App.jsx` - Rutas protegidas y redirecciones
- `src/components/Header.jsx` - Navegación interna mejorada

### Sin cambios
- Todos los archivos de `utils/` (firebaseConfig, availability, pricing)
- Componentes: ProductCard, ProductList, CalendarView, etc.
- Páginas: Inventory, ProductDetail, CalendarPage, CreateReservation

---

## 🎯 Casos de Uso

### Para Gerente de Operaciones
```
Login → Dashboard → Ver métricas → Filtrar reservas pendientes → Confirmar
```

### Para Vendedor
```
Cliente llama → Login → Crear Reserva → Buscar cliente → Seleccionar productos → Verificar disponibilidad → Confirmar
```

### Para Bodeguero
```
Login → Inventario → Agregar nuevos productos → Ver stock bajo
```

### Para Administrador
```
Login → Dashboard → Ver todas las métricas → Gestionar clientes → Revisar reservas → Actualizar inventario
```

---

## 🔄 Migración desde v1.0

Si ya tienes la v1.0 corriendo:

1. **Los datos NO cambian** - Firestore sigue igual
2. **Reemplaza los archivos** con los de v2.0
3. **Agrega las reglas de seguridad** actualizadas
4. **Reinicia** `npm run dev`
5. **Login obligatorio** - Crea usuario en primer acceso

---

## ✅ Ventajas Versión Interna

### Seguridad
✓ No hay acceso público
✓ Todas las rutas protegidas
✓ Solo personal autorizado

### Eficiencia
✓ Dashboard con info clave
✓ Acciones rápidas
✓ Navegación optimizada para empleados

### Control
✓ Empleados crean reservas para clientes
✓ Gestión centralizada
✓ Métricas en tiempo real

### Profesionalismo
✓ Interfaz corporativa
✓ Flujo de trabajo claro
✓ Herramienta ERP/CRM

---

## 🚀 Próximos Pasos Sugeridos

1. **Roles de usuario**: Diferenciar admin, vendedor, bodeguero
2. **Reportes**: Exportar a PDF/Excel
3. **Notificaciones**: Emails automáticos
4. **Historial**: Log de cambios por usuario
5. **Multi-sucursal**: Gestión de múltiples bodegas

---

## 📞 Soporte

Revisa la documentación completa en la v1.0 que incluye:
- FAQ.md
- ARQUITECTURA.md
- DEPLOYMENT-CHECKLIST.md

Los conceptos técnicos (disponibilidad, pricing, transacciones) **no cambiaron**.

---

**Versión:** 2.0 (Interna)  
**Fecha:** Octubre 2025  
**Enfoque:** 100% Uso Interno de la Empresa
