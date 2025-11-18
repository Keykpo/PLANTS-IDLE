# 🚀 Guía de Deployment - Green Tycoon

Esta guía cubre el despliegue de Green Tycoon en diferentes plataformas.

---

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Vercel](#deployment-en-vercel)
3. [Railway](#deployment-en-railway)
4. [Docker](#deployment-con-docker)
5. [Variables de Entorno](#variables-de-entorno)
6. [Base de Datos](#configuración-de-base-de-datos)
7. [Stripe Webhooks](#configuración-de-stripe)

---

## ✅ Preparación

### 1. Build Local

Verifica que el proyecto compile correctamente:

```bash
npm run build
```

### 2. Checklist Pre-Deploy

- [ ] Todas las variables de entorno están configuradas
- [ ] Base de datos PostgreSQL está lista
- [ ] Migraciones de Prisma ejecutadas
- [ ] Stripe configurado (si se usa monetización)
- [ ] Tests pasando (si los hay)

---

## ☁️ Deployment en Vercel

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Deploy

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### Paso 4: Configurar Variables de Entorno

En el dashboard de Vercel (https://vercel.com):

1. Ir a tu proyecto
2. Settings → Environment Variables
3. Añadir todas las variables de `.env.example`

### Paso 5: Configurar Base de Datos

**Opción A: Vercel Postgres**
```bash
vercel postgres create
```

**Opción B: External (Railway, Supabase, etc.)**
- Copia el `DATABASE_URL`
- Añádelo en Environment Variables de Vercel

### Paso 6: Ejecutar Migraciones

```bash
# En tu máquina local con DATABASE_URL de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🚂 Deployment en Railway

### Paso 1: Crear Cuenta

1. Ir a [railway.app](https://railway.app)
2. Crear cuenta con GitHub

### Paso 2: Nuevo Proyecto

1. New Project → Deploy from GitHub repo
2. Seleccionar tu repositorio

### Paso 3: Añadir Base de Datos

1. New → Database → PostgreSQL
2. Railway generará automáticamente `DATABASE_URL`

### Paso 4: Configurar Variables

En el dashboard de Railway:

```bash
# Variables requeridas
DATABASE_URL=postgresql://... (auto-generado)
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=...
NEXT_PUBLIC_APP_URL=https://tu-app.up.railway.app
```

### Paso 5: Deploy

Railway hace auto-deploy en cada push a main.

```bash
git push origin main
```

---

## 🐳 Deployment con Docker

### Dockerfile

Crea `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/green_tycoon
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=green_tycoon
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Ejecutar

```bash
# Build y start
docker-compose up --build

# Stop
docker-compose down

# Logs
docker-compose logs -f
```

---

## 🔐 Variables de Entorno

### Producción

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# Stripe
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."

# Security
JWT_SECRET="cambiar-por-clave-segura-64-caracteres-minimo"
ENCRYPTION_KEY="cambiar-por-clave-32-caracteres"

# App
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
NODE_ENV="production"
```

### Generar Claves Seguras

```bash
# JWT Secret (64 chars)
openssl rand -base64 64

# Encryption Key (32 chars)
openssl rand -base64 32
```

---

## 💾 Configuración de Base de Datos

### Opción 1: Vercel Postgres

```bash
vercel postgres create green-tycoon-db
```

### Opción 2: Railway

1. Dashboard → New → PostgreSQL
2. Copia `DATABASE_URL` de las variables

### Opción 3: Supabase

1. Ir a [supabase.com](https://supabase.com)
2. New Project → Crear base de datos
3. Settings → Database → Connection String
4. Copiar URI de PostgreSQL

### Opción 4: Render

1. Ir a [render.com](https://render.com)
2. New → PostgreSQL
3. Copiar Internal Database URL

### Ejecutar Migraciones

```bash
# Asegúrate de que DATABASE_URL apunta a producción
npx prisma migrate deploy

# Verificar
npx prisma db push
```

---

## 💳 Configuración de Stripe

### Paso 1: Crear Cuenta

1. Ir a [stripe.com](https://stripe.com)
2. Crear cuenta y activar modo test

### Paso 2: Obtener API Keys

Dashboard → Developers → API Keys:
- Publishable key (empieza con `pk_`)
- Secret key (empieza con `sk_`)

### Paso 3: Configurar Webhook

Dashboard → Developers → Webhooks → Add endpoint:

```
URL: https://tu-dominio.com/api/purchase-premium
Eventos a escuchar:
  - checkout.session.completed
  - payment_intent.succeeded
```

### Paso 4: Copiar Webhook Secret

Después de crear el webhook:
- Copiar "Signing secret" (empieza con `whsec_`)
- Añadirlo como `STRIPE_WEBHOOK_SECRET`

### Paso 5: Crear Productos

Dashboard → Products → Add product:

```
Nombre: Premium Farm
Precio: $4.99 USD
Tipo: One-time payment
```

Copiar el `price_id` (empieza con `price_`)

---

## 🧪 Testing del Deploy

### 1. Health Check

```bash
curl https://tu-dominio.com/api/health
```

### 2. Database Connection

```bash
# Verificar que Prisma puede conectar
npx prisma db pull --url="tu_database_url"
```

### 3. Stripe Webhook

Stripe CLI para testing local:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/purchase-premium
```

---

## 📊 Monitoreo

### Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
- Dashboard → View Logs

**Docker:**
```bash
docker-compose logs -f app
```

### Errores Comunes

#### 1. "Cannot connect to database"
- Verificar `DATABASE_URL`
- Verificar que la base de datos está activa
- Verificar whitelist de IPs

#### 2. "Stripe webhook signature invalid"
- Verificar `STRIPE_WEBHOOK_SECRET`
- Verificar que el webhook está configurado correctamente

#### 3. "Module not found"
- Ejecutar `npm install`
- Verificar que `.next` está en `.gitignore`
- Ejecutar `npm run build` localmente

---

## 🔄 CI/CD

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🎉 Post-Deploy

### 1. Verificar Funcionalidad

- [ ] Página carga correctamente
- [ ] Juego funciona (plantas generan semillas)
- [ ] Tienda funciona
- [ ] Auto-save funciona
- [ ] Offline earnings funcionan

### 2. SEO

- [ ] Verificar meta tags en `layout.tsx`
- [ ] Añadir `sitemap.xml`
- [ ] Añadir `robots.txt`

### 3. Analytics

```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

---

## 📞 Soporte

Si tienes problemas con el deployment:

1. Revisa los logs
2. Verifica variables de entorno
3. Abre un issue en GitHub
4. Consulta la documentación de tu plataforma

---

¡Deployment exitoso! 🚀✨
