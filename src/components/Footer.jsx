// Footer.jsx
// Componente de pie de página

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-bold mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📞 +56 9 1234 5678</li>
              <li>📧 contacto@muebles.cl</li>
              <li>📍 Santiago, Chile</li>
            </ul>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-3">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="/inventario" className="hover:text-primary-400 transition">
                  Ver Catálogo
                </a>
              </li>
              <li>
                <a href="/crear-reserva" className="hover:text-primary-400 transition">
                  Hacer Reserva
                </a>
              </li>
              <li>
                <a href="/calendario" className="hover:text-primary-400 transition">
                  Disponibilidad
                </a>
              </li>
            </ul>
          </div>

          {/* Sobre nosotros */}
          <div>
            <h3 className="text-lg font-bold mb-3">Sobre Nosotros</h3>
            <p className="text-sm text-gray-300">
              Productora de muebles especializada en alquiler de mobiliario 
              para eventos, producciones y espacios comerciales.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Productora de Muebles. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
