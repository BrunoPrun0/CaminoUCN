// src/components/Sidebar.tsx
import { useNavigate } from 'react-router-dom';

type MenuItem = {
  key: string;
  label: string;
  icon: string;
};

type SidebarProps = {
  paginaActual: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
};

const menuItems: MenuItem[] = [
  { key: 'inicio', label: 'Inicio', icon: '🏠' },
  { key: 'malla', label: 'Mi Malla', icon: '📚' },
  { key: 'proyecciones', label: 'Proyecciones', icon: '📊' },
  { key: 'perfil', label: 'Perfil', icon: '👤' },
];

export function Sidebar({ paginaActual, onPageChange, onLogout }: SidebarProps) {
  return (
    <nav className="fixed left-0 top-0 h-full w-16 hover:w-64 bg-gray-900 text-white transition-all duration-300 z-50 group">
      
      {/* Logo CAMINO */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏞</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl font-bold whitespace-nowrap">
            CAMINO
          </span>
        </div>
      </div>

      {/* Items del Menú */}
      <ul className="space-y-2 p-4">
        {menuItems.map((item) => (
          <li key={item.key}>
            <button
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition duration-200 ${
                paginaActual === item.key 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
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
          <span className="text-lg">🚪</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </nav>
  );
}