/**
 * Green Tycoon - Shop Floating Numbers Wrapper
 *
 * Este componente proporciona un contexto para mostrar FloatingNumbers
 * en todo el componente Shop.
 */

'use client';

import { createContext, useContext } from 'react';
import { useFloatingNumbers } from '@/components/FloatingNumber';

type FloatingNumberContextType = {
  addFloatingNumber: (
    value: number,
    type: 'coins' | 'seeds' | 'success' | 'info',
    x?: number,
    y?: number
  ) => void;
};

const FloatingNumberContext = createContext<FloatingNumberContextType | null>(null);

export function useShopFloatingNumbers() {
  const context = useContext(FloatingNumberContext);
  if (!context) {
    throw new Error('useShopFloatingNumbers must be used within ShopFloatingNumbersProvider');
  }
  return context;
}

export function ShopFloatingNumbersProvider({ children }: { children: React.ReactNode }) {
  const { addFloatingNumber, FloatingNumbersRenderer } = useFloatingNumbers();

  return (
    <FloatingNumberContext.Provider value={{ addFloatingNumber }}>
      {children}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100]">
        <FloatingNumbersRenderer />
      </div>
    </FloatingNumberContext.Provider>
  );
}
