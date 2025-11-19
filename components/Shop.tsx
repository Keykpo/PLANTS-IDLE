/**
 * Green Tycoon - Shop Component
 *
 * Tienda donde el jugador puede:
 * - Comprar upgrades (mejoras)
 * - Comprar nuevas macetas
 * - Acceder a compras premium
 */

'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  UPGRADES,
  calculateUpgradeCost,
  calculatePotCost,
  formatNumber,
  GAME_CONSTANTS,
} from '@/lib/gameBalance';
import { ShopFloatingNumbersProvider } from '@/components/ShopFloatingNumbers';
import { useSoundManager } from '@/lib/soundManager';

export default function Shop() {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'expansion' | 'premium'>('upgrades');

  const showShop = useGameStore((state) => state.showShop);
  const toggleShop = useGameStore((state) => state.toggleShop);
  const coins = useGameStore((state) => state.coins);
  const seeds = useGameStore((state) => state.seeds);
  const plants = useGameStore((state) => state.plants);
  const upgrades = useGameStore((state) => state.upgrades);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const buyPot = useGameStore((state) => state.buyPot);

  if (!showShop) return null;

  return (
    <ShopFloatingNumbersProvider>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">🏪 Tienda</h2>
            <button
              onClick={toggleShop}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Recursos del jugador */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-bold">{formatNumber(coins)}</span> 💰
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-bold">{formatNumber(seeds)}</span> 🌾
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === 'upgrades'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚡ Mejoras
          </button>
          <button
            onClick={() => setActiveTab('expansion')}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === 'expansion'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🌱 Expansión
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-3 font-semibold transition-colors ${
              activeTab === 'premium'
                ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⭐ Premium
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upgrades' && <UpgradesTab />}
          {activeTab === 'expansion' && <ExpansionTab />}
          {activeTab === 'premium' && <PremiumTab />}
        </div>
        </div>
      </div>
    </ShopFloatingNumbersProvider>
  );
}

// ========== TAB: MEJORAS ==========

function UpgradesTab() {
  const coins = useGameStore((state) => state.coins);
  const upgrades = useGameStore((state) => state.upgrades);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const { play: playSound } = useSoundManager();

  const handleBuyUpgrade = (upgradeId: string) => {
    const success = buyUpgrade(upgradeId);
    if (success) {
      playSound('purchase');
    } else {
      playSound('error');
    }
  };

  return (
    <div className="space-y-4">
      {Object.values(UPGRADES).map((upgrade) => {
        const currentLevel = upgrades[upgrade.id] || 0;
        const cost = calculateUpgradeCost(upgrade.id, currentLevel);
        const canAfford = coins >= cost;
        const isMaxed = cost === Infinity;

        return (
          <div
            key={upgrade.id}
            className={`border-2 rounded-xl p-4 transition-all ${
              canAfford && !isMaxed
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{upgrade.name}</h3>
                <p className="text-sm text-gray-600">{upgrade.description}</p>
              </div>
              <div className="text-right ml-4">
                {isMaxed ? (
                  <span className="text-green-600 font-bold">MAX</span>
                ) : (
                  <>
                    <div className="text-xl font-bold text-gray-800">
                      {formatNumber(cost)} 💰
                    </div>
                    <div className="text-xs text-gray-500">Nivel {currentLevel}</div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => handleBuyUpgrade(upgrade.id)}
              disabled={!canAfford || isMaxed}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                canAfford && !isMaxed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isMaxed ? 'Nivel Máximo' : canAfford ? 'Comprar' : 'No puedes costear'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ========== TAB: EXPANSIÓN ==========

function ExpansionTab() {
  const seeds = useGameStore((state) => state.seeds);
  const plants = useGameStore((state) => state.plants);
  const buyPot = useGameStore((state) => state.buyPot);
  const { play: playSound } = useSoundManager();

  const nextPotCost = calculatePotCost(plants.length);
  const canAfford = seeds >= nextPotCost;
  const isAtMax = plants.length >= GAME_CONSTANTS.MAX_POTS_WITHOUT_PRESTIGE;

  const handleBuyPot = () => {
    const success = buyPot('NORMAL');
    if (success) {
      playSound('levelUp'); // Sonido especial para nueva maceta
    } else {
      playSound('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800">
          <strong>Macetas actuales:</strong> {plants.length} / {GAME_CONSTANTS.MAX_POTS_WITHOUT_PRESTIGE}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cada maceta aumenta tu producción de semillas.
        </p>
      </div>

      {/* Compra de Maceta Normal */}
      <div className="border-2 border-green-500 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🪴</div>
          <h3 className="text-2xl font-bold text-gray-800">Nueva Maceta</h3>
          <p className="text-gray-600">Añade una planta más a tu jardín</p>
        </div>

        {isAtMax ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold">
              ¡Has alcanzado el límite! Necesitas prestigiar para continuar.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-800">
                {formatNumber(nextPotCost)} 🌾
              </div>
              <p className="text-sm text-gray-500">Costo en semillas</p>
            </div>

            <button
              onClick={handleBuyPot}
              disabled={!canAfford}
              className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAfford ? 'Comprar Maceta' : 'No tienes suficientes semillas'}
            </button>
          </>
        )}
      </div>

      {/* Proyección de producción */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Cuantas más macetas tengas, más rápido generarás semillas pasivamente.
        </p>
      </div>
    </div>
  );
}

// ========== TAB: PREMIUM ==========

function PremiumTab() {
  const isPremium = useGameStore((state) => state.isPremium);

  const handlePurchasePremium = () => {
    // Aquí se conectaría con la API de pagos
    alert('Esta funcionalidad se conectaría con Stripe/PayPal en producción.');
  };

  return (
    <div className="space-y-6">
      {/* Hero de Premium */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-10">⭐</div>

        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-2">Granja Premium</h3>
          <p className="text-yellow-100 mb-4">Desbloquea el máximo potencial</p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Velocidad 2.5x más rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>Auto-recolección incluida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>Skin visual dorado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♾️</span>
              <span>Beneficios permanentes</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div>
              <p className="text-sm opacity-80">Precio único</p>
              <p className="text-3xl font-bold">${GAME_CONSTANTS.PREMIUM_FARM_PRICE}</p>
            </div>

            <button
              onClick={handlePurchasePremium}
              disabled={isPremium}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                isPremium
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-orange-600 hover:bg-yellow-50 shadow-lg hover:shadow-xl'
              }`}
            >
              {isPremium ? '✓ Ya Adquirido' : '🛒 Comprar Ahora'}
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>🔒 Seguro y Confiable:</strong> Todas las transacciones son procesadas de forma segura
          a través de Stripe. Tus beneficios premium se activan instantáneamente.
        </p>
      </div>

      {/* Comparación */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
          <h4 className="font-bold text-gray-800 mb-2">🌱 Gratis</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Velocidad 1.0x</li>
            <li>• Click manual</li>
            <li>• Sin límites</li>
          </ul>
        </div>

        <div className="border-2 border-yellow-500 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
          <h4 className="font-bold text-yellow-700 mb-2">⭐ Premium</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Velocidad 2.5x</li>
            <li>• Auto-recolección</li>
            <li>• Beneficios forever</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
