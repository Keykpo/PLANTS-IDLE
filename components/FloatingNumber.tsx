/**
 * Green Tycoon - Floating Number Component
 *
 * Muestra números flotantes animados cuando el jugador gana recursos.
 * Añade feedback visual satisfactorio y sensación de progreso.
 */

'use client';

import { useEffect, useState } from 'react';

export interface FloatingNumberProps {
  value: number;
  type: 'coins' | 'seeds' | 'success' | 'info';
  x?: number; // Posición X (opcional)
  y?: number; // Posición Y (opcional)
  onComplete?: () => void; // Callback cuando termina la animación
}

export default function FloatingNumber({
  value,
  type,
  x,
  y,
  onComplete,
}: FloatingNumberProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Configuración por tipo
  const config = {
    coins: {
      color: 'text-yellow-400',
      icon: '💰',
      shadow: 'drop-shadow-lg shadow-yellow-500',
    },
    seeds: {
      color: 'text-green-400',
      icon: '🌾',
      shadow: 'drop-shadow-lg shadow-green-500',
    },
    success: {
      color: 'text-emerald-400',
      icon: '✨',
      shadow: 'drop-shadow-lg shadow-emerald-500',
    },
    info: {
      color: 'text-blue-400',
      icon: 'ℹ️',
      shadow: 'drop-shadow-lg shadow-blue-500',
    },
  };

  const currentConfig = config[type];

  // Posición aleatoria si no se especifica
  const randomX = x ?? Math.random() * 40 - 20; // -20 a 20
  const randomY = y ?? 0;

  useEffect(() => {
    // Desaparecer después de la animación (1.5s)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        absolute pointer-events-none z-50
        animate-float-up-fade
        ${currentConfig.color}
        ${currentConfig.shadow}
      `}
      style={{
        left: `calc(50% + ${randomX}px)`,
        top: `calc(50% + ${randomY}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="text-3xl font-black tracking-tight flex items-center gap-1">
        <span>+{value.toLocaleString()}</span>
        <span className="text-2xl">{currentConfig.icon}</span>
      </div>
    </div>
  );
}

/**
 * Hook para gestionar múltiples números flotantes
 */
export function useFloatingNumbers() {
  const [numbers, setNumbers] = useState<
    Array<{
      id: string;
      value: number;
      type: FloatingNumberProps['type'];
      x?: number;
      y?: number;
    }>
  >([]);

  const addFloatingNumber = (
    value: number,
    type: FloatingNumberProps['type'],
    x?: number,
    y?: number
  ) => {
    const id = `${Date.now()}-${Math.random()}`;

    setNumbers((prev) => [
      ...prev,
      { id, value, type, x, y },
    ]);
  };

  const removeFloatingNumber = (id: string) => {
    setNumbers((prev) => prev.filter((num) => num.id !== id));
  };

  return {
    numbers,
    addFloatingNumber,
    FloatingNumbersRenderer: () => (
      <>
        {numbers.map((num) => (
          <FloatingNumber
            key={num.id}
            value={num.value}
            type={num.type}
            x={num.x}
            y={num.y}
            onComplete={() => removeFloatingNumber(num.id)}
          />
        ))}
      </>
    ),
  };
}
