/**
 * Green Tycoon - Sound System
 *
 * Sistema de audio para el juego usando Web Audio API.
 * Utiliza sonidos profesionales de Mixkit.co (royalty-free).
 *
 * Sonidos disponibles:
 * - click: Click suave en botones/plantas
 * - coin: Ganar monedas
 * - harvest: Recolectar semillas
 * - purchase: Comprar upgrade/maceta
 * - success: Acción exitosa
 * - error: Error/no puedes hacer eso
 * - levelUp: Subir de nivel/nueva maceta
 * - y más...
 */

'use client';

import { SOUND_LIBRARY, SOUND_TYPE_MAP, getSoundAsset, type SoundAsset } from './soundLibrary';

// ============================================
// TIPOS
// ============================================

export type SoundType = keyof typeof SOUND_TYPE_MAP;

interface SoundConfig {
  url?: string; // URL opcional de audio externo
  backup?: string; // URL de respaldo
  volume?: number; // 0-1
  playbackRate?: number; // Velocidad de reproducción
}

// ============================================
// CLASE DE SONIDO
// ============================================

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.7;
  private audioCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy initialization
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume context on user interaction (required by browsers)
      const resumeContext = () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
        document.removeEventListener('click', resumeContext);
        document.removeEventListener('keydown', resumeContext);
      };

      document.addEventListener('click', resumeContext);
      document.addEventListener('keydown', resumeContext);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Genera sonido sintético usando osciladores
   */
  private async playSynthSound(type: SoundType, config: SoundConfig) {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configurar según tipo
    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        break;

      case 'coin':
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.setValueAtTime(1000, now + 0.05);
        oscillator.frequency.setValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        break;

      case 'harvest':
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        break;

      case 'purchase':
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.setValueAtTime(800, now + 0.1);
        oscillator.frequency.setValueAtTime(1000, now + 0.2);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        break;

      case 'success':
        oscillator.frequency.setValueAtTime(523, now);
        oscillator.frequency.setValueAtTime(659, now + 0.1);
        oscillator.frequency.setValueAtTime(784, now + 0.2);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        break;

      case 'error':
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        break;

      case 'levelUp':
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.setValueAtTime(500, now + 0.1);
        oscillator.frequency.setValueAtTime(600, now + 0.2);
        oscillator.frequency.setValueAtTime(800, now + 0.3);
        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        break;
    }

    // Aplicar volumen maestro
    const finalVolume = (config.volume || 1) * this.masterVolume;
    gainNode.gain.value *= finalVolume;

    // Conectar nodos
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Reproducir
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  /**
   * Reproduce audio desde URL
   */
  private async playAudioUrl(url: string, config: SoundConfig, fallbackUrl?: string) {
    if (!this.audioContext) return;

    try {
      // Buscar en caché
      let buffer = this.audioCache.get(url);

      if (!buffer) {
        // Cargar y decodificar
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioCache.set(url, buffer);
      }

      // Crear source
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.playbackRate.value = config.playbackRate || 1.0;

      const finalVolume = (config.volume || 1) * this.masterVolume;
      gainNode.gain.value = finalVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.warn(`Error playing audio from ${url}:`, error);

      // Intentar URL de respaldo
      if (fallbackUrl && fallbackUrl !== url) {
        console.log(`Trying backup URL: ${fallbackUrl}`);
        await this.playAudioUrl(fallbackUrl, config);
      } else {
        // Último fallback: sonido sintético
        console.log('Falling back to synthetic sound');
        await this.playSynthSound('click', config);
      }
    }
  }

  /**
   * Precarga un sonido en caché
   */
  public async preload(url: string): Promise<boolean> {
    if (!this.audioContext || this.audioCache.has(url)) return true;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioCache.set(url, buffer);
      return true;
    } catch (error) {
      console.warn(`Failed to preload ${url}:`, error);
      return false;
    }
  }

  /**
   * Reproduce un sonido
   */
  public async play(type: SoundType) {
    if (!this.enabled || !this.audioContext) return;

    // Obtener configuración de la librería
    const soundKey = SOUND_TYPE_MAP[type];
    const asset = getSoundAsset(soundKey);

    if (!asset) {
      console.warn(`Sound asset not found for type: ${type}`);
      return;
    }

    const config: SoundConfig = {
      url: asset.url,
      backup: asset.backup,
      volume: asset.volume,
      playbackRate: asset.playbackRate,
    };

    // Si hay URL, usar audio externo
    if (config.url) {
      await this.playAudioUrl(config.url, config, config.backup);
    } else {
      // Fallback a sonido sintético
      await this.playSynthSound(type, config);
    }
  }

  /**
   * Activa/desactiva sonidos
   */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', JSON.stringify(enabled));
    }
  }

  /**
   * Obtiene si los sonidos están activados
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Establece volumen maestro (0-1)
   */
  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('masterVolume', volume.toString());
    }
  }

  /**
   * Obtiene volumen maestro
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Carga configuración desde localStorage
   */
  public loadSettings() {
    if (typeof window === 'undefined') return;

    const savedEnabled = localStorage.getItem('soundEnabled');
    if (savedEnabled !== null) {
      this.enabled = JSON.parse(savedEnabled);
    }

    const savedVolume = localStorage.getItem('masterVolume');
    if (savedVolume !== null) {
      this.masterVolume = parseFloat(savedVolume);
    }
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
    soundManagerInstance.loadSettings();
  }
  return soundManagerInstance;
}

// ============================================
// HOOKS DE REACT
// ============================================

import { useEffect, useState } from 'react';

export function useSoundManager() {
  const [manager] = useState(() => getSoundManager());
  const [enabled, setEnabledState] = useState(manager.isEnabled());
  const [volume, setVolumeState] = useState(manager.getMasterVolume());

  const setEnabled = (value: boolean) => {
    manager.setEnabled(value);
    setEnabledState(value);
  };

  const setVolume = (value: number) => {
    manager.setMasterVolume(value);
    setVolumeState(value);
  };

  const play = (type: SoundType) => {
    manager.play(type);
  };

  return {
    play,
    enabled,
    setEnabled,
    volume,
    setVolume,
  };
}

