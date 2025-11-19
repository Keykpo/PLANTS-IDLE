/**
 * Green Tycoon - Settings Component
 *
 * Panel de configuración con opciones de juego.
 */

'use client';

import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';
import { useSoundManager } from '@/lib/soundManager';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const reset = useGameStore((state) => state.reset);
  const stats = useGameStore((state) => state.stats);
  const { volume, setVolume } = useSoundManager();

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
    setIsOpen(false);
    window.location.reload(); // Reload para reiniciar todo
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Botón de configuración */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700"
        title="Configuración"
      >
        ⚙️
      </button>

      {/* Modal de configuración */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel de configuración */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    ⚙️ Configuración
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Volumen */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    🔊 Volumen de sonido
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-gray-400 text-sm mt-1">
                    {Math.round(volume * 100)}%
                  </div>
                </div>

                {/* Info de guardado */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">💾 Guardado</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p>Última sesión: {formatDate(stats.sessionStartTime)}</p>
                    <p>Auto-guardado: ✓ Activo</p>
                    <p className="text-xs text-gray-500 mt-2">
                      El progreso se guarda automáticamente cada 30 segundos en el navegador
                    </p>
                  </div>
                </div>

                {/* Sección de debug/testing */}
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-2">🚨 Zona de peligro</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Resetear eliminará TODO tu progreso permanentemente.
                  </p>

                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      🔄 Resetear progreso
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-white font-bold text-center">
                        ¿Estás seguro?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleReset}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Sí, resetear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info de versión */}
                <div className="text-center text-gray-500 text-xs space-y-1">
                  <p>Green Tycoon v1.0.0</p>
                  <p>Hecho con ❤️ y Next.js</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
