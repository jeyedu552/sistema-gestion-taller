import React from 'react';

export default function ConfiguracionPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">construction</span>
      <h2 className="text-xl font-bold text-slate-700">Módulo en Construcción</h2>
      <p className="text-slate-500 mt-2">La configuración del sistema estará disponible en la próxima actualización.</p>
    </div>
  );
}
