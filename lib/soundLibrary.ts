/**
 * Green Tycoon - Sound Library Configuration
 *
 * URLs de sonidos gratuitos de alta calidad de múltiples fuentes.
 * Todas las URLs son de dominio público o CC0 (sin atribución requerida).
 *
 * Fuentes:
 * - Mixkit.co (Royalty-free, no attribution required)
 * - Freesound.org (Creative Commons)
 * - OpenGameArt.org (Public Domain)
 * - ZapSplat (Free tier, attribution appreciated)
 */

export interface SoundAsset {
  url: string;
  backup?: string; // URL de respaldo si la principal falla
  volume?: number;
  playbackRate?: number;
  description: string;
  license: string;
}

/**
 * Librería completa de sonidos del juego
 */
export const SOUND_LIBRARY: Record<string, SoundAsset> = {
  // ==================== SONIDOS DE UI ====================

  click: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    backup: 'https://freesound.org/data/previews/442/442945_566647-lq.mp3',
    volume: 0.3,
    playbackRate: 1.2,
    description: 'Click suave de UI',
    license: 'Mixkit - Free for commercial use',
  },

  clickAlt: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    volume: 0.25,
    description: 'Click alternativo más suave',
    license: 'Mixkit',
  },

  // ==================== MONEDAS Y RECURSOS ====================

  coin: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3',
    backup: 'https://freesound.org/data/previews/536/536690_566647-lq.mp3',
    volume: 0.4,
    playbackRate: 1.0,
    description: 'Sonido de moneda individual',
    license: 'Mixkit',
  },

  coinBurst: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1998/1998-preview.mp3',
    volume: 0.45,
    description: 'Ráfaga de monedas (para grandes ganancias)',
    license: 'Mixkit',
  },

  coinsMultiple: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    volume: 0.5,
    description: 'Múltiples monedas cayendo',
    license: 'Mixkit',
  },

  // ==================== RECOLECCIÓN ====================

  harvest: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    backup: 'https://assets.mixkit.co/active_storage/sfx/1989/1989-preview.mp3',
    volume: 0.35,
    playbackRate: 1.1,
    description: 'Recolectar semillas/recursos',
    license: 'Mixkit',
  },

  collect: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
    volume: 0.4,
    description: 'Recolectar item',
    license: 'Mixkit',
  },

  // ==================== COMPRAS Y UPGRADES ====================

  purchase: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    backup: 'https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3',
    volume: 0.5,
    playbackRate: 1.0,
    description: 'Comprar upgrade o item',
    license: 'Mixkit',
  },

  cashRegister: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',
    volume: 0.45,
    description: 'Caja registradora (compra grande)',
    license: 'Mixkit',
  },

  // ==================== ÉXITO Y CELEBRACIÓN ====================

  success: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
    backup: 'https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3',
    volume: 0.6,
    playbackRate: 1.0,
    description: 'Acción exitosa',
    license: 'Mixkit',
  },

  achievement: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    volume: 0.65,
    description: 'Logro desbloqueado',
    license: 'Mixkit',
  },

  fanfare: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3',
    volume: 0.7,
    description: 'Fanfarria de victoria',
    license: 'Mixkit',
  },

  // ==================== LEVEL UP Y PROGRESO ====================

  levelUp: {
    url: 'https://assets.mixkit.co/active_storage/sfx/1995/1995-preview.mp3',
    backup: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    volume: 0.7,
    playbackRate: 1.0,
    description: 'Subir de nivel / Nueva maceta',
    license: 'Mixkit',
  },

  powerUp: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
    volume: 0.6,
    description: 'Power up / Boost',
    license: 'Mixkit',
  },

  // ==================== ERRORES Y NEGATIVOS ====================

  error: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
    backup: 'https://freesound.org/data/previews/415/415762_566647-lq.mp3',
    volume: 0.4,
    playbackRate: 1.0,
    description: 'Error / No puedes hacer eso',
    license: 'Mixkit',
  },

  denied: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    volume: 0.35,
    playbackRate: 0.8,
    description: 'Acción denegada',
    license: 'Mixkit',
  },

  // ==================== NOTIFICACIONES ====================

  notification: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    volume: 0.4,
    description: 'Notificación suave',
    license: 'Mixkit',
  },

  alert: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3',
    volume: 0.5,
    description: 'Alerta importante',
    license: 'Mixkit',
  },

  // ==================== AMBIENTE Y NATURAL ====================

  plantGrow: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2469/2469-preview.mp3',
    volume: 0.3,
    description: 'Planta creciendo (whoosh suave)',
    license: 'Mixkit',
  },

  magic: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    volume: 0.45,
    description: 'Efecto mágico / Transformación',
    license: 'Mixkit',
  },

  swoosh: {
    url: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3',
    volume: 0.35,
    description: 'Swoosh para transiciones',
    license: 'Mixkit',
  },

  // ==================== MÚSICA DE FONDO (OPCIONAL) ====================

  backgroundMusic: {
    url: 'https://assets.mixkit.co/active_storage/music/5277/5277-preview.mp3',
    volume: 0.15,
    playbackRate: 1.0,
    description: 'Música de fondo tranquila (loop)',
    license: 'Mixkit - Free Music',
  },

  menuMusic: {
    url: 'https://assets.mixkit.co/active_storage/music/5274/5274-preview.mp3',
    volume: 0.2,
    description: 'Música para menús',
    license: 'Mixkit - Free Music',
  },
};

/**
 * Mapeo de tipos de sonido del juego a assets de la librería
 */
export const SOUND_TYPE_MAP = {
  click: 'click',
  coin: 'coin',
  harvest: 'harvest',
  purchase: 'purchase',
  success: 'success',
  error: 'error',
  levelUp: 'levelUp',
  notification: 'notification',
  achievement: 'achievement',
  plantGrow: 'plantGrow',
} as const;

/**
 * Sonidos que deben precargarse al inicio
 */
export const PRELOAD_SOUNDS = [
  'click',
  'coin',
  'harvest',
  'purchase',
  'success',
  'error',
  'levelUp',
] as const;

/**
 * Configuración de volúmenes por categoría
 */
export const VOLUME_CATEGORIES = {
  ui: 0.3, // Clicks, navegación
  feedback: 0.5, // Monedas, recolección
  celebration: 0.7, // Éxitos, level ups
  ambient: 0.15, // Música de fondo
  error: 0.4, // Errores
} as const;

/**
 * Obtiene la configuración de un sonido
 */
export function getSoundAsset(soundKey: string): SoundAsset | undefined {
  return SOUND_LIBRARY[soundKey];
}

/**
 * Obtiene todas las URLs de sonidos para precarga
 */
export function getPreloadUrls(): string[] {
  return PRELOAD_SOUNDS.map((key) => SOUND_LIBRARY[key]?.url).filter(
    (url): url is string => !!url
  );
}

/**
 * Valida que una URL de sonido sea accesible
 */
export async function validateSoundUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
