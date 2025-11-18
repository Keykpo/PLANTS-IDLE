/**
 * Green Tycoon - Game Loop Component
 *
 * El "heartbeat" del juego. Este componente maneja:
 * - El tick principal del juego (actualización de recursos)
 * - Cálculo de ganancias offline
 * - Sincronización con el servidor
 *
 * Se ejecuta en el background incluso cuando el usuario no interactúa.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { calculateOfflineEarnings, formatTime, formatNumber } from '@/lib/gameBalance';

const TICK_RATE = 100; // Actualizar cada 100ms (10 ticks por segundo)
const SAVE_INTERVAL = 30000; // Guardar cada 30 segundos

export default function GameLoop() {
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineData, setOfflineData] = useState<{
    seeds: number;
    time: number;
    wasCapped: boolean;
  } | null>(null);

  const tick = useGameStore((state) => state.tick);
  const isGameLoopActive = useGameStore((state) => state.isGameLoopActive);
  const startGameLoop = useGameStore((state) => state.startGameLoop);
  const stopGameLoop = useGameStore((state) => state.stopGameLoop);
  const plants = useGameStore((state) => state.plants);
  const upgrades = useGameStore((state) => state.upgrades);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);
  const addSeeds = useGameStore((state) => state.addSeeds);
  const stats = useGameStore((state) => state.stats);

  const lastTickRef = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========== INICIALIZACIÓN ==========

  useEffect(() => {
    // Al montar el componente, calcula ganancias offline
    calculateOfflineProgress();

    // Inicia el game loop
    startGameLoop();

    return () => {
      stopGameLoop();
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  // ========== CÁLCULO DE OFFLINE ==========

  const calculateOfflineProgress = () => {
    const lastSaveTime = stats.lastSaveTime;
    const now = Date.now();
    const timeDiff = now - lastSaveTime;

    // Si ha pasado más de 1 minuto, mostrar progreso offline
    if (timeDiff > 60000) {
      // Calcula producción total
      const totalProduction = plants.reduce((total, plant) => {
        if (!plant.isActive) return total;

        const { calculatePlantProduction } = require('@/lib/gameBalance');
        const production = calculatePlantProduction(
          plant.tier,
          upgrades.GROWTH_SPEED,
          prestigeLevel
        );

        return total + production;
      }, 0);

      // Calcula ganancias offline
      const offlineEarnings = calculateOfflineEarnings(
        totalProduction,
        lastSaveTime,
        upgrades.OFFLINE_EARNINGS
      );

      if (offlineEarnings.seedsGenerated > 0) {
        addSeeds(offlineEarnings.seedsGenerated);
        setOfflineData({
          seeds: offlineEarnings.seedsGenerated,
          time: offlineEarnings.timeCalculated,
          wasCapped: offlineEarnings.wasCapped,
        });
        setShowOfflineModal(true);
      }
    }
  };

  // ========== GAME LOOP PRINCIPAL ==========

  useEffect(() => {
    if (!isGameLoopActive) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastTickRef.current;

      // Solo ejecuta el tick si ha pasado suficiente tiempo
      if (deltaTime >= TICK_RATE) {
        tick();
        lastTickRef.current = now;
      }
    }, TICK_RATE);

    return () => clearInterval(intervalId);
  }, [isGameLoopActive, tick]);

  // ========== AUTO-SAVE ==========

  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      // Aquí podrías implementar sincronización con el servidor
      // Por ahora, Zustand ya persiste en localStorage automáticamente
      console.log('Auto-save triggered');
    }, SAVE_INTERVAL);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  // ========== MODAL DE OFFLINE ==========

  if (showOfflineModal && offlineData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center">
            {/* Icono */}
            <div className="text-6xl mb-4">💤</div>

            {/* Título */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenido de Vuelta!
            </h2>

            {/* Tiempo offline */}
            <p className="text-gray-600 mb-6">
              Estuviste ausente por <span className="font-bold text-green-600">{formatTime(offlineData.time)}</span>
            </p>

            {/* Recompensas */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Tus plantas produjeron:</p>
              <div className="text-4xl font-bold text-green-700">
                {formatNumber(offlineData.seeds)} 🌾
              </div>
              <p className="text-xs text-gray-500 mt-2">Semillas</p>
            </div>

            {/* Advertencia si se alcanzó el cap */}
            {offlineData.wasCapped && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Alcanzaste el límite de tiempo offline. Mejora "Ganancias Offline" para ganar más.
                </p>
              </div>
            )}

            {/* Botón */}
            <button
              onClick={() => setShowOfflineModal(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ¡Continuar Jugando!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Este componente no renderiza nada visible normalmente
  return null;
}
