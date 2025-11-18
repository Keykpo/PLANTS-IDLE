/**
 * Green Tycoon - User API
 *
 * Endpoints para obtener y actualizar el estado del usuario.
 * Incluye validaciones de seguridad para prevenir cheating.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/[userId]
 *
 * Obtiene el estado completo del usuario desde la base de datos.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // TODO: Validar sesión/JWT del usuario
    // if (!isValidSession(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // En producción, conectar con Prisma
    /*
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plants: true,
        upgrades: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        coins: user.coins,
        seeds: user.seeds,
        isPremium: user.isPremium,
        prestigeLevel: user.prestigeLevel,
        plants: user.plants,
        upgrades: user.upgrades.reduce((acc, upgrade) => {
          acc[upgrade.upgradeType] = upgrade.level;
          return acc;
        }, {} as Record<string, number>),
        lastLogin: user.lastLogin,
      },
    });
    */

    // DEMO: Respuesta simulada
    return NextResponse.json({
      user: {
        id: userId,
        coins: 100,
        seeds: 50,
        isPremium: false,
        prestigeLevel: 0,
        plants: [
          {
            id: 'plant-0',
            tier: 'NORMAL',
            position: 0,
            isActive: true,
            accumulatedSeeds: 0,
          },
        ],
        upgrades: {
          GROWTH_SPEED: 0,
          SEED_VALUE: 0,
          AUTO_HARVEST: 0,
          OFFLINE_EARNINGS: 0,
          BULK_SELL: 0,
        },
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/[userId]
 *
 * Actualiza el estado del usuario.
 * IMPORTANTE: Incluye validaciones anti-cheating.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();

    // TODO: Validar sesión
    // if (!isValidSession(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // ========== VALIDACIONES CRÍTICAS ==========

    // 1. NO permitir modificar isPremium desde el cliente
    if ('isPremium' in body) {
      console.error('Attempted to modify isPremium from client');
      return NextResponse.json(
        { error: 'Cannot modify premium status' },
        { status: 403 }
      );
    }

    // 2. Validar que los recursos no sean negativos
    if (body.coins < 0 || body.seeds < 0) {
      console.error('Attempted to set negative resources');
      return NextResponse.json(
        { error: 'Invalid resource values' },
        { status: 400 }
      );
    }

    // 3. Validar timestamps (prevenir time travel)
    if (body.lastLogin) {
      const lastLogin = new Date(body.lastLogin).getTime();
      const now = Date.now();
      const maxDiff = 5 * 60 * 1000; // 5 minutos de tolerancia

      if (lastLogin > now + maxDiff) {
        console.error('Invalid timestamp detected');
        return NextResponse.json(
          { error: 'Invalid timestamp' },
          { status: 400 }
        );
      }
    }

    // 4. Rate limiting (prevenir spam)
    // TODO: Implementar Redis para rate limiting
    // const isRateLimited = await checkRateLimit(userId);
    // if (isRateLimited) {
    //   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    // }

    // En producción, actualizar en Prisma
    /*
    const prisma = new PrismaClient();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: body.coins,
        seeds: body.seeds,
        lastLogin: new Date(body.lastLogin || Date.now()),
        totalGameTime: body.totalGameTime,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
    */

    // DEMO: Respuesta simulada
    console.log('User update would be applied:', {
      userId,
      coins: body.coins,
      seeds: body.seeds,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully (demo mode)',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/[userId]
 *
 * Elimina la cuenta del usuario (GDPR compliance).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // TODO: Validar que el usuario tiene permiso para eliminar esta cuenta
    // TODO: Implementar soft delete en producción

    /*
    const prisma = new PrismaClient();

    await prisma.user.delete({
      where: { id: userId },
    });
    */

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
