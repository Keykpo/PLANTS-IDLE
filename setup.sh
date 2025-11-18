#!/bin/bash

echo "🌿 Green Tycoon - Script de Instalación"
echo "========================================"
echo ""

# 1. Instalar dependencias
echo "📦 Instalando dependencias de Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

# 2. Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generando cliente de Prisma"
    exit 1
fi

echo "✅ Cliente de Prisma generado"
echo ""

# 3. Crear base de datos y ejecutar migraciones
echo "💾 Creando base de datos..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Error creando base de datos"
    exit 1
fi

echo "✅ Base de datos creada"
echo ""

# Éxito
echo "🎉 ¡Instalación completada con éxito!"
echo ""
echo "Para ejecutar el proyecto:"
echo "  npm run dev"
echo ""
echo "El juego estará disponible en:"
echo "  http://localhost:3000"
echo ""
