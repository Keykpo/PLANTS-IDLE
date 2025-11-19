/**
 * Green Tycoon - Interactive Tutorial Component
 *
 * Sistema de onboarding para nuevos jugadores con tooltips progresivos.
 */

'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAnalytics } from '@/lib/analytics';

// ============================================
// TIPOS
// ============================================

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // Selector CSS del elemento a destacar
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Acción que debe hacer el jugador para avanzar
  arrow?: boolean; // Mostrar flecha apuntando
}

// ============================================
// STEPS DEL TUTORIAL
// ============================================

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a Green Tycoon! 🌱',
    description: 'Eres dueño de un negocio de plantas. Tu objetivo: cultivar, vender y expandir tu imperio verde.',
    target: '.plant-container',
    position: 'bottom',
    arrow: true,
  },
  {
    id: 'harvest',
    title: 'Recolecta semillas',
    description: 'Haz click en tu primera planta para recolectar semillas. Las plantas las generan automáticamente.',
    target: '.plant-container',
    position: 'bottom',
    action: 'harvest',
    arrow: true,
  },
  {
    id: 'sell',
    title: 'Vende tus semillas',
    description: 'Ahora haz click en "Vender Todas" para convertir tus semillas en monedas.',
    target: '[data-tutorial="sell-button"]',
    position: 'top',
    action: 'sell',
    arrow: true,
  },
  {
    id: 'buy-pot',
    title: 'Compra más macetas',
    description: 'Usa tus semillas para comprar nuevas macetas. ¡Más macetas = más producción!',
    target: '[data-tutorial="buy-pot"]',
    position: 'left',
    action: 'buy_pot',
    arrow: true,
  },
  {
    id: 'shop',
    title: 'Mejora tu negocio',
    description: 'En la tienda puedes comprar upgrades con monedas para aumentar tu producción.',
    target: '[data-tutorial="shop-button"]',
    position: 'bottom',
    action: 'open_shop',
    arrow: true,
  },
  {
    id: 'complete',
    title: '¡Tutorial completado! 🎉',
    description: 'Ahora sabes lo básico. Sigue cultivando, vendiendo y mejorando para construir tu imperio.',
    target: '.header',
    position: 'bottom',
    arrow: false,
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const { coins, seeds, plants } = useGameStore();

  // ============================================
  // VERIFICAR SI ES PRIMERA VEZ
  // ============================================

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('green-tycoon-tutorial-completed');

    if (!tutorialCompleted) {
      // Es la primera vez, iniciar tutorial después de 1 segundo
      const timer = setTimeout(() => {
        setIsActive(true);
        getAnalytics().track('first_purchase', { tutorial: 'started' });
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  // ============================================
  // ACTUALIZAR POSICIÓN DEL TOOLTIP
  // ============================================

  useEffect(() => {
    if (!isActive || currentStep >= TUTORIAL_STEPS.length) return;

    const step = TUTORIAL_STEPS[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;

    if (element) {
      setTargetElement(element);

      // Calcular posición del tooltip
      const rect = element.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      setTooltipPosition({ top, left });

      // Añadir efecto de highlight al elemento
      element.classList.add('tutorial-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, isActive]);

  // ============================================
  // DETECTAR ACCIONES DEL JUGADOR
  // ============================================

  useEffect(() => {
    if (!isActive || currentStep >= TUTORIAL_STEPS.length) return;

    const step = TUTORIAL_STEPS[currentStep];

    // Avanzar automáticamente según las acciones
    if (step.action) {
      switch (step.action) {
        case 'harvest':
          if (seeds > 0) {
            advanceStep();
          }
          break;

        case 'sell':
          if (coins > 0) {
            advanceStep();
          }
          break;

        case 'buy_pot':
          if (plants.length > 1) {
            advanceStep();
          }
          break;

        case 'open_shop':
          // Detectar click en botón de shop
          const shopButton = document.querySelector('[data-tutorial="shop-button"]');
          if (shopButton) {
            const handler = () => {
              advanceStep();
            };
            shopButton.addEventListener('click', handler);
            return () => shopButton.removeEventListener('click', handler);
          }
          break;
      }
    }
  }, [currentStep, seeds, coins, plants.length, isActive]);

  // ============================================
  // FUNCIONES
  // ============================================

  const advanceStep = () => {
    const nextStep = currentStep + 1;

    if (nextStep >= TUTORIAL_STEPS.length) {
      completeTutorial();
    } else {
      setCurrentStep(nextStep);
    }
  };

  const skipTutorial = () => {
    completeTutorial();
    getAnalytics().track('first_purchase', { tutorial: 'skipped' });
  };

  const completeTutorial = () => {
    setIsActive(false);
    localStorage.setItem('green-tycoon-tutorial-completed', 'true');
    getAnalytics().track('first_purchase', { tutorial: 'completed' });
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isActive || hasSeenTutorial) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black/70 z-40 pointer-events-none tutorial-overlay" />

      {/* Tooltip */}
      <div
        className="fixed z-50 tutorial-tooltip"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Flecha apuntando */}
        {step.arrow && (
          <div
            className={`absolute animate-bounce ${getArrowClass(step.position)}`}
          >
            {getArrowIcon(step.position)}
          </div>
        )}

        {/* Card del tooltip */}
        <div
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-2xl border-2 border-green-400 p-6 max-w-sm"
          style={{
            animation: 'tooltipPop 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-bold text-lg flex-1">
              {step.title}
            </h3>
            <button
              onClick={skipTutorial}
              className="text-white/70 hover:text-white text-sm ml-2"
            >
              Saltar
            </button>
          </div>

          {/* Descripción */}
          <p className="text-white/90 mb-4 text-sm leading-relaxed">
            {step.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Progreso */}
            <div className="text-white/70 text-xs">
              Paso {currentStep + 1} de {TUTORIAL_STEPS.length}
            </div>

            {/* Botón siguiente (solo en último paso) */}
            {isLastStep && (
              <button
                onClick={completeTutorial}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition-all"
              >
                ¡Entendido! 🚀
              </button>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="mt-4 bg-white/20 rounded-full h-1 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Styles inline */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5),
                      0 0 30px rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          animation: tutorialPulse 2s ease-in-out infinite;
        }

        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5),
                        0 0 30px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.7),
                        0 0 40px rgba(34, 197, 94, 0.5);
          }
        }

        @keyframes tooltipPop {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

// ============================================
// HELPERS
// ============================================

function getArrowClass(position: string): string {
  switch (position) {
    case 'top':
      return 'top-full mt-2 left-1/2 -translate-x-1/2';
    case 'bottom':
      return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    case 'left':
      return 'left-full ml-2 top-1/2 -translate-y-1/2';
    case 'right':
      return 'right-full mr-2 top-1/2 -translate-y-1/2';
    default:
      return '';
  }
}

function getArrowIcon(position: string): string {
  switch (position) {
    case 'top':
      return '⬇️';
    case 'bottom':
      return '⬆️';
    case 'left':
      return '➡️';
    case 'right':
      return '⬅️';
    default:
      return '👇';
  }
}
