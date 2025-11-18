/**
 * Green Tycoon - Security Utilities
 *
 * Funciones de validación y seguridad para prevenir cheating
 * y garantizar la integridad del juego.
 */

import crypto from 'crypto';

// ============================================
// VALIDACIÓN DE RECURSOS
// ============================================

/**
 * Valida que los recursos del usuario sean válidos
 */
export function validateResources(resources: {
  coins?: number;
  seeds?: number;
}): { isValid: boolean; error?: string } {
  // 1. No pueden ser negativos
  if (resources.coins !== undefined && resources.coins < 0) {
    return { isValid: false, error: 'Coins cannot be negative' };
  }

  if (resources.seeds !== undefined && resources.seeds < 0) {
    return { isValid: false, error: 'Seeds cannot be negative' };
  }

  // 2. No pueden ser infinity o NaN
  if (resources.coins !== undefined && !Number.isFinite(resources.coins)) {
    return { isValid: false, error: 'Invalid coins value' };
  }

  if (resources.seeds !== undefined && !Number.isFinite(resources.seeds)) {
    return { isValid: false, error: 'Invalid seeds value' };
  }

  // 3. Límite superior razonable (prevenir overflow)
  const MAX_RESOURCES = 1e15; // 1 cuatrillón

  if (resources.coins !== undefined && resources.coins > MAX_RESOURCES) {
    return { isValid: false, error: 'Coins exceed maximum allowed' };
  }

  if (resources.seeds !== undefined && resources.seeds > MAX_RESOURCES) {
    return { isValid: false, error: 'Seeds exceed maximum allowed' };
  }

  return { isValid: true };
}

// ============================================
// VALIDACIÓN DE TIMESTAMPS
// ============================================

/**
 * Valida que un timestamp sea razonable
 * Previene "time travel" donde el usuario modifica su reloj
 */
export function validateTimestamp(
  timestamp: number,
  toleranceMs: number = 5 * 60 * 1000 // 5 minutos
): { isValid: boolean; error?: string } {
  const now = Date.now();

  // No puede ser del futuro (con tolerancia)
  if (timestamp > now + toleranceMs) {
    return { isValid: false, error: 'Timestamp is in the future' };
  }

  // No puede ser muy antiguo (más de 7 días)
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  if (timestamp < now - maxAge) {
    return { isValid: false, error: 'Timestamp is too old' };
  }

  return { isValid: true };
}

// ============================================
// VALIDACIÓN DE PROGRESO
// ============================================

/**
 * Valida que el progreso del usuario sea físicamente posible
 * dado el tiempo transcurrido
 */
export function validateProgress(
  oldState: {
    seeds: number;
    lastUpdate: number;
  },
  newState: {
    seeds: number;
    currentTime: number;
  },
  maxProductionRate: number // Semillas/segundo máximas posibles
): { isValid: boolean; error?: string } {
  const timeDiff = (newState.currentTime - oldState.lastUpdate) / 1000; // Segundos

  // El tiempo debe ser positivo
  if (timeDiff < 0) {
    return { isValid: false, error: 'Invalid time progression' };
  }

  // Calcular máximo de semillas que se pudieron generar
  const maxPossibleSeeds = oldState.seeds + maxProductionRate * timeDiff;

  // Dar un margen de error del 10% por latencia
  const margin = maxPossibleSeeds * 0.1;

  if (newState.seeds > maxPossibleSeeds + margin) {
    return {
      isValid: false,
      error: `Impossible resource generation. Max: ${maxPossibleSeeds}, Got: ${newState.seeds}`,
    };
  }

  return { isValid: true };
}

// ============================================
// RATE LIMITING
// ============================================

// En producción, esto usaría Redis
// Por ahora, un Map simple en memoria (se pierde al reiniciar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Verifica si un usuario ha excedido el rate limit
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 100, // Máximo de requests
  windowMs: number = 60 * 1000 // Por minuto
): { isLimited: boolean; remainingRequests: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  // Si no existe o expiró, crear nuevo
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      isLimited: false,
      remainingRequests: maxRequests - 1,
    };
  }

  // Incrementar contador
  userLimit.count++;

  // Verificar si excedió el límite
  if (userLimit.count > maxRequests) {
    return {
      isLimited: true,
      remainingRequests: 0,
    };
  }

  return {
    isLimited: false,
    remainingRequests: maxRequests - userLimit.count,
  };
}

