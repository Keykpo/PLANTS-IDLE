/**
 * Green Tycoon - Sistema de Balanceo Económico
 *
 * Este archivo contiene todas las fórmulas matemáticas y constantes
 * que definen la economía del juego.
 *
 * IMPORTANTE: Cualquier cambio aquí afecta directamente el balanceo.
 * Testear extensivamente antes de modificar en producción.
 */

// ============================================
// CONSTANTES GLOBALES
// ============================================

export const GAME_CONSTANTS = {
  // Producción base
  BASE_SEED_RATE: 1.0,              // Semillas/segundo por planta básica
  BASE_SEED_VALUE: 5,               // Monedas que vale 1 semilla

  // Multiplicadores de tier
  NORMAL_FARM_MULTIPLIER: 1.0,      // Free-to-play
  PREMIUM_FARM_MULTIPLIER: 2.5,     // Paid (+150%)

  // Progresión de costos
  UPGRADE_COST_MULTIPLIER: 1.15,    // 15% de incremento por nivel
  POT_COST_MULTIPLIER: 1.25,        // 25% de incremento por maceta

  // Valores iniciales
  INITIAL_POT_COST: 50,             // Costo en semillas de la primera maceta extra
  INITIAL_COINS: 0,
  INITIAL_SEEDS: 0,
  INITIAL_POTS: 1,

  // Limites
  MAX_OFFLINE_TIME: 24 * 60 * 60 * 1000,  // 24 horas en milisegundos
  MAX_POTS_WITHOUT_PRESTIGE: 50,

  // Prestigio
  PRESTIGE_REQUIREMENT: 100,        // Macetas necesarias para prestigio
  PRESTIGE_BONUS_PER_POINT: 0.05,   // 5% por punto

  // Precios premium (USD)
  PREMIUM_FARM_PRICE: 4.99,
  PRESTIGE_BOOST_PRICE: 9.99,
} as const;

// ============================================
// TIPOS DE UPGRADES Y SUS CONFIGURACIONES
// ============================================

export type UpgradeType =
  | 'GROWTH_SPEED'
  | 'SEED_VALUE'
  | 'AUTO_HARVEST'
  | 'OFFLINE_EARNINGS'
  | 'BULK_SELL';

export interface UpgradeConfig {
  id: UpgradeType;
  name: string;
  description: string;
  baseCost: number;              // Costo del primer nivel
  maxLevel: number;              // Nivel máximo (0 = infinito)
  effectPerLevel: number;        // Efecto de cada nivel
  costMultiplier: number;        // Multiplicador de costo
  isUnlock: boolean;             // Si es desbloqueo de una vez
}

export const UPGRADES: Record<UpgradeType, UpgradeConfig> = {
  GROWTH_SPEED: {
    id: 'GROWTH_SPEED',
    name: 'Velocidad de Crecimiento',
    description: 'Aumenta la velocidad de producción de semillas en 10% por nivel',
    baseCost: 10,
    maxLevel: 0,                 // Infinito
    effectPerLevel: 0.10,        // 10% por nivel
    costMultiplier: 1.15,
    isUnlock: false,
  },
  SEED_VALUE: {
    id: 'SEED_VALUE',
    name: 'Calidad de Semilla',
    description: 'Aumenta el valor de venta de las semillas en 15% por nivel',
    baseCost: 15,
    maxLevel: 0,                 // Infinito
    effectPerLevel: 0.15,        // 15% por nivel
    costMultiplier: 1.15,
    isUnlock: false,
  },
  AUTO_HARVEST: {
    id: 'AUTO_HARVEST',
    name: 'Auto-Recolección',
    description: 'Desbloquea recolección automática de semillas',
    baseCost: 500,
    maxLevel: 1,                 // Solo se compra una vez
    effectPerLevel: 1,
    costMultiplier: 1,
    isUnlock: true,
  },
  OFFLINE_EARNINGS: {
    id: 'OFFLINE_EARNINGS',
    name: 'Ganancias Offline',
    description: 'Aumenta el tiempo máximo de ganancias offline en 2 horas por nivel',
    baseCost: 100,
    maxLevel: 12,                // Máximo 24h extras (12 niveles × 2h)
    effectPerLevel: 2 * 60 * 60, // 2 horas en segundos
    costMultiplier: 1.20,
    isUnlock: false,
  },
  BULK_SELL: {
    id: 'BULK_SELL',
    name: 'Venta Masiva',
    description: 'Desbloquea la capacidad de vender todas las semillas de golpe',
    baseCost: 200,
    maxLevel: 1,
    effectPerLevel: 1,
    costMultiplier: 1,
    isUnlock: true,
  },
};

// ============================================
// FÓRMULAS DE CÁLCULO
// ============================================

/**
 * Calcula el costo de una mejora dado su nivel actual
 */
export function calculateUpgradeCost(
  upgradeType: UpgradeType,
  currentLevel: number
): number {
  const config = UPGRADES[upgradeType];

  // Si es un unlock y ya está al máximo, retorna infinito
  if (config.isUnlock && currentLevel >= config.maxLevel) {
    return Infinity;
  }

  // Si tiene maxLevel y ya llegó, retorna infinito
  if (config.maxLevel > 0 && currentLevel >= config.maxLevel) {
    return Infinity;
  }

  const cost = config.baseCost * Math.pow(config.costMultiplier, currentLevel);
  return Math.ceil(cost);
}

