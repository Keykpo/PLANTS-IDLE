# Green Tycoon - Diseño de Juego y Arquitectura Económica

## 📐 FASE 1: MATEMÁTICAS Y BALANCEO

### 1.1 Fórmulas de Progresión Económica

#### **Costo de Mejoras (Upgrades)**
Sistema de crecimiento exponencial para evitar progresión lineal aburrida:

```
Costo de Mejora = CostoBase × Multiplicador^Nivel

Donde:
- CostoBase: Costo inicial de la mejora
- Multiplicador: 1.15 (15% de incremento por nivel)
- Nivel: Nivel actual de la mejora

Ejemplo:
  Mejora de Velocidad:
  - Nivel 0 → 1: 10 monedas × 1.15^0 = 10 monedas
  - Nivel 1 → 2: 10 monedas × 1.15^1 = 11.5 monedas
  - Nivel 5 → 6: 10 monedas × 1.15^5 = 20.11 monedas
  - Nivel 10 → 11: 10 monedas × 1.15^10 = 40.46 monedas
```

#### **Generación de Semillas por Planta**
```
Semillas/Segundo = TasaBase × MultiplVelocidad × MultiplFarm × BonusGlobal

Donde:
- TasaBase: 1 semilla/seg (planta básica)
- MultiplVelocidad: 1 + (NivelVelocidad × 0.1)
  * Cada nivel incrementa 10% la velocidad
- MultiplFarm: 1.0 (normal) o 2.5 (premium)
- BonusGlobal: Multiplicadores especiales/eventos

Ejemplo de Planta Normal Nivel 5:
  1 × (1 + 5×0.1) × 1.0 × 1.0 = 1.5 semillas/seg

Ejemplo de Planta Premium Nivel 5:
  1 × (1 + 5×0.1) × 2.5 × 1.0 = 3.75 semillas/seg
```

#### **Valor de Conversión Semilla → Moneda**
```
PrecioVenta = ValorBase × (1 + NivelCalidad × 0.15)

Donde:
- ValorBase: 5 monedas por semilla
- NivelCalidad: Nivel de mejora "Calidad de Semilla"
- 0.15: 15% de incremento por nivel

Ejemplo Nivel 3:
  5 × (1 + 3×0.15) = 7.25 monedas/semilla
```

#### **Costo de Nuevas Macetas**
```
CostoMaceta = 50 × 1.25^(CantidadActual)

Esta progresión es más agresiva (25%) para forzar
al jugador a mejorar antes de expandir.

Ejemplos:
  Maceta 1: 50 × 1.25^0 = 50 semillas
  Maceta 2: 50 × 1.25^1 = 62.5 semillas
  Maceta 5: 50 × 1.25^4 = 122 semillas
  Maceta 10: 50 × 1.25^9 = 373 semillas
```

### 1.2 Sistema de Prestigio (Futuro)
```
Al "reiniciar" con 100+ macetas:
- Ganas 1 "Punto de Prestigio"
- Cada punto da +5% de generación permanente
- Se mantienen las granjas premium compradas
```

---

## 🗄️ MODELOS DE BASE DE DATOS

### 1.3 Arquitectura de Datos (Prisma Schema)

**Entidades Principales:**
1. **User** - Cuenta de usuario y progreso
2. **Plant** - Cada planta individual en el juego
3. **Upgrade** - Mejoras del jugador
4. **PremiumPurchase** - Transacciones de compras reales
5. **GameSession** - Para tracking de analíticas

**Relaciones:**
- Un User tiene muchas Plants (1:N)
- Un User tiene muchas Upgrades (1:N)
- Un User tiene muchas PremiumPurchases (1:N)

---

## 🎮 GAME LOOP Y MECÁNICAS

### 1.4 Flujo del Jugador

```
INICIO
  ↓
[1 Maceta + Planta Básica]
  ↓
Planta genera Semillas cada segundo
  ↓
DECISIÓN DEL JUGADOR:
  ├─→ Vender Semillas por Monedas
  ├─→ Usar Semillas para comprar Nueva Maceta
  └─→ Gastar Monedas en Mejoras
      ├─→ Velocidad de Crecimiento
      ├─→ Valor de Semilla
      └─→ Auto-Recolección (Unlock)
  ↓
BUCLE INFINITO
```

### 1.5 Monetización Premium

**Tier Normal (Gratis):**
- Velocidad base: 1.0x
- Requiere click para recolectar (hasta unlock de auto-harvest)
- Sin límite de macetas

**Tier Premium (Compra Real - $4.99 USD):**
- Velocidad base: 2.5x (150% más rápido)
- Auto-recolección desde nivel 1
- Skin visual especial (brillo dorado)
- Sin límite de macetas premium

**Validación de Seguridad:**
- Las transacciones se procesan vía webhook de Stripe
- El backend verifica firma HMAC
- Solo el servidor puede setear `isPremium = true`
- El frontend NUNCA puede modificar este flag directamente

---

## 📊 SISTEMA DE BALANCEO

### 1.6 Curva de Dificultad

**Primeros 5 minutos:**
- El jugador puede alcanzar 3-4 macetas
- Desbloquea primera mejora de velocidad
- Siente progresión rápida

**10-20 minutos:**
- Tiene 8-10 macetas
- Debe elegir entre expandir o mejorar
- Introduce decisiones estratégicas

**30+ minutos:**
- 15-20 macetas
- La compra premium se vuelve atractiva
- El idle pasivo genera recursos significativos

**Soft Cap:** 50 macetas (sin prestigio)
  - Aquí el costo es tan alto que es mejor prestigiar

---

## 🔒 SEGURIDAD

### 1.7 Prevención de Cheating

**Validaciones Backend:**
1. Todos los recursos se calculan server-side
2. Timestamps se validan contra hora del servidor
3. Compras premium requieren verificación de webhook
4. Rate limiting en endpoints críticos

**Validación de Tiempo Offline:**
```javascript
// Calcula recursos generados mientras el usuario no estaba
const timeOffline = Date.now() - lastLoginTimestamp;
const maxOfflineTime = 24 * 60 * 60 * 1000; // 24 horas máximo

const effectiveTime = Math.min(timeOffline, maxOfflineTime);
const resourcesGenerated = calculateProduction(userPlants) * (effectiveTime / 1000);
```

---

## 🎨 PRINCIPIOS DE UI/UX

### 1.8 Diseño Visual

**Paleta de Colores:**
- Verde primario: `#10B981` (plantas activas)
- Verde oscuro: `#065F46` (fondos)
- Dorado: `#F59E0B` (premium/monedas)
- Gris: `#6B7280` (elementos deshabilitados)

**Feedback Visual:**
- Partículas al recolectar semillas
- Animación de crecimiento suave (transform scale)
- Números flotantes al ganar recursos
- Pulso en botones disponibles

---

## 📈 MÉTRICAS DE ÉXITO

### 1.9 KPIs del Juego

**Retención:**
- D1 (Día 1): 40% objetivo
- D7 (Día 7): 15% objetivo
- D30: 5% objetivo

**Monetización:**
- Conversión a Premium: 2-5% de usuarios
- ARPU (Average Revenue Per User): $0.10-0.20
- ARPPU (Paying users): $4.99-9.98

**Engagement:**
- Sesiones/día: 3-5
- Tiempo promedio/sesión: 5-10 minutos
- Lifetime: 14 días promedio

---

Esta arquitectura está diseñada para:
✅ Escalabilidad técnica (Next.js + Prisma + PostgreSQL)
✅ Balanceo económico justo pero monetizable
✅ Seguridad contra cheating
✅ Experiencia F2P satisfactoria + incentivos premium éticos
