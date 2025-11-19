/**
 * Green Tycoon - Audio Preloader
 *
 * Componente que precarga los sonidos esenciales del juego
 * para evitar delays en la primera reproducción.
 */

'use client';

import { useEffect, useState } from 'react';
import { getSoundManager } from '@/lib/soundManager';
import { PRELOAD_SOUNDS, getSoundAsset } from '@/lib/soundLibrary';

export default function AudioPreloader() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadSounds = async () => {
      const manager = getSoundManager();
      const total = PRELOAD_SOUNDS.length;
      let loadedCount = 0;

      console.log(`[AudioPreloader] Starting preload of ${total} sounds...`);

      // Precargar cada sonido
      for (const soundKey of PRELOAD_SOUNDS) {
        const asset = getSoundAsset(soundKey);
        if (asset?.url) {
          try {
            const success = await manager.preload(asset.url);
            if (success) {
              console.log(`[AudioPreloader] ✓ Loaded: ${soundKey}`);
            } else {
              console.warn(`[AudioPreloader] ✗ Failed: ${soundKey}`);
            }
          } catch (error) {
            console.warn(`[AudioPreloader] Error loading ${soundKey}:`, error);
          }
        }

        loadedCount++;
        setProgress((loadedCount / total) * 100);
      }

      setLoaded(true);
      console.log('[AudioPreloader] Preload complete!');
    };

    // Iniciar precarga después de un pequeño delay
    // para no interferir con la carga inicial de la página
    const timer = setTimeout(() => {
      preloadSounds();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Este componente no renderiza nada visible
  // Solo ejecuta la lógica de precarga
  return null;
}

/**
 * Versión con indicador visual (opcional)
 * Útil para debugging o mostrar progreso de carga
 */
export function AudioPreloaderWithProgress() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSound, setCurrentSound] = useState('');

  useEffect(() => {
    const preloadSounds = async () => {
      const manager = getSoundManager();
      const total = PRELOAD_SOUNDS.length;
      let loadedCount = 0;

      for (const soundKey of PRELOAD_SOUNDS) {
        setCurrentSound(soundKey);
        const asset = getSoundAsset(soundKey);

        if (asset?.url) {
          await manager.preload(asset.url);
        }

        loadedCount++;
        setProgress((loadedCount / total) * 100);
      }

      setLoaded(true);
    };

    const timer = setTimeout(preloadSounds, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mostrar indicador mientras carga
  if (!loaded) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="text-sm font-medium">Loading sounds...</p>
            <p className="text-xs text-gray-300">{Math.round(progress)}% - {currentSound}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
