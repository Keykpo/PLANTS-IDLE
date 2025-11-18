/**
 * Green Tycoon - Game State Management
 *
 * Store global usando Zustand para manejar todo el estado del juego.
 * Este store es el "single source of truth" para el frontend.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  calculatePlantProduction,
  calculateSeedValue,
  calculatePotCost,
  calculateUpgradeCost,
  calculateTotalProduction,
  GAME_CONSTANTS,
} from '@/lib/gameBalance';

// ============================================
// TIPOS
// ============================================

export interface Plant {
  id: string;
  tier: 'NORMAL' | 'PREMIUM';
  position: number;
  isActive: boolean;
  accumulatedSeeds: number;
  lastUpdate: number;
}

export interface Upgrade {
  type: string;
  level: number;
}

export interface GameStats {
  totalSeedsCollected: number;
  totalCoinsEarned: number;
  totalMoneySpent: number;
  sessionStartTime: number;
  lastSaveTime: number;
}

// ============================================
// INTERFACE DEL STORE
// ============================================

interface GameState {
  // Recursos
  coins: number;
  seeds: number;

  // Plantas
  plants: Plant[];
  nextPlantId: number;

  // Upgrades
  upgrades: Record<string, number>;

  // Usuario
  isPremium: boolean;
  prestigeLevel: number;
  userId: string | null;

  // UI State
  isGameLoopActive: boolean;
  showShop: boolean;
  notificationQueue: string[];

  // Stats
  stats: GameStats;

  // ========== ACCIONES ==========

  // Recursos
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addSeeds: (amount: number) => void;
  spendSeeds: (amount: number) => boolean;

  // Plantas
  addPlant: (tier: 'NORMAL' | 'PREMIUM') => void;
  updatePlantSeeds: (plantId: string, amount: number) => void;
  harvestPlant: (plantId: string) => void;
  harvestAllPlants: () => void;

  // Ventas
  sellSeeds: (amount: number) => void;
  sellAllSeeds: () => void;

  // Upgrades
  buyUpgrade: (upgradeType: string) => boolean;
  getUpgradeLevel: (upgradeType: string) => number;

  // Compra de macetas
  buyPot: (tier: 'NORMAL' | 'PREMIUM') => boolean;

  // Game Loop
  tick: () => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;

  // Persistencia
  syncWithServer: () => Promise<void>;
  loadFromServer: (data: any) => void;

  // Utilidades
  addNotification: (message: string) => void;
  clearNotification: () => void;
  toggleShop: () => void;
  reset: () => void;
}

// ============================================
// ESTADO INICIAL
// ============================================

const initialState = {
  coins: GAME_CONSTANTS.INITIAL_COINS,
  seeds: GAME_CONSTANTS.INITIAL_SEEDS,
  plants: [
    {
      id: 'plant-0',
      tier: 'NORMAL' as const,
      position: 0,
      isActive: true,
      accumulatedSeeds: 0,
      lastUpdate: Date.now(),
    },
  ],
  nextPlantId: 1,
  upgrades: {
    GROWTH_SPEED: 0,
    SEED_VALUE: 0,
    AUTO_HARVEST: 0,
    OFFLINE_EARNINGS: 0,
    BULK_SELL: 0,
  },
  isPremium: false,
  prestigeLevel: 0,
  userId: null,
  isGameLoopActive: false,
  showShop: false,
  notificationQueue: [],
  stats: {
    totalSeedsCollected: 0,
    totalCoinsEarned: 0,
    totalMoneySpent: 0,
    sessionStartTime: Date.now(),
    lastSaveTime: Date.now(),
  },
};

// ============================================
// STORE
// ============================================

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== GESTIÓN DE RECURSOS ==========

      addCoins: (amount: number) =>
        set((state) => ({
          coins: state.coins + amount,
          stats: {
            ...state.stats,
            totalCoinsEarned: state.stats.totalCoinsEarned + amount,
          },
        })),

      spendCoins: (amount: number) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        get().addNotification('No tienes suficientes monedas');
        return false;
      },

      addSeeds: (amount: number) =>
        set((state) => ({
          seeds: state.seeds + amount,
          stats: {
            ...state.stats,
            totalSeedsCollected: state.stats.totalSeedsCollected + amount,
          },
        })),

      spendSeeds: (amount: number) => {
        const state = get();
        if (state.seeds >= amount) {
          set({ seeds: state.seeds - amount });
          return true;
        }
        get().addNotification('No tienes suficientes semillas');
        return false;
      },

      // ========== GESTIÓN DE PLANTAS ==========

      addPlant: (tier: 'NORMAL' | 'PREMIUM') =>
        set((state) => {
          const newPlant: Plant = {
            id: `plant-${state.nextPlantId}`,
            tier,
            position: state.plants.length,
            isActive: true,
            accumulatedSeeds: 0,
            lastUpdate: Date.now(),
          };

          return {
            plants: [...state.plants, newPlant],
            nextPlantId: state.nextPlantId + 1,
          };
        }),

      updatePlantSeeds: (plantId: string, amount: number) =>
        set((state) => ({
          plants: state.plants.map((plant) =>
            plant.id === plantId
              ? {
                  ...plant,
                  accumulatedSeeds: plant.accumulatedSeeds + amount,
                  lastUpdate: Date.now(),
                }
              : plant
          ),
        })),

      harvestPlant: (plantId: string) => {
        const state = get();
        const plant = state.plants.find((p) => p.id === plantId);

        if (plant && plant.accumulatedSeeds > 0) {
          get().addSeeds(plant.accumulatedSeeds);
          set((state) => ({
            plants: state.plants.map((p) =>
              p.id === plantId
                ? { ...p, accumulatedSeeds: 0, lastUpdate: Date.now() }
                : p
            ),
          }));
        }
      },

      harvestAllPlants: () => {
        const state = get();
        let totalSeeds = 0;

        state.plants.forEach((plant) => {
          totalSeeds += plant.accumulatedSeeds;
        });

        if (totalSeeds > 0) {
          get().addSeeds(totalSeeds);
          set((state) => ({
            plants: state.plants.map((plant) => ({
              ...plant,
              accumulatedSeeds: 0,
              lastUpdate: Date.now(),
            })),
          }));
          get().addNotification(`¡Recolectaste ${Math.floor(totalSeeds)} semillas!`);
        }
      },

      // ========== VENTAS ==========

      sellSeeds: (amount: number) => {
        const state = get();
        if (state.seeds >= amount) {
          const seedValue = calculateSeedValue(state.upgrades.SEED_VALUE);
          const coinsEarned = amount * seedValue;

          get().spendSeeds(amount);
          get().addCoins(coinsEarned);
          get().addNotification(`Vendiste ${amount} semillas por ${Math.floor(coinsEarned)} monedas`);
        }
      },

      sellAllSeeds: () => {
        const state = get();
        const hasUnlock = state.upgrades.BULK_SELL >= 1;

        if (!hasUnlock) {
          get().addNotification('Necesitas desbloquear "Venta Masiva"');
          return;
        }

        if (state.seeds > 0) {
          get().sellSeeds(state.seeds);
        }
      },

      // ========== UPGRADES ==========

      buyUpgrade: (upgradeType: string) => {
        const state = get();
        const currentLevel = state.upgrades[upgradeType] || 0;
        const cost = calculateUpgradeCost(upgradeType as any, currentLevel);

        if (cost === Infinity) {
          get().addNotification('Mejora al máximo nivel');
          return false;
        }

        if (get().spendCoins(cost)) {
          set((state) => ({
            upgrades: {
              ...state.upgrades,
              [upgradeType]: currentLevel + 1,
            },
          }));
          get().addNotification(`¡Mejora comprada!`);
          return true;
        }

        return false;
      },

      getUpgradeLevel: (upgradeType: string) => {
        return get().upgrades[upgradeType] || 0;
      },

      // ========== COMPRA DE MACETAS ==========

      buyPot: (tier: 'NORMAL' | 'PREMIUM') => {
        const state = get();

        // Las macetas premium solo se pueden comprar con dinero real
        if (tier === 'PREMIUM') {
          get().addNotification('Las granjas premium se compran con dinero real en la tienda');
          return false;
        }

        const cost = calculatePotCost(state.plants.length);

        if (get().spendSeeds(cost)) {
          get().addPlant(tier);
          get().addNotification(`¡Nueva maceta comprada!`);
          return true;
        }

        return false;
      },

      // ========== GAME LOOP ==========

      tick: () => {
        const state = get();
        const now = Date.now();
        const hasAutoHarvest = state.upgrades.AUTO_HARVEST >= 1;

        // Actualiza cada planta
        state.plants.forEach((plant) => {
          if (!plant.isActive) return;

          const deltaTime = (now - plant.lastUpdate) / 1000; // Segundos
          const production = calculatePlantProduction(
            plant.tier,
            state.upgrades.GROWTH_SPEED,
            state.prestigeLevel
          );

          const seedsGenerated = production * deltaTime;

          // Si tiene auto-harvest, añade directamente al inventario
          if (hasAutoHarvest) {
            get().addSeeds(seedsGenerated);
          } else {
            // Si no, acumula en la planta
            get().updatePlantSeeds(plant.id, seedsGenerated);
          }
        });

        // Auto-save cada 30 segundos
        if (now - state.stats.lastSaveTime > 30000) {
          set((state) => ({
            stats: {
              ...state.stats,
              lastSaveTime: now,
            },
          }));
          // Aquí podríamos hacer un save al servidor
          // get().syncWithServer();
        }
      },

      startGameLoop: () => {
        set({ isGameLoopActive: true });
      },

      stopGameLoop: () => {
        set({ isGameLoopActive: false });
      },

      // ========== PERSISTENCIA ==========

      syncWithServer: async () => {
        // TODO: Implementar sincronización con el backend
        const state = get();
        console.log('Syncing with server...', {
          coins: state.coins,
          seeds: state.seeds,
          plants: state.plants.length,
        });
      },

      loadFromServer: (data: any) => {
        set({
          coins: data.coins || initialState.coins,
          seeds: data.seeds || initialState.seeds,
          plants: data.plants || initialState.plants,
          upgrades: data.upgrades || initialState.upgrades,
          isPremium: data.isPremium || false,
          prestigeLevel: data.prestigeLevel || 0,
          userId: data.userId || null,
        });
      },

      // ========== UTILIDADES ==========

      addNotification: (message: string) =>
        set((state) => ({
          notificationQueue: [...state.notificationQueue, message],
        })),

      clearNotification: () =>
        set((state) => ({
          notificationQueue: state.notificationQueue.slice(1),
        })),

      toggleShop: () =>
        set((state) => ({
          showShop: !state.showShop,
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'green-tycoon-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        coins: state.coins,
        seeds: state.seeds,
        plants: state.plants,
        nextPlantId: state.nextPlantId,
        upgrades: state.upgrades,
        prestigeLevel: state.prestigeLevel,
        stats: state.stats,
      }),
    }
  )
);
