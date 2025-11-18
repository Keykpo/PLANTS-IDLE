/**
 * Green Tycoon - Main Game Page
 *
 * Página principal del juego que integra todos los componentes.
 */

'use client';

import { useGameStore } from '@/store/gameStore';
import Header from '@/components/Header';
import Plant from '@/components/Plant';
import Shop from '@/components/Shop';
import GameLoop from '@/components/GameLoop';
import Notifications from '@/components/Notifications';

export default function Home() {
  const plants = useGameStore((state) => state.plants);
  const showShop = useGameStore((state) => state.showShop);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
      {/* Game Loop (invisible pero crítico) */}
      <GameLoop />

      {/* Header con recursos */}
      <Header />

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Título de sección */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">🌿 Tu Jardín</h2>
          <p className="text-green-200">
            Tienes {plants.length} {plants.length === 1 ? 'planta' : 'plantas'}
          </p>
        </div>

        {/* Grilla de Plantas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {plants.map((plant) => (
            <Plant
              key={plant.id}
              id={plant.id}
              tier={plant.tier}
              accumulatedSeeds={plant.accumulatedSeeds}
              isActive={plant.isActive}
            />
          ))}

          {/* Slot para comprar nueva maceta */}
          {plants.length < 50 && (
            <button
              onClick={() => useGameStore.getState().toggleShop()}
              className="
                w-32 h-32
                rounded-2xl
                border-4 border-dashed border-green-400/50
                bg-green-800/30
                hover:bg-green-700/50
                hover:border-green-400
                transition-all
                duration-300
                flex flex-col items-center justify-center
                group
                hover:scale-105
              "
            >
              <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <div className="text-xs text-green-300 font-semibold">
                Nueva Maceta
              </div>
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Producción */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-white font-bold text-lg mb-2">Producción Total</h3>
            <p className="text-green-300 text-sm">
              Tus plantas generan recursos automáticamente cada segundo, incluso cuando estás ausente.
            </p>
          </div>

          {/* Card 2: Mejoras */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-white font-bold text-lg mb-2">Mejoras Estratégicas</h3>
            <p className="text-green-300 text-sm">
              Invierte en mejoras para aumentar tu velocidad de producción y el valor de tus semillas.
            </p>
          </div>

          {/* Card 3: Premium */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-yellow-200 font-bold text-lg mb-2">Granjas Premium</h3>
            <p className="text-yellow-300 text-sm">
              2.5x más rápidas con auto-recolección incluida. ¡Desbloquea el máximo potencial!
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
            <h3 className="text-blue-200 font-bold text-xl mb-4 flex items-center gap-2">
              💡 Consejos para Principiantes
            </h3>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>Primeros pasos:</strong> Recolecta semillas y véndelas para obtener monedas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>Expande:</strong> Usa semillas para comprar nuevas macetas y aumentar tu producción.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>Mejora:</strong> Invierte monedas en upgrades para acelerar tu progreso.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>
                  <strong>Idle:</strong> El juego genera recursos incluso cuando estás offline (hasta 24h).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-green-700/30">
        <div className="text-center text-green-300 text-sm space-y-2">
          <p>🌱 Green Tycoon v1.0.0</p>
          <p className="text-xs text-green-400/60">
            Hecho con 💚 usando Next.js, Tailwind CSS, Zustand y Prisma
          </p>
        </div>
      </footer>

      {/* Shop Modal */}
      {showShop && <Shop />}

      {/* Notifications */}
      <Notifications />
    </div>
  );
}
