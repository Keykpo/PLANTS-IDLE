/**
 * Green Tycoon - Plant Component
 *
 * Componente individual para cada planta.
 * Maneja su propio estado visual y recolección.
 */

'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { calculatePlantProduction } from '@/lib/gameBalance';
import { formatNumber } from '@/lib/gameBalance';
import { useFloatingNumbers } from '@/components/FloatingNumber';
import { useSoundManager } from '@/lib/soundManager';

interface PlantProps {
  id: string;
  tier: 'NORMAL' | 'PREMIUM';
  accumulatedSeeds: number;
  isActive: boolean;
}

export default function Plant({ id, tier, accumulatedSeeds, isActive }: PlantProps) {
  const [isGrowing, setIsGrowing] = useState(false);
  const [showHarvestEffect, setShowHarvestEffect] = useState(false);

  const harvestPlant = useGameStore((state) => state.harvestPlant);
  const upgrades = useGameStore((state) => state.upgrades);
  const prestigeLevel = useGameStore((state) => state.prestigeLevel);

  const hasAutoHarvest = upgrades.AUTO_HARVEST >= 1;
  const isPremium = tier === 'PREMIUM';

  // Hook para números flotantes
  const { addFloatingNumber, FloatingNumbersRenderer } = useFloatingNumbers();

  // Hook para sonidos
  const { play: playSound } = useSoundManager();

  // Calcula la producción por segundo de esta planta
  const productionRate = calculatePlantProduction(
    tier,
    upgrades.GROWTH_SPEED,
    prestigeLevel
  );

  // Efecto de crecimiento animado
  useEffect(() => {
    if (isActive && accumulatedSeeds > 0 && !hasAutoHarvest) {
      setIsGrowing(true);
      const timeout = setTimeout(() => setIsGrowing(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [accumulatedSeeds, isActive, hasAutoHarvest]);

  // Handler de recolección
  const handleHarvest = () => {
    if (accumulatedSeeds > 0 && !hasAutoHarvest) {
      const harvestedAmount = Math.floor(accumulatedSeeds);

      // Reproducir sonido de recolección
      playSound('harvest');

      // Mostrar floating number
      addFloatingNumber(harvestedAmount, 'seeds');

      // Recolectar
      harvestPlant(id);
      setShowHarvestEffect(true);
      setTimeout(() => setShowHarvestEffect(false), 500);
    }
  };

  return (
    <div
      className={`
        relative group
        w-32 h-32
        rounded-2xl border-4
        transition-all duration-300
        ${isPremium
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-lg shadow-yellow-200'
          : 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-100'
        }
        ${isGrowing ? 'scale-105' : 'scale-100'}
        ${hasAutoHarvest ? 'cursor-default' : accumulatedSeeds > 0 ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
        ${!isActive && 'opacity-50 grayscale'}
      `}
      onClick={handleHarvest}
    >
      {/* Badge Premium */}
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
          ⭐ 2.5x
        </div>
      )}

      {/* Badge Auto-Harvest */}
      {hasAutoHarvest && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
          AUTO
        </div>
      )}

      {/* Planta Visual */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-6xl transition-transform ${isGrowing ? 'scale-110' : 'scale-100'}`}>
          🌱
        </div>
      </div>

      {/* Contador de Semillas Acumuladas */}
      {!hasAutoHarvest && accumulatedSeeds > 0 && (
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-green-300">
            <span className="text-sm font-bold text-green-700">
              {formatNumber(accumulatedSeeds)} 🌾
            </span>
          </div>
        </div>
      )}

      {/* Producción por segundo */}
      <div className="absolute top-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="inline-block bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-white">
            {productionRate.toFixed(1)}/s
          </span>
        </div>
      </div>

      {/* Efecto de Recolección */}
      {showHarvestEffect && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-ping absolute inset-0 rounded-2xl bg-green-400 opacity-75"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-bounce">✨</span>
          </div>
        </div>
      )}

      {/* Pulso sutil si hay semillas para recolectar */}
      {!hasAutoHarvest && accumulatedSeeds > 5 && (
        <div className="absolute inset-0 rounded-2xl border-4 border-green-400 animate-pulse opacity-50 pointer-events-none"></div>
      )}

      {/* Floating Numbers */}
      <FloatingNumbersRenderer />
    </div>
  );
}
