/**
 * Green Tycoon - Premium Purchase API
 *
 * Endpoint para procesar compras premium.
 *
 * CRÍTICO: Este endpoint debe validar webhooks de Stripe
 * para evitar fraude. Solo el backend puede marcar isPremium = true.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// En producción, estos valores vendrían de variables de entorno
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

/**
 * POST /api/purchase-premium
 *
 * Este endpoint es llamado por el webhook de Stripe cuando
 * un usuario completa una compra premium.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener el body y la firma del webhook
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // 2. Verificar la firma HMAC de Stripe
    const isValid = verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);

    if (!isValid) {
      console.error('Invalid Stripe signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // 3. Parsear el evento
    const event = JSON.parse(body);

    // 4. Procesar según el tipo de evento
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verifica la firma HMAC de Stripe
 */
function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // En producción, usa la librería oficial de Stripe
    // stripe.webhooks.constructEvent(payload, signature, secret)

    // Para esta demo, hacemos una verificación simplificada
    const elements = signature.split(',');
    const signatures: Record<string, string> = {};

    for (const element of elements) {
      const [key, value] = element.split('=');
      signatures[key] = value;
    }

    const timestamp = signatures.t;
    const expectedSignature = signatures.v1;

    if (!timestamp || !expectedSignature) {
      return false;
    }

    // Crear HMAC
    const signedPayload = `${timestamp}.${payload}`;
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Comparación segura
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(hmac)
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Maneja el evento de checkout completado
 */
async function handleCheckoutCompleted(session: any) {
  const userId = session.client_reference_id; // El ID del usuario
  const productId = session.metadata?.product_id || 'premium_farm';
  const amountPaid = session.amount_total / 100; // Stripe usa centavos

  console.log('Processing checkout for user:', userId);

  try {
    // Aquí conectarías con Prisma para actualizar la base de datos
    /*
    const prisma = new PrismaClient();

    // 1. Crear registro de compra
    await prisma.premiumPurchase.create({
      data: {
        userId,
        productId,
        priceUSD: amountPaid,
        transactionId: session.payment_intent,
        paymentProvider: 'STRIPE',
        webhookVerified: true,
        appliedAt: new Date(),
        webhookPayload: session,
      },
    });

    // 2. Actualizar el usuario a premium
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        totalMoneySpent: {
          increment: amountPaid,
        },
      },
    });

    // 3. Añadir una granja premium al usuario
    await prisma.plant.create({
      data: {
        userId,
        plantType: 'BASIC',
        tier: 'PREMIUM',
        position: await getNextPlantPosition(userId),
      },
    });

    console.log('Premium purchase applied successfully');
    */

    // DEMO: Simulación de éxito
    console.log('✅ Premium purchase would be applied in production');
    console.log({
      userId,
      productId,
      amountPaid,
      transactionId: session.payment_intent,
    });
  } catch (error) {
    console.error('Error applying premium purchase:', error);
    throw error;
  }
}

/**
 * Maneja el evento de pago exitoso
 */
async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  // Lógica adicional si es necesaria
}

/**
 * Obtiene la siguiente posición disponible para una planta
 */
async function getNextPlantPosition(userId: string): Promise<number> {
  // En producción:
  // const count = await prisma.plant.count({ where: { userId } });
  // return count;

  // Demo:
  return 0;
}
