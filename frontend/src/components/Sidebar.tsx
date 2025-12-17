type MenuItem = {
  key: string;
  label: string;
  icon: string;
};

// agregamos rol a las props
type SidebarProps = {
  paginaActual: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  rol?: 'ADMIN' | 'STUDENT'; 
};

// menú normal (Estudiante)
const menuEstudiante: MenuItem[] = [
  { key: "inicio", label: "Inicio", icon: "fi fi-rr-home" },
  { key: "malla", label: "Mi Malla", icon: "fi fi-rr-ballot" },
  { key: "proyecciones", label: "Proyecciones", icon: "fi fi-rr-chart-histogram" },
  { key: "perfil", label: "Perfil", icon: "fi fi-rr-user-graduate" },
];

// menú nuevo (Admin)
const menuAdmin: MenuItem[] = [
  { key: "dashboard", label: "Estadisticas", icon: "fi fi-rr-stats" }, 
  { key: "perfil", label: "Mi Perfil", icon: "fi fi-rr-user" },
];

export function Sidebar({
  paginaActual,
  onPageChange,
  onLogout,
  rol // recibimos el rol
}: SidebarProps) {

  // decide qué menú mostrar (admin o user)
  const itemsAMostrar = rol === 'ADMIN' ? menuAdmin : menuEstudiante;

  return (
    <nav className="fixed left-0 top-0 h-full w-16 hover:w-64 bg-gray-900 text-white transition-all duration-300 z-50 group">
      {/* Logo CAMINO */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
          🏞
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl font-bold whitespace-nowrap">
            Camino
          </span>
        </div>
      </div>

      {/* Items del Menú */}
      <ul className="space-y-2 p-4">
        {itemsAMostrar.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition duration-200 ${
                paginaActual === item.key
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              <i className={item.icon}></i>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Cerrar Sesión */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition duration-200"
        >
          <i className="fi fi-rr-exit"></i>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </nav>
  );
}