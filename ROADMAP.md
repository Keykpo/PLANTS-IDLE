# 🗺️ ROADMAP - Green Tycoon

Roadmap de desarrollo post-MVP para convertir Green Tycoon en un juego completo y monetizable.

---

## 📊 ESTADO ACTUAL (v1.0 - MVP)

✅ **Completado:**
- Sistema idle básico funcional
- 5 tipos de upgrades
- Compra de macetas
- Ganancias offline
- Sistema premium (estructura)
- Persistencia local

---

## 🎯 FASE 1: PULIR Y OPTIMIZAR (1-2 semanas)

**Prioridad:** 🔴 CRÍTICA
**Objetivo:** Hacer el juego jugable y adictivo

### 1.1 Balanceo y Playtesting
- [ ] **Ajustar curva de progresión** (2-3 días)
  - Playtest inicial de 1 hora
  - Ajustar costos de upgrades si es muy lento/rápido
  - Verificar que primeros 10 minutos sean enganchantes
  - Archivo: `lib/gameBalance.ts`

- [ ] **Implementar analytics básicas** (1 día)
  - Tracking de eventos clave (primera compra, tiempo jugado)
  - LocalStorage para métricas offline
  - Archivo nuevo: `lib/analytics.ts`

- [ ] **Feedback visual mejorado** (2 días)
  - Números flotantes al ganar recursos (+10 💰)
  - Partículas al recolectar semillas
  - Animación de "level up" en upgrades
  - Sonidos básicos (opcional, usar Howler.js)
  - Archivo: `components/FloatingNumber.tsx`

### 1.2 UX/UI Polish
- [ ] **Tutorial interactivo** (2 días)
  - Tooltips en primer inicio
  - Flechas guiando primeras acciones
  - Sistema de hints progresivos
  - Archivo: `components/Tutorial.tsx`

- [ ] **Mejoras visuales** (2 días)
  - Animación de plantas creciendo
  - Estados visuales (plántula → planta → árbol)
  - Efectos de hover más pronunciados
  - Loading skeleton mientras carga

- [ ] **Responsive mobile** (1 día)
  - Verificar en mobile (320px-768px)
  - Ajustar grilla de plantas
  - Botones más grandes para touch

### 1.3 Sistema de Guardado Robusto
- [ ] **Cloud save con backend** (3 días)
  - Conectar con Prisma + PostgreSQL
  - Sincronización automática cada 30s
  - Botón manual de "Sincronizar"
  - Resolución de conflictos (último gana)
  - Archivos: `app/api/sync/route.ts`, `lib/syncManager.ts`

- [ ] **Sistema de autenticación** (2 días)
  - NextAuth.js con email/password
  - Login con Google
  - Recuperación de cuenta
  - Archivo: `app/api/auth/[...nextauth]/route.ts`

**Tiempo total Fase 1:** 12-15 días

---

## 🚀 FASE 2: CONTENIDO CORE (2-3 semanas)

**Prioridad:** 🟠 ALTA
**Objetivo:** Añadir profundidad y rejugabilidad

### 2.1 Sistema de Prestigio
- [ ] **Implementar mecánica de prestigio** (3 días)
  - Botón "Prestigio" cuando tienes 100+ macetas
  - Reset de progreso pero mantienes:
    - Puntos de prestigio (1 por cada 100 macetas)
    - Granjas premium compradas
  - Cada punto = +5% producción permanente
  - Modal confirmación con preview de beneficios
  - Archivo: `components/PrestigeModal.tsx`

- [ ] **Upgrades de prestigio** (2 días)
  - Árbol de habilidades exclusivo
  - Ejemplo: "Sembrador maestro" (+10% seeds inicial)
  - "Cosecha dorada" (chance de 2x seeds)
  - Archivo: `lib/prestigeUpgrades.ts`

### 2.2 Diversidad de Plantas
- [ ] **4 nuevos tipos de plantas** (4 días)
  - 🌵 **Cactus:** Lento pero valioso (0.5x speed, 3x value)
  - 🌿 **Fern:** Rápido pero barato (1.5x speed, 0.7x value)
  - 🌻 **Sunflower:** Balanced premium (1.2x speed, 1.2x value)
  - 🌴 **Palm:** Ultra late-game (0.3x speed, 10x value)

- [ ] **Sistema de desbloqueo** (1 día)
  - Cactus: 10 macetas
  - Fern: 20 macetas
  - Sunflower: 1er prestigio
  - Palm: 5 prestigios

- [ ] **Selector de planta al comprar maceta** (1 día)
  - Dropdown en Shop
  - Preview de stats
  - Archivo: `components/PlantSelector.tsx`

### 2.3 Eventos y Temporadas
- [ ] **Sistema de eventos temporales** (3 días)
  - "Primavera Loca" (+50% producción, 24h)
  - "Lluvia de Semillas" (drops aleatorios)
  - Admin panel para crear eventos
  - Archivo: `app/api/admin/events/route.ts`

