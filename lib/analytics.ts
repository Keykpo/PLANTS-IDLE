/**
 * Green Tycoon - Analytics System
 *
 * Sistema de analíticas básico para trackear eventos del juego.
 * Almacena eventos en localStorage para análisis offline.
 */

'use client';

// ============================================
// TIPOS DE EVENTOS
// ============================================

export type AnalyticsEvent =
  | 'game_start'
  | 'first_purchase'
  | 'first_upgrade'
  | 'first_pot_bought'
  | 'first_harvest'
  | 'seeds_sold'
  | 'milestone_reached'
  | 'session_duration'
  | 'total_playtime'
  | 'achievement_unlocked';

interface EventData {
  event: AnalyticsEvent;
  timestamp: number;
  data?: Record<string, any>;
}

interface AnalyticsState {
  events: EventData[];
  sessionStart: number;
  totalSessions: number;
  milestones: Record<string, boolean>;
}

// ============================================
// CLASE DE ANALYTICS
// ============================================

class Analytics {
  private storageKey = 'green-tycoon-analytics';
  private state: AnalyticsState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AnalyticsState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load analytics state:', error);
    }

    return this.getDefaultState();
  }

  private getDefaultState(): AnalyticsState {
    return {
      events: [],
      sessionStart: Date.now(),
      totalSessions: 0,
      milestones: {},
    };
  }

  private saveState() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save analytics state:', error);
    }
  }

  /**
   * Trackea un evento
   */
  public track(event: AnalyticsEvent, data?: Record<string, any>) {
    const eventData: EventData = {
      event,
      timestamp: Date.now(),
      data,
    };

    this.state.events.push(eventData);

    // Mantener solo los últimos 1000 eventos
    if (this.state.events.length > 1000) {
      this.state.events = this.state.events.slice(-1000);
    }

    this.saveState();

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, data);
    }
  }

  /**
   * Trackea un milestone (solo una vez)
   */
  public trackMilestone(milestone: string, data?: Record<string, any>) {
    if (this.state.milestones[milestone]) {
      return; // Ya fue trackeado
    }

    this.state.milestones[milestone] = true;
    this.track('milestone_reached', { milestone, ...data });
  }

  /**
   * Inicia una nueva sesión
   */
  public startSession() {
    this.state.sessionStart = Date.now();
    this.state.totalSessions += 1;
    this.track('game_start', {
      session: this.state.totalSessions,
    });
    this.saveState();
  }

  /**
   * Finaliza la sesión actual
   */
  public endSession() {
    const duration = Date.now() - this.state.sessionStart;
    this.track('session_duration', {
      duration,
      durationMinutes: Math.floor(duration / 60000),
    });
    this.saveState();
  }

  /**
   * Obtiene estadísticas generales
   */
  public getStats() {
    const now = Date.now();
    const sessionDuration = now - this.state.sessionStart;

    // Contar eventos por tipo
    const eventCounts: Record<string, number> = {};
    this.state.events.forEach((e) => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    // Últimos 7 días de actividad
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentEvents = this.state.events.filter((e) => e.timestamp > sevenDaysAgo);

    return {
      totalEvents: this.state.events.length,
      totalSessions: this.state.totalSessions,
      currentSessionDuration: sessionDuration,
      currentSessionMinutes: Math.floor(sessionDuration / 60000),
      eventCounts,
      milestonesReached: Object.keys(this.state.milestones).length,
      last7DaysEvents: recentEvents.length,
    };
  }

  /**
   * Obtiene todos los milestones alcanzados
   */
  public getMilestones() {
    return Object.keys(this.state.milestones);
  }

  /**
   * Verifica si un milestone fue alcanzado
   */
  public hasMilestone(milestone: string): boolean {
    return !!this.state.milestones[milestone];
  }

  /**
   * Obtiene los últimos N eventos
   */
  public getRecentEvents(limit: number = 10): EventData[] {
    return this.state.events.slice(-limit).reverse();
  }

  /**
   * Resetea todas las analytics
   */
  public reset() {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

let analyticsInstance: Analytics | null = null;

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
}

// ============================================
// HOOKS DE REACT
// ============================================

import { useEffect } from 'react';

/**
 * Hook para inicializar analytics en el juego
 */
export function useAnalytics() {
  useEffect(() => {
    const analytics = getAnalytics();
    analytics.startSession();

    // Cleanup al desmontar
    return () => {
      analytics.endSession();
    };
  }, []);

  return getAnalytics();
}

// ============================================
// HELPERS PARA MILESTONES COMUNES
// ============================================

/**
 * Trackea milestones basados en recursos
 */
export function trackResourceMilestones(
  coins: number,
  seeds: number,
  analytics: Analytics
) {
  // Milestones de monedas
  if (coins >= 100 && !analytics.hasMilestone('coins_100')) {
    analytics.trackMilestone('coins_100', { coins });
  }
  if (coins >= 1000 && !analytics.hasMilestone('coins_1k')) {
    analytics.trackMilestone('coins_1k', { coins });
  }
  if (coins >= 10000 && !analytics.hasMilestone('coins_10k')) {
    analytics.trackMilestone('coins_10k', { coins });
  }

  // Milestones de semillas
  if (seeds >= 100 && !analytics.hasMilestone('seeds_100')) {
    analytics.trackMilestone('seeds_100', { seeds });
  }
  if (seeds >= 1000 && !analytics.hasMilestone('seeds_1k')) {
    analytics.trackMilestone('seeds_1k', { seeds });
  }
}

/**
 * Trackea milestones basados en plantas
 */
export function trackPlantMilestones(plantCount: number, analytics: Analytics) {
  if (plantCount >= 5 && !analytics.hasMilestone('plants_5')) {
    analytics.trackMilestone('plants_5', { plantCount });
  }
  if (plantCount >= 10 && !analytics.hasMilestone('plants_10')) {
    analytics.trackMilestone('plants_10', { plantCount });
  }
  if (plantCount >= 25 && !analytics.hasMilestone('plants_25')) {
    analytics.trackMilestone('plants_25', { plantCount });
  }
  if (plantCount >= 50 && !analytics.hasMilestone('plants_50')) {
    analytics.trackMilestone('plants_50', { plantCount });
  }
  if (plantCount >= 100 && !analytics.hasMilestone('plants_100')) {
    analytics.trackMilestone('plants_100', { plantCount });
  }
}
