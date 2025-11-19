# 🌿 Green Tycoon - Idle Plant Management Game

Un juego incremental (idle/clicker) de gestión de plantas desarrollado con **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Zustand** y **Prisma**.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Juego](#-arquitectura-del-juego)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Sistema de Monetización](#-sistema-de-monetización)
- [Seguridad](#-seguridad)
- [Documentación Técnica](#-documentación-técnica)

---

## ✨ Características

### Mecánicas de Juego
- ✅ **Sistema Idle/Incremental**: Las plantas generan semillas automáticamente
- ✅ **Progresión Exponencial**: Fórmulas balanceadas para crecimiento escalable
- ✅ **Ganancias Offline**: Continúa generando recursos hasta 24 horas offline
- ✅ **Sistema de Mejoras**: 5 tipos de upgrades diferentes
- ✅ **Expansión**: Compra nuevas macetas para aumentar producción
- ✅ **Auto-Save**: Guardado automático cada 30 segundos

### Monetización
- 💎 **Granjas Premium**: 2.5x velocidad + auto-recolección
- 💰 **Integración de Pagos**: Estructura preparada para Stripe
- 🔒 **Validación Segura**: Webhooks verificados server-side
- 📊 **Tracking**: Sistema de analíticas de compras

### Experiencia de Usuario
- 🎨 **UI Moderna**: Diseño limpio con Tailwind CSS
- 📱 **Responsive**: Optimizado para desktop, tablet y móvil
- ⚡ **Performance**: React 18 con optimizaciones
- 🌈 **Animaciones**: Feedback visual inmediato

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 4.5
- **TypeScript**: 5.5

### Backend
- **API**: Next.js API Routes
- **Database ORM**: Prisma 5.18
- **Database**: PostgreSQL
- **Payments**: Stripe (simulado)

### DevOps
- **Package Manager**: npm
- **Node.js**: >= 18.0.0
- **Linting**: ESLint
- **Type Checking**: TypeScript Strict Mode

---

## 🏗️ Arquitectura del Juego

### Flujo de Juego

```
┌─────────────────────────────────────────────────┐
│           GAME LOOP (GameLoop.tsx)              │
│  - Tick cada 100ms                              │
│  - Calcula producción de semillas              │
│  - Maneja ganancias offline                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│       ZUSTAND STORE (gameStore.ts)              │
│  - Single source of truth                       │
│  - Recursos (coins, seeds)                      │
│  - Plantas activas                              │
│  - Upgrades                                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│     BALANCE SYSTEM (gameBalance.ts)             │
│  - Fórmulas matemáticas                        │
│  - Cálculo de costos                           │
│  - Validación de progreso                      │
└─────────────────────────────────────────────────┘
```

### Fórmulas Matemáticas Clave

#### 1. Costo de Mejoras
```typescript
Costo = CostoBase × 1.15^Nivel

Ejemplo:
  Nivel 0 → 1: 10 × 1.15^0 = 10 monedas
  Nivel 10 → 11: 10 × 1.15^10 = 40.46 monedas
```

#### 2. Producción de Semillas
```typescript
SemillasSegundo = TasaBase × (1 + Nivel×0.1) × MultiplFarm

Donde:
  - TasaBase: 1 semilla/seg
  - MultiplFarm: 1.0 (normal) o 2.5 (premium)
```

#### 3. Valor de Semillas
```typescript
PrecioVenta = 5 × (1 + NivelCalidad×0.15)
```

Ver [GAME_DESIGN.md](./GAME_DESIGN.md) para documentación completa.

---

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/green-tycoon.git
cd green-tycoon
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
nano .env
```

4. **Inicializar Prisma**
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver datos
npm run prisma:studio
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/green_tycoon"

# Stripe (para pagos premium)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Seguridad
JWT_SECRET="tu-clave-secreta-jwt"
ENCRYPTION_KEY="clave-de-32-caracteres-aqui"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Base de Datos

El schema de Prisma define 6 modelos principales:

1. **User** - Datos del usuario y progreso
2. **Plant** - Cada planta individual
3. **Upgrade** - Mejoras del jugador
4. **PremiumPurchase** - Transacciones de pago
5. **GameSession** - Sesiones para analíticas
6. **GameEvent** - Eventos especiales (futuro)

Ver [prisma/schema.prisma](./prisma/schema.prisma) para detalles.

---

## 💻 Desarrollo

### Estructura de Archivos

```
green-tycoon/
├── app/
│   ├── api/
│   │   ├── purchase-premium/    # Webhook de Stripe
│   │   └── user/[userId]/       # CRUD de usuario
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página del juego
├── components/
│   ├── GameLoop.tsx             # Loop principal del juego
│   ├── Header.tsx               # Barra superior
│   ├── Notifications.tsx        # Sistema de notificaciones
│   ├── Plant.tsx                # Componente de planta
│   └── Shop.tsx                 # Tienda de mejoras
├── lib/
│   ├── gameBalance.ts           # Fórmulas y balanceo
│   └── security.ts              # Validaciones de seguridad
├── prisma/
│   └── schema.prisma            # Schema de base de datos
├── store/
│   └── gameStore.ts             # Estado global (Zustand)
├── GAME_DESIGN.md               # Documento de diseño
├── next.config.js               # Config de Next.js
├── package.json                 # Dependencias
├── tailwind.config.ts           # Config de Tailwind
└── tsconfig.json                # Config de TypeScript
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm run start            # Inicia servidor de producción
npm run lint             # Ejecuta ESLint

# Base de datos
npm run prisma:generate  # Genera cliente de Prisma
npm run prisma:migrate   # Ejecuta migraciones
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:push      # Push schema sin migración
```

### Componentes Principales

#### 1. GameLoop.tsx
El "heartbeat" del juego. Se ejecuta cada 100ms para:
- Actualizar producción de semillas
- Calcular ganancias offline
- Trigger auto-save

#### 2. Plant.tsx
Componente individual de cada planta con:
- Temporizador propio
- Estado visual (crecimiento, premium)
- Sistema de recolección

#### 3. Shop.tsx
Tienda con 3 tabs:
- **Upgrades**: Mejoras permanentes
- **Expansión**: Compra de macetas
- **Premium**: Granjas premium ($)

#### 4. gameStore.ts (Zustand)
Estado global que maneja:
- Recursos (coins, seeds)
- Plantas activas
- Upgrades comprados
- Persistencia en localStorage

---

## 💰 Sistema de Monetización

### Granjas Premium

**Características:**
- Velocidad de producción: **2.5x** más rápida
- Auto-recolección incluida desde nivel 1
- Skin visual dorado
- Beneficios permanentes

**Precio:** $4.99 USD (pago único)

### Integración de Stripe

1. **Configurar Webhook**
```bash
# En tu dashboard de Stripe, configura webhook a:
https://tu-dominio.com/api/purchase-premium

# Eventos a escuchar:
- checkout.session.completed
- payment_intent.succeeded
```

2. **Validación Server-Side**
El endpoint `/api/purchase-premium` verifica:
- Firma HMAC del webhook
- Validez del pago
- Actualiza `isPremium` en la base de datos

⚠️ **CRÍTICO:** Solo el backend puede setear `isPremium = true`. El frontend NUNCA puede modificar este flag.

---

## 🔒 Seguridad

### Medidas Implementadas

#### 1. Validación de Recursos
```typescript
// Previene valores negativos o infinitos
validateResources({ coins, seeds })
```

#### 2. Anti Time-Travel
```typescript
// Valida que timestamps sean razonables
validateTimestamp(timestamp, toleranceMs)
```

#### 3. Validación de Progreso
```typescript
// Verifica que el progreso sea físicamente posible
validateProgress(oldState, newState, maxProduction)
```

#### 4. Rate Limiting
```typescript
// Previene spam de requests
checkRateLimit(userId, maxRequests, windowMs)
```

#### 5. Detección de Bots
```typescript
// Detecta patrones de comportamiento automatizado
detectBotBehavior({ clicksPerSecond, requestsPerMinute })
```

Ver [lib/security.ts](./lib/security.ts) para implementación completa.

### Headers de Seguridad

Configurados en `next.config.js`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 📚 Documentación Técnica

### Cómo Funciona el Game Loop

```typescript
// 1. El componente GameLoop se monta
useEffect(() => {
  calculateOfflineProgress();  // Calcula ganancias mientras estaba cerrado
  startGameLoop();             // Inicia el loop
}, []);

// 2. Cada 100ms se ejecuta el tick
setInterval(() => {
  tick();  // Actualiza producción de todas las plantas
}, 100);

// 3. Cada 30s se hace auto-save
setInterval(() => {
  syncWithServer();  // Persiste estado
}, 30000);
```

### Cómo Funciona la Persistencia

**Frontend:**
- Zustand persiste en `localStorage` automáticamente
- Se guarda: recursos, plantas, upgrades, stats

**Backend:**
- API endpoints para sync con PostgreSQL
- Validaciones server-side de todos los cambios

### Fórmulas de Balanceo

Ver documento completo en [GAME_DESIGN.md](./GAME_DESIGN.md)

**Principios:**
1. Progresión exponencial (no lineal)
2. Soft cap en 50 macetas (prestigio)
3. Primeros 5 minutos: progresión rápida
4. Post 30 minutos: decisiones estratégicas

---

## 🎮 Guía de Juego

### Para Principiantes

1. **Primeros Pasos**
   - Comienza con 1 maceta
   - Recolecta semillas (click en la planta)
   - Vende semillas por monedas

2. **Expansión**
   - Usa semillas para comprar macetas nuevas
   - Más macetas = más producción

3. **Mejoras**
   - Gasta monedas en upgrades
   - Prioriza "Velocidad de Crecimiento" primero
   - Desbloquea "Auto-Recolección" pronto

4. **Idle**
   - El juego genera recursos offline
   - Vuelve después de horas para recolectar

### Estrategia Avanzada

- **Early Game (0-10 min):** Expande a 5-7 macetas rápido
- **Mid Game (10-30 min):** Balancea entre expansión y upgrades
- **Late Game (30+ min):** Enfócate en upgrades y considera premium
- **End Game (50+ macetas):** Prestigio para bonos permanentes

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más información.

---

## 👨‍💻 Autor

**Green Tycoon Team**

- Desarrollado con ❤️ y ☕
- Especializado en Gamificación y Economía de Juegos
- Stack: Next.js, React, TypeScript, Tailwind CSS

---

## 📧 Soporte

¿Tienes preguntas? Abre un [issue](https://github.com/tu-usuario/green-tycoon/issues) en GitHub.

---

## 🎯 Roadmap

### v1.1 (Próximamente)
- [ ] Sistema de prestigio completo
- [ ] Más tipos de plantas (Cactus, Fern, Sunflower)
- [ ] Eventos especiales temporales
- [ ] Leaderboards globales

### v1.2
- [ ] Modo multiplayer (trading)
- [ ] Achievements/logros
- [ ] Sistema de misiones diarias
- [ ] Skins personalizables

### v2.0
- [ ] Versión móvil (React Native)
- [ ] Push notifications
- [ ] Social features
- [ ] Temporadas competitivas

---

## 🚀 Deployment en Vercel

### Quick Deploy

El proyecto está optimizado para deployment en Vercel con un solo click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/green-tycoon)

### Deployment Manual

1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# Para preview
vercel

# Para producción
vercel --prod
```

### Variables de Entorno en Vercel

Configura estas variables en tu proyecto de Vercel (Settings → Environment Variables):

**Requeridas:**
- `DATABASE_URL` - URL de tu base de datos PostgreSQL
- `JWT_SECRET` - Clave secreta para JWT
- `ENCRYPTION_KEY` - Clave de encriptación (32 caracteres)

**Opcionales (para monetización):**
- `STRIPE_PUBLIC_KEY` - Clave pública de Stripe
- `STRIPE_SECRET_KEY` - Clave secreta de Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret del webhook

**Públicas:**
- `NEXT_PUBLIC_APP_URL` - URL de tu app (ej: https://tu-app.vercel.app)
- `NEXT_PUBLIC_APP_NAME` - "Green Tycoon"
- `NEXT_PUBLIC_APP_VERSION` - "1.0.0"

### Configuración de Base de Datos

Para producción, recomendamos usar **Vercel Postgres** o **Neon**:

#### Opción 1: Vercel Postgres
```bash
# En el dashboard de Vercel
1. Ve a Storage
2. Crea nuevo Postgres Database
3. Copia DATABASE_URL a tus variables de entorno
```

#### Opción 2: Neon (gratis)
```bash
# En https://neon.tech
1. Crea una cuenta
2. Crea un nuevo proyecto
3. Copia el connection string
4. Añade como DATABASE_URL en Vercel
```

### Post-Deployment

Después de deployar, ejecuta las migraciones de Prisma:

```bash
# Opción A: Desde local con DATABASE_URL de producción
DATABASE_URL="tu-database-url-de-produccion" npm run prisma:push

# Opción B: Añadir build command en Vercel
# En vercel.json o Project Settings:
# Build Command: npm run build && npx prisma generate && npx prisma db push
```

### Optimizaciones de Producción

El proyecto ya incluye:

✅ Compresión habilitada
✅ Headers de seguridad configurados
✅ React Strict Mode
✅ Code splitting automático
✅ Static generation donde es posible
✅ Edge runtime compatible

### Monitoreo

Después del deploy, monitorea tu app en:

- **Vercel Analytics**: Métricas de rendimiento
- **Vercel Logs**: Logs de errores y requests
- **Prisma**: Logs de base de datos

### Troubleshooting

**Error: "Cannot connect to database"**
```bash
# Verifica que DATABASE_URL esté configurado
# Asegúrate de ejecutar prisma:generate en build
```

**Error: "Module not found"**
```bash
# Limpia caché y rebuild
vercel --force
```

**Errores de TypeScript**
```bash
# Verifica tipos localmente antes de deploy
npm run build
```

### Performance Tips

1. **Habilita Edge Runtime** para mejor latencia global
2. **Usa Vercel Edge Config** para feature flags
3. **Implementa ISR** para páginas estáticas que cambian poco
4. **Optimiza imágenes** con Next.js Image component

---

**¡Gracias por jugar Green Tycoon!** 🌿✨