- [ ] **Misiones diarias** (2 días)
  - "Recolecta 1000 semillas" → +100 coins
  - "Compra 3 upgrades" → +500 seeds
  - Reset diario a las 00:00 UTC
  - Archivo: `components/DailyMissions.tsx`

**Tiempo total Fase 2:** 16-20 días

---

## 💰 FASE 3: MONETIZACIÓN (1-2 semanas)

**Prioridad:** 🟡 MEDIA (si quieres ganar dinero)
**Objetivo:** Integrar pagos reales

### 3.1 Integración de Stripe
- [ ] **Configurar Stripe en producción** (1 día)
  - Cuenta verificada
  - Webhook endpoint configurado
  - Testing con Stripe CLI

- [ ] **Productos premium** (2 días)
  - **Granja Premium** - $4.99 (ya existe)
  - **Pack de 5 Granjas** - $19.99 (20% descuento)
  - **VIP Pass (mensual)** - $9.99/mes
    - 3x producción global
    - Acceso a plantas exclusivas
    - Eventos VIP

- [ ] **Sistema de IAP (In-App Purchases)** (2 días)
  - Packs de recursos:
    - 10,000 coins → $0.99
    - 100,000 coins → $4.99
    - 1,000,000 coins → $19.99
  - Archivo: `components/IAPShop.tsx`

### 3.2 Ads (Opcional - Monetización F2P)
- [ ] **Google AdSense o AdMob** (1 día)
  - Rewarded ads: "Ver video → +500 seeds"
  - Banner discreto (no intrusivo)
  - Max 1 rewarded ad cada 5 minutos

### 3.3 Sistema de Referidos
- [ ] **Programa de referidos** (2 días)
  - Invita amigo → Ambos reciben 1000 coins
  - Link único de referido
  - Tracking en base de datos
  - Archivo: `app/api/referral/route.ts`

**Tiempo total Fase 3:** 8-12 días

---

## 🎮 FASE 4: FEATURES AVANZADAS (3-4 semanas)

**Prioridad:** 🟢 BAJA (nice-to-have)
**Objetivo:** Diferenciación competitiva

### 4.1 Modo Multiplayer Asíncrono
- [ ] **Leaderboards globales** (3 días)
  - Top 100 por:
    - Más semillas totales
    - Más macetas
    - Mayor nivel de prestigio
  - Actualización en tiempo real con WebSockets
  - Archivo: `app/api/leaderboard/route.ts`

- [ ] **Sistema de amigos** (4 días)
  - Añadir amigos por username
  - Ver jardines de amigos (read-only)
  - Enviar/recibir gifts (500 seeds/día)
  - Archivo: `components/FriendsList.tsx`

- [ ] **Marketplace P2P** (5 días)
  - Vender/comprar plantas entre jugadores
  - Sistema de ofertas
  - Fee del 10% para el juego
  - Prevención de bots y scams
  - Archivo: `app/marketplace/page.tsx`

### 4.2 Guilds/Clanes
- [ ] **Sistema de guilds** (1 semana)
  - Crear/unirse a guild (max 50 miembros)
  - Chat interno
  - Objetivos de guild → Recompensas colectivas
  - Guild shop con items exclusivos
  - Archivo: `app/api/guilds/route.ts`

### 4.3 Achievements & Gamificación
- [ ] **Sistema de logros** (3 días)
  - 50+ achievements:
    - "Primer Millonario" (1M coins)
    - "Granjero Dedicado" (7 días seguidos)
    - "Coleccionista" (Todas las plantas)
  - Badges visuales en perfil
  - Rewards: Coins, seeds, títulos
  - Archivo: `lib/achievements.ts`

- [ ] **Perfil de usuario personalizable** (2 días)
  - Avatar (elegir entre 20 opciones)
  - Banner personalizado
  - Título (desbloqueables)
  - Estadísticas públicas
  - Archivo: `app/profile/[userId]/page.tsx`

### 4.4 Minijuegos
- [ ] **Ruleta diaria** (2 días)
  - 1 spin gratis/día
  - Premios: Coins, seeds, boosts
  - Spins extra con IAP ($0.99 por 5)

- [ ] **Jardinería activa** (3 días)
  - Click rápido: "Regar plantas" → +10% speed por 1h
  - Minijuego de matching (memory)
  - Archivo: `components/ActiveGarden.tsx`

**Tiempo total Fase 4:** 21-28 días

---

## 📱 FASE 5: EXPANSIÓN A MOBILE (4-6 semanas)

**Prioridad:** 🔵 FUTURO
**Objetivo:** Alcanzar mercado móvil

### 5.1 App Nativa (React Native)
- [ ] **Setup React Native** (1 semana)
  - Shared codebase con web
  - Monorepo con Turborepo
  - Reutilizar lógica de `lib/`

- [ ] **Adaptación UI mobile** (2 semanas)
  - Rediseño de componentes
  - Gestos touch
  - Optimización de performance

