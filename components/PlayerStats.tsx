/**
 * Green Tycoon - Player Stats Component
 *
 * Muestra estadísticas del jugador en tiempo real.
 */

'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import { calculateTotalProduction } from '@/lib/gameBalance';

export default function PlayerStats() {
  const { stats, plants, upgrades, prestigeLevel } = useGameStore();
  const [playTime, setPlayTime] = useState('0m');
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular tiempo jugado
  useEffect(() => {
    const updatePlayTime = () => {
      const now = Date.now();
      const diff = now - stats.sessionStartTime;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setPlayTime(`${hours}h ${minutes}m`);
      } else {
        setPlayTime(`${minutes}m`);
      }
    };

    updatePlayTime();
    const interval = setInterval(updatePlayTime, 10000); // Actualizar cada 10s

    return () => clearInterval(interval);
  }, [stats.sessionStartTime]);

  // Calcular producción por segundo
  const totalProduction = calculateTotalProduction(plants, upgrades.GROWTH_SPEED, prestigeLevel);

  return (
    <div className="relative">
      {/* Botón compacto */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700"
        title="Ver estadísticas del jugador"
      >
        📊 {playTime}
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          {/* Modal de stats */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                📊 Estadísticas del Jugador
              </h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Tiempo jugado */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400 text-sm">⏱️ Tiempo jugado</div>
                <div className="text-white font-bold text-xl">{playTime}</div>
              </div>

              {/* Producción actual */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-400 text-sm">🌱 Producción/seg</div>
                <div className="text-green-400 font-bold text-xl">
                  {totalProduction.toFixed(1)} semillas
                </div>
              </div>

              {/* Stats totales */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">🌾 Semillas totales</div>
                  <div className="text-white font-bold text-lg">
                    {formatNumber(stats.totalSeedsCollected)}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">💰 Monedas totales</div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {formatNumber(stats.totalCoinsEarned)}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">🪴 Macetas</div>
                  <div className="text-white font-bold text-lg">
                    {plants.length}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">⭐ Prestigio</div>
                  <div className="text-purple-400 font-bold text-lg">
                    {prestigeLevel}
                  </div>
                </div>
              </div>

              {/* Ratios */}
              <div className="bg-gray-800 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Eficiencia de venta:</span>
                  <span className="text-white font-medium">
                    {stats.totalSeedsCollected > 0
                      ? ((stats.totalCoinsEarned / stats.totalSeedsCollected) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Semillas por maceta:</span>
                  <span className="text-white font-medium">
                    {plants.length > 0 ? (stats.totalSeedsCollected / plants.length).toFixed(0) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Función helper para formatear números grandes
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.floor(num).toString();
}