/**
 * Calcula el multiplicador total de un upgrade
 */
export function calculateUpgradeMultiplier(
  upgradeType: UpgradeType,
  level: number
): number {
  const config = UPGRADES[upgradeType];

  if (config.isUnlock) {
    return level >= 1 ? 1 : 0;  // 1 si está desbloqueado, 0 si no
  }

  return 1 + (level * config.effectPerLevel);
}

/**
 * Calcula la producción de semillas por segundo de una planta
 */
export function calculatePlantProduction(
  tier: 'NORMAL' | 'PREMIUM',
  speedUpgradeLevel: number,
  prestigeLevel: number = 0
): number {
  const baseRate = GAME_CONSTANTS.BASE_SEED_RATE;

  // Multiplicador de tier
  const tierMultiplier = tier === 'PREMIUM'
    ? GAME_CONSTANTS.PREMIUM_FARM_MULTIPLIER
    : GAME_CONSTANTS.NORMAL_FARM_MULTIPLIER;

  // Multiplicador de velocidad
  const speedMultiplier = calculateUpgradeMultiplier('GROWTH_SPEED', speedUpgradeLevel);

  // Bonus de prestigio
  const prestigeBonus = 1 + (prestigeLevel * GAME_CONSTANTS.PRESTIGE_BONUS_PER_POINT);

  return baseRate * tierMultiplier * speedMultiplier * prestigeBonus;
}

/**
 * Calcula el valor de venta de una semilla
 */
export function calculateSeedValue(
  qualityUpgradeLevel: number
): number {
  const baseValue = GAME_CONSTANTS.BASE_SEED_VALUE;
  const qualityMultiplier = calculateUpgradeMultiplier('SEED_VALUE', qualityUpgradeLevel);

  return baseValue * qualityMultiplier;
}

/**
 * Calcula el costo de la siguiente maceta
 */
export function calculatePotCost(currentPotCount: number): number {
  const cost = GAME_CONSTANTS.INITIAL_POT_COST *
    Math.pow(GAME_CONSTANTS.POT_COST_MULTIPLIER, currentPotCount - 1);

  return Math.ceil(cost);
}

/**
 * Calcula recursos generados durante tiempo offline
 */
export function calculateOfflineEarnings(
  totalProduction: number,        // Semillas/segundo totales
  lastLoginTimestamp: number,
  offlineUpgradeLevel: number
): {
  seedsGenerated: number;
  timeCalculated: number;         // En milisegundos
  wasCapped: boolean;
} {
  const now = Date.now();
  const timeOffline = now - lastLoginTimestamp;

  // Tiempo máximo de offline (base 24h + upgrades)
  const baseOfflineTime = GAME_CONSTANTS.MAX_OFFLINE_TIME;
  const bonusOfflineTime = offlineUpgradeLevel * UPGRADES.OFFLINE_EARNINGS.effectPerLevel * 1000;
  const maxOfflineTime = baseOfflineTime + bonusOfflineTime;

  // Calcula tiempo efectivo
  const effectiveTime = Math.min(timeOffline, maxOfflineTime);
  const wasCapped = timeOffline > maxOfflineTime;

  // Calcula semillas generadas
  const seedsGenerated = totalProduction * (effectiveTime / 1000);

  return {
    seedsGenerated: Math.floor(seedsGenerated),
    timeCalculated: effectiveTime,
    wasCapped,
  };
}

/**
 * Calcula la producción total de todas las plantas del usuario
 */
export function calculateTotalProduction(
  plants: Array<{
    tier: 'NORMAL' | 'PREMIUM';
    isActive: boolean;
  }>,
  speedUpgradeLevel: number,
  prestigeLevel: number = 0
): number {
  let totalProduction = 0;

  for (const plant of plants) {
    if (!plant.isActive) continue;

    const production = calculatePlantProduction(
      plant.tier,
      speedUpgradeLevel,
      prestigeLevel
    );

    totalProduction += production;
  }

  return totalProduction;
}

/**
 * Verifica si el jugador puede prestigiar
 */
export function canPrestige(totalPotsOwned: number): boolean {
  return totalPotsOwned >= GAME_CONSTANTS.PRESTIGE_REQUIREMENT;
}

/**
 * Calcula cuántos puntos de prestigio se ganarían
 */
export function calculatePrestigePoints(totalPotsOwned: number): number {
  if (!canPrestige(totalPotsOwned)) return 0;

  // 1 punto por cada 100 macetas
  return Math.floor(totalPotsOwned / GAME_CONSTANTS.PRESTIGE_REQUIREMENT);
}

// ============================================
// UTILIDADES DE FORMATEO
// ============================================

/**
 * Formatea números grandes de manera legible
 */
export function formatNumber(value: number): string {
  if (value < 1000) {
    return Math.floor(value).toString();
  }

  if (value < 1_000_000) {
    return (value / 1000).toFixed(1) + 'K';
  }

  if (value < 1_000_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }

  return (value / 1_000_000_000).toFixed(1) + 'B';
}

/**
 * Formatea tiempo en formato legible
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida que una compra es posible
 */
export function canAfford(currentCoins: number, cost: number): boolean {
  return currentCoins >= cost;
}

/**
 * Valida que hay suficientes semillas
 */
export function hasEnoughSeeds(currentSeeds: number, required: number): boolean {
  return currentSeeds >= required;
}
