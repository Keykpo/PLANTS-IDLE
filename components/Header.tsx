/**
 * Green Tycoon - Header Component
 *
 * Barra superior con:
 * - Recursos del jugador (Monedas y Semillas)
 * - Botones de acción (Vender, Tienda, etc.)
 */

'use client';

import { useGameStore } from '@/store/gameStore';
import { formatNumber, calculateSeedValue } from '@/lib/gameBalance';
import { useFloatingNumbers } from '@/components/FloatingNumber';
import { useSoundManager } from '@/lib/soundManager';
import SoundToggle from '@/components/SoundToggle';

export default function Header() {
  const coins = useGameStore((state) => state.coins);
  const seeds = useGameStore((state) => state.seeds);
  const upgrades = useGameStore((state) => state.upgrades);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const sellSeeds = useGameStore((state) => state.sellSeeds);
  const sellAllSeeds = useGameStore((state) => state.sellAllSeeds);
  const harvestAllPlants = useGameStore((state) => state.harvestAllPlants);

  const seedValue = calculateSeedValue(upgrades.SEED_VALUE);
  const hasBulkSell = upgrades.BULK_SELL >= 1;
  const hasAutoHarvest = upgrades.AUTO_HARVEST >= 1;

  // Hook para números flotantes
  const { addFloatingNumber, FloatingNumbersRenderer } = useFloatingNumbers();

  // Hook para sonidos
  const { play: playSound } = useSoundManager();

  // Handler personalizado para vender con floating numbers
  const handleSell = (amount: number) => {
    if (seeds >= amount) {
      const coinsEarned = Math.floor(amount * seedValue);
      sellSeeds(amount);

      // Reproducir sonido de monedas
      playSound('coin');

      // Mostrar floating number de monedas ganadas
      addFloatingNumber(coinsEarned, 'coins');
    }
  };

  const handleSellAll = () => {
    if (seeds > 0) {
      const coinsEarned = Math.floor(seeds * seedValue);
      sellAllSeeds();

      // Reproducir sonido de monedas
      playSound('coin');

      // Mostrar floating number de monedas ganadas
      addFloatingNumber(coinsEarned, 'coins');
    }
  };

  const handleHarvestAll = () => {
    harvestAllPlants();

    // Reproducir sonido de éxito
    playSound('success');

    // Mostrar efecto de éxito
    addFloatingNumber(1, 'success');
  };

  return (
    <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        {/* Título */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🌿 Green Tycoon
          </h1>

          <div className="flex gap-2">
            <SoundToggle />
            <button
              onClick={toggleShop}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105"
            >
              🏪 Tienda
            </button>
          </div>
        </div>

        {/* Recursos y Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monedas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-wide">Monedas</p>
                <p className="text-2xl font-bold">{formatNumber(coins)} 💰</p>
              </div>
            </div>
          </div>

          {/* Semillas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-white/70 uppercase tracking-wide">Semillas</p>
                <p className="text-2xl font-bold">{formatNumber(seeds)} 🌾</p>
                <p className="text-xs text-white/60 mt-1">Valor: {seedValue.toFixed(1)} 💰 c/u</p>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleSell(10)}
                  disabled={seeds < 10}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-sm font-semibold transition-all"
                >
                  Vender 10
                </button>
                {hasBulkSell && (
                  <button
                    onClick={handleSellAll}
                    disabled={seeds === 0}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-sm font-semibold transition-all"
                  >
                    Vender Todo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-white/70 uppercase tracking-wide mb-2">Acciones</p>
            <div className="space-y-2">
              {!hasAutoHarvest && (
                <button
                  onClick={handleHarvestAll}
                  className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  🌾 Recolectar Todo
                </button>
              )}
              {hasAutoHarvest && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-blue-300">✓ Auto-Recolección Activa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/60">
          <span>💾 Auto-guardado activo</span>
          <span>•</span>
          <span>⚡ Versión 1.0.0</span>
        </div>

        {/* Floating Numbers */}
        <div className="relative">
          <FloatingNumbersRenderer />
        </div>
      </div>
    </header>
  );
}
