/**
 * Green Tycoon - Notifications Component
 *
 * Sistema de notificaciones toast que aparecen en la esquina
 * para feedback inmediato de acciones del jugador.
 */

'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function Notifications() {
  const notificationQueue = useGameStore((state) => state.notificationQueue);
  const clearNotification = useGameStore((state) => state.clearNotification);

  const currentNotification = notificationQueue[0];

  useEffect(() => {
    if (currentNotification) {
      const timeout = setTimeout(() => {
        clearNotification();
      }, 3000); // Desaparece después de 3 segundos

      return () => clearTimeout(timeout);
    }
  }, [currentNotification, clearNotification]);

  if (!currentNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl border border-gray-700 max-w-sm">
        <p className="font-medium">{currentNotification}</p>
      </div>
    </div>
  );
}
