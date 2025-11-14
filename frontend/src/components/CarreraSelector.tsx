type Carrera = {
  codigo: string;
  nombre: string;
  catalogo: string;
};

type CarreraSelectorProps = {
  carreras: Carrera[];
  carreraSeleccionada: Carrera | null;
  onSelectCarrera: (carrera: Carrera | null) => void;
};

export function CarreraSelector({ 
  carreras, 
  carreraSeleccionada, 
  onSelectCarrera 
}: CarreraSelectorProps) {
  if (carreras.length <= 1) return null;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Selecciona una carrera:
      </label>
      <select
        className="w-full border border-gray-300 rounded px-3 py-2"
        value={carreraSeleccionada?.codigo || ''}
        onChange={(e) => {
          const seleccionada = carreras.find(c => c.codigo === e.target.value);
          onSelectCarrera(seleccionada || null);
        }}
      >
        <option value="">-- Selecciona --</option>
        {carreras.map((carrera) => (
          <option key={carrera.codigo} value={carrera.codigo}>
            {carrera.nombre} ({carrera.catalogo})
          </option>
        ))}
      </select>
    </div>
  );
}