- [ ] **Push Notifications** (1 semana)
  - "¡Tus plantas generaron 10K seeds!"
  - "Evento especial activo"
  - Firebase Cloud Messaging

- [ ] **Publicación** (1 semana)
  - App Store (iOS)
  - Google Play (Android)
  - ASO (App Store Optimization)

**Tiempo total Fase 5:** 28-35 días

---

## 🔧 MEJORAS TÉCNICAS CONTINUAS

**Durante todo el desarrollo:**

### Performance
- [ ] Lazy loading de componentes
- [ ] Code splitting por rutas
- [ ] Optimización de imágenes (next/image)
- [ ] Service Worker para PWA
- [ ] Caché agresivo con Redis

### SEO & Marketing
- [ ] Meta tags optimizados
- [ ] Open Graph para redes sociales
- [ ] Sitemap.xml dinámico
- [ ] Blog con guías y tips
- [ ] Landing page separada

### Analytics & Monitoring
- [ ] Google Analytics 4
- [ ] Sentry para error tracking
- [ ] Mixpanel para funnels
- [ ] Hotjar para heatmaps

### Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests (Playwright)
- [ ] E2E tests críticos
- [ ] Load testing (k6)

---

## 📈 PRIORIZACIÓN RECOMENDADA

### Si quieres jugadores rápido:
1. **Fase 1** (pulir UX) → 2 semanas
2. **Fase 2.1** (prestigio) → 1 semana
3. **Fase 2.3** (eventos) → 1 semana
4. **Deploy + Marketing**

### Si quieres monetizar:
1. **Fase 1** (pulir UX) → 2 semanas
2. **Fase 3** (Stripe + IAP) → 2 semanas
3. **Fase 2.2** (más contenido) → 1 semana
4. **Marketing agresivo**

### Si quieres comunidad:
1. **Fase 1** (pulir UX) → 2 semanas
2. **Fase 4.1** (leaderboards) → 1 semana
3. **Fase 4.2** (guilds) → 1 semana
4. **Social media + Discord**

---

## 🎯 MILESTONES REALISTAS

### Mes 1: MVP Pulido
- ✅ v1.0 (actual)
- 🎯 v1.1 - Balanceo + Tutorial
- 🎯 v1.2 - Cloud save + Auth

### Mes 2: Contenido Core
- 🎯 v1.3 - Sistema de prestigio
- 🎯 v1.4 - Nuevas plantas
- 🎯 v1.5 - Eventos temporales

### Mes 3: Monetización
- 🎯 v2.0 - Stripe integrado
- 🎯 v2.1 - IAP completo
- 🎯 v2.2 - Marketing push

### Mes 4-6: Escalado
- 🎯 v3.0 - Multiplayer
- 🎯 v3.5 - Mobile app
- 🎯 v4.0 - Guilds & Social

---

## 💡 QUICK WINS (Implementar AHORA)

Features rápidas con alto impacto:

### 1. Números Flotantes (2 horas)
```tsx
// components/FloatingNumber.tsx
export function FloatingNumber({ value, x, y }) {
  return (
    <div className="absolute animate-float-up text-2xl font-bold text-green-500">
      +{value} 🌾
    </div>
  );
}
```

### 2. Sonidos Básicos (1 hora)
- Usar librería Howler.js
- Click → "pop.mp3"
- Compra → "coin.mp3"
- Level up → "success.mp3"

### 3. Confirmación de Prestigio (1 hora)
Modal simple: "¿Seguro? Perderás todo pero ganarás +X% permanente"

### 4. Stats del Jugador (30 min)
En header: "Jugando hace: 2h 34m"

### 5. Botón de Reset (30 min)
En configuración (para testing)

---

## 📞 SIGUIENTE PASO INMEDIATO

Te recomiendo empezar por:

### OPCIÓN A: Solo Quieres Jugarlo
```bash
# Implementa el proyecto localmente
npm install && npx prisma db push && npm run dev
```

### OPCIÓN B: Quieres Mejorarlo
1. **Implementa Fase 1.1** (Balanceo)
   - Juega 1 hora
   - Ajusta números en `lib/gameBalance.ts`
   - Prueba de nuevo

2. **Añade FloatingNumber** (Quick Win #1)
   - Crea componente
   - Integra en Plant.tsx
   - Satisfacción instantánea

### OPCIÓN C: Quieres Monetizarlo
1. **Deploy en Vercel** (ver DEPLOYMENT.md)
2. **Implementa Fase 3.1** (Stripe)
3. **Marketing en Reddit/Discord**

---

## 🎁 BONUS: Ideas Creativas

- **Plantas legendarias** (0.1% drop chance)
- **Sistema de crafting** (combinar plantas)
- **Jardín decorativo** (colocar items)
- **Mascotas** (dan buffs pasivos)
- **Clima dinámico** (lluvia = +20% growth)
- **PvP Garden Battles** (competencia asíncrona)

---

¿Cuál fase te interesa empezar? Puedo ayudarte a implementar cualquiera de estas features en detalle.