// ============================================
// HASH DE DATOS (Integridad)
// ============================================

/**
 * Genera un hash de los datos del usuario para verificar integridad
 * Útil para detectar si el localStorage fue modificado
 */
export function generateDataHash(data: any, secret: string): string {
  const jsonString = JSON.stringify(data);
  return crypto.createHmac('sha256', secret).update(jsonString).digest('hex');
}

/**
 * Verifica que el hash de los datos sea válido
 */
export function verifyDataHash(
  data: any,
  hash: string,
  secret: string
): boolean {
  const expectedHash = generateDataHash(data, secret);

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

// ============================================
// VALIDACIÓN DE COMPRAS PREMIUM
// ============================================

/**
 * Valida que una compra premium sea legítima
 * Solo debe ser llamada desde webhooks verificados
 */
export function validatePremiumPurchase(purchase: {
  userId: string;
  productId: string;
  priceUSD: number;
  transactionId: string;
}): { isValid: boolean; error?: string } {
  // 1. Usuario debe existir
  if (!purchase.userId || purchase.userId.length === 0) {
    return { isValid: false, error: 'Invalid user ID' };
  }

  // 2. Producto debe ser válido
  const validProducts = ['premium_farm', 'prestige_boost'];
  if (!validProducts.includes(purchase.productId)) {
    return { isValid: false, error: 'Invalid product ID' };
  }

  // 3. Precio debe ser positivo y razonable
  if (purchase.priceUSD <= 0 || purchase.priceUSD > 1000) {
    return { isValid: false, error: 'Invalid price' };
  }

  // 4. Transaction ID debe existir
  if (!purchase.transactionId || purchase.transactionId.length < 10) {
    return { isValid: false, error: 'Invalid transaction ID' };
  }

  return { isValid: true };
}

// ============================================
// SANITIZACIÓN DE ENTRADA
// ============================================

/**
 * Sanitiza entrada del usuario para prevenir inyecciones
 */
export function sanitizeString(input: string, maxLength: number = 200): string {
  // Remover caracteres peligrosos
  let sanitized = input
    .replace(/[<>]/g, '') // HTML tags
    .replace(/['"]/g, '') // Quotes
    .trim();

  // Limitar longitud
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de username
 */
export function isValidUsername(username: string): boolean {
  // 3-20 caracteres, solo alfanuméricos y guiones
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

// ============================================
// LOGGING DE SEGURIDAD
// ============================================

export interface SecurityEvent {
  type: 'warning' | 'violation' | 'info';
  userId: string;
  action: string;
  details: any;
  timestamp: number;
  ipAddress?: string;
}

/**
 * Registra eventos de seguridad
 * En producción, esto enviaría a un servicio de logging
 */
export function logSecurityEvent(event: SecurityEvent) {
  console.log('[SECURITY]', {
    type: event.type,
    userId: event.userId,
    action: event.action,
    timestamp: new Date(event.timestamp).toISOString(),
    details: event.details,
  });

  // En producción:
  // - Enviar a Sentry/DataDog
  // - Guardar en base de datos para análisis
  // - Alertar si hay patrones sospechosos
}

// ============================================
// PREVENCIÓN DE BOT
// ============================================

/**
 * Verifica patrones que sugieren comportamiento automatizado
 */
export function detectBotBehavior(actions: {
  clicksPerSecond: number;
  requestsPerMinute: number;
  perfectTimingActions: number; // Acciones con timing demasiado perfecto
}): { isBot: boolean; confidence: number } {
  let suspicionScore = 0;

  // 1. Clicks demasiado rápidos (humanos: 3-8 cps, bots: >15 cps)
  if (actions.clicksPerSecond > 15) {
    suspicionScore += 40;
  }

  // 2. Requests demasiado consistentes
  if (actions.requestsPerMinute > 200) {
    suspicionScore += 30;
  }

  // 3. Timing perfecto (bots no tienen variación)
  if (actions.perfectTimingActions > 10) {
    suspicionScore += 30;
  }

  return {
    isBot: suspicionScore >= 70,
    confidence: suspicionScore / 100,
  };
}
