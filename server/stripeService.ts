import Stripe from 'stripe';
import crypto from 'node:crypto';
import { storage } from './storage.ts';
import type { PaymentGatewayInfo, PaymentTransaction } from '../src/types/index.ts';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Stripe instance if key is available
let stripeClient: Stripe | null = null;
if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith('pk_')) {
  try {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    });
    console.log('[Payment Gateway] Real Stripe client initialized in mode:', process.env.PAYMENT_MODE || 'test');
  } catch (err) {
    console.warn('[Payment Gateway] Failed to initialize Stripe client:', err);
  }
}

export function isStripeConfigured(): boolean {
  return !!stripeClient && !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_');
}

export function getGatewayInfo(): PaymentGatewayInfo {
  const isConfigured = isStripeConfigured();
  const envMode = process.env.PAYMENT_MODE === 'live' ? 'live' : 'test';

  return {
    provider: 'Stripe Global Banking Gateway',
    mode: isConfigured && envMode === 'live' ? 'live' : 'test',
    isStripeConfigured: isConfigured,
    publishableKey: isConfigured ? (STRIPE_PUBLISHABLE_KEY || null) : null,
    supportedMethods: [
      'Visa / Mastercard / UnionPay Debit & Credit Cards',
      'Pakistani Local Bank Transfers (IBAN)',
      'Easypaisa & JazzCash Direct Wallets',
      'USDT Crypto Desk (TRC-20 & BEP-20)'
    ],
    currency: 'USD'
  };
}

export interface CreateSessionParams {
  userId: string;
  userName: string;
  userEmail: string;
  courseType: 'beginner' | 'advanced';
  originUrl: string;
}

export async function createPaymentSession(params: CreateSessionParams) {
  const { userId, userName, userEmail, courseType, originUrl } = params;

  // 1. Check Anti-Duplicate Enrollment: Has student already bought this course?
  if (storage.isUserEnrolled(userId, courseType)) {
    throw new Error(`You already have active access to the ${courseType === 'beginner' ? 'Beginner Academy' : 'Advanced VIP Masterclass'}. Duplicate purchases are prevented.`);
  }

  // 2. Fetch Pricing
  const pricing = storage.getPricingConfig();
  const amount = courseType === 'beginner' ? pricing.beginnerPrice : pricing.advancedPrice;
  const currency = (pricing.currency || 'USD').toLowerCase();
  const courseTitle = courseType === 'beginner' ? 'Course Crash: Beginner Trading Academy' : 'Course Crash: Advanced VIP Institutional Masterclass';

  const orderRef = `ORD_${courseType.toUpperCase()}_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;

  // 3. Real Stripe Hosted Checkout Flow
  if (isStripeConfigured() && stripeClient) {
    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: courseTitle,
                description: `Official enrollment access for ${userEmail}. Lifetime curriculum updates, live session recordings & study materials.`,
                images: [
                  courseType === 'beginner'
                    ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80'
                ]
              },
              unit_amount: Math.round(amount * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
          userId,
          userEmail,
          courseType,
          orderRef,
        },
        success_url: `${originUrl}?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}&course=${courseType}`,
        cancel_url: `${originUrl}?payment=stripe_cancelled&course=${courseType}`,
      } as any);

      // Save initial pending order in storage
      const tx = storage.createTransaction({
        userId,
        userName,
        userEmail,
        courseType,
        amount,
        currency: currency.toUpperCase(),
        paymentMethod: 'stripe',
        gatewayType: 'stripe',
        stripeSessionId: session.id,
        transactionReference: orderRef,
        status: 'pending',
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url,
        isSandbox: false,
        orderId: tx.id,
        orderRef,
        amount,
        currency: currency.toUpperCase(),
        courseTitle
      };
    } catch (err: any) {
      console.error('[Stripe Session Error]', err);
      throw new Error(`Stripe gateway error: ${err.message || 'Failed to create checkout session'}`);
    }
  }

  // 4. Secure Sandbox / Developer Test Mode Flow
  // When STRIPE_SECRET_KEY is not yet populated or in demo sandbox testing
  const sandboxSessionId = `sandbox_sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const tx = storage.createTransaction({
    userId,
    userName,
    userEmail,
    courseType,
    amount,
    currency: currency.toUpperCase(),
    paymentMethod: 'card',
    gatewayType: 'sandbox',
    stripeSessionId: sandboxSessionId,
    transactionReference: orderRef,
    status: 'pending',
  });

  return {
    sessionId: sandboxSessionId,
    sessionUrl: null, // Client displays test terminal / embedded card component
    isSandbox: true,
    orderId: tx.id,
    orderRef,
    amount,
    currency: currency.toUpperCase(),
    courseTitle
  };
}

export async function verifyPaymentSession(sessionId: string, userId: string) {
  // 1. Look up transaction
  const tx = storage.findTransactionByStripeSession(sessionId);
  if (!tx) {
    throw new Error('Transaction session not found or expired');
  }

  // Verify ownership
  if (tx.userId !== userId) {
    throw new Error('Unauthorized transaction verification');
  }

  // Already verified?
  if (tx.status === 'approved') {
    const user = storage.findUserById(userId);
    const { passwordHash, salt, ...safeUser } = user || ({} as any);
    return {
      status: 'approved',
      transaction: tx,
      user: safeUser,
      message: 'Course access already verified and active.'
    };
  }

  // 2. If Real Stripe
  if (isStripeConfigured() && stripeClient && tx.gatewayType === 'stripe') {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    if (session.payment_status === 'paid') {
      const updated = storage.updateTransactionStatus(
        tx.id,
        'approved',
        `Verified via Stripe API (Payment Intent: ${(session.payment_intent as any)?.id || session.id})`
      );

      return {
        status: 'approved',
        transaction: updated.transaction,
        user: updated.user,
        message: 'Payment verified successfully! Course access is now active.'
      };
    } else {
      return {
        status: 'pending',
        transaction: tx,
        message: 'Payment is still being processed by your bank/gateway.'
      };
    }
  }

  // 3. If Sandbox / Test Session
  return {
    status: tx.status,
    transaction: tx,
    message: 'Payment is pending or awaiting verification.'
  };
}

export async function processSandboxTestPayment(params: {
  orderId: string;
  userId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}) {
  const { orderId, userId, cardNumber, cvv } = params;

  // 1. Validate Transaction
  const tx = storage.findTransactionById(orderId);
  if (!tx) {
    throw new Error('Order not found or has expired');
  }

  if (tx.userId !== userId) {
    throw new Error('Unauthorized order execution');
  }

  if (tx.status === 'approved') {
    throw new Error('This order has already been paid and activated.');
  }

  // Check duplicate enrollment once more
  if (storage.isUserEnrolled(userId, tx.courseType)) {
    storage.updateTransactionStatus(tx.id, 'cancelled', undefined, 'Student already has course unlocked');
    throw new Error(`You already have active access to this course.`);
  }

  // 2. Validate Test Card Rules
  const cleanCard = cardNumber.replace(/\D/g, '');
  const cleanCvv = cvv.replace(/\D/g, '');

  if (cleanCard.length < 15 || cleanCard.length > 16) {
    throw new Error('Please enter a valid 16-digit card number.');
  }

  if (cleanCvv.length < 3) {
    throw new Error('Invalid CVV code.');
  }

  // Simulated Test Failure Cases (industry standard Stripe test numbers)
  // e.g., 4000 0000 0000 0002 -> Declined
  if (cleanCard.endsWith('0002') || cleanCard.startsWith('400000000002')) {
    storage.updateTransactionStatus(tx.id, 'failed', undefined, 'Card was declined by issuing bank (Simulated test failure)');
    throw new Error('Your card was declined by the issuing bank. Please try another card.');
  }

  if (cleanCard.endsWith('0069') || cleanCard.startsWith('400000000069')) {
    storage.updateTransactionStatus(tx.id, 'failed', undefined, 'Insufficient funds on card (Simulated test failure)');
    throw new Error('Insufficient funds in the card account. Transaction refused.');
  }

  // Simulated Success (4242 4242 4242 4242 or valid test cards)
  const maskedCard = `•••• •••• •••• ${cleanCard.slice(-4)}`;
  storage.updateTransaction(tx.id, {
    senderAccount: maskedCard,
    transactionReference: `SANDBOX_TX_${Date.now()}_${cleanCard.slice(-4)}`,
  });

  const updated = storage.updateTransactionStatus(
    tx.id,
    'approved',
    `Verified in Sandbox Gateway Test (Card ending in ${cleanCard.slice(-4)})`
  );

  return {
    success: true,
    status: 'approved',
    transaction: updated.transaction,
    user: updated.user,
    message: `Payment of $${tx.amount} ${tx.currency} verified successfully! ${tx.courseType === 'beginner' ? 'Beginner Academy' : 'Advanced VIP Masterclass'} is now unlocked.`
  };
}

export async function handleStripeWebhookEvent(rawBody: Buffer, signatureHeader: string) {
  if (!isStripeConfigured() || !stripeClient) {
    throw new Error('Stripe is not configured on this server');
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('[Stripe Webhook] Warning: STRIPE_WEBHOOK_SECRET is not set. Webhooks cannot be cryptographically verified.');
  }

  let event: Stripe.Event;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripeClient.webhooks.constructEvent(rawBody, signatureHeader, STRIPE_WEBHOOK_SECRET);
    } else {
      // Fallback if no secret configured
      event = JSON.parse(rawBody.toString('utf-8')) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Verification Failed]`, err.message);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook Received] Type: ${event.type}, ID: ${event.id}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      const metadata = session.metadata || {};
      const courseType = metadata.courseType as 'beginner' | 'advanced';
      const userId = session.client_reference_id || metadata.userId;

      const tx = storage.findTransactionByStripeSession(sessionId);
      if (tx) {
        storage.updateTransactionStatus(
          tx.id,
          'approved',
          `Verified via Stripe Signed Webhook (${event.type})`
        );
        console.log(`[Stripe Webhook] Order ${tx.id} approved and course ${tx.courseType} unlocked for user ${tx.userId}`);
      } else if (userId && courseType) {
        // Create approved order if session wasn't already in storage
        const user = storage.findUserById(userId);
        if (user) {
          storage.createTransaction({
            userId,
            userName: user.name,
            userEmail: user.email,
            courseType,
            amount: (session.amount_total || 0) / 100,
            currency: (session.currency || 'USD').toUpperCase(),
            paymentMethod: 'stripe',
            gatewayType: 'stripe',
            stripeSessionId: sessionId,
            transactionReference: `ST_WH_${session.id.slice(-8)}`,
            status: 'approved'
          });
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tx = storage.findTransactionByStripeSession(session.id);
      if (tx && tx.status === 'pending') {
        storage.updateTransactionStatus(tx.id, 'cancelled', 'Checkout session expired without payment');
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const failureMessage = paymentIntent.last_payment_error?.message || 'Payment intent failed';
      console.warn(`[Stripe Webhook] Payment failed: ${failureMessage}`);
      break;
    }

    default:
      // Other events acknowledged
      break;
  }

  return { received: true };
}

export async function issueStripeRefund(params: {
  transactionId: string;
  reason?: string;
  amount?: number;
}) {
  const tx = storage.findTransactionById(params.transactionId);
  if (!tx) {
    throw new Error('Transaction not found');
  }

  if (tx.status !== 'approved') {
    throw new Error(`Cannot refund transaction with status "${tx.status}". Only approved transactions can be refunded.`);
  }

  let stripeRefundId: string | undefined;

  // If real Stripe is configured and transaction was processed via Stripe
  if (isStripeConfigured() && stripeClient && tx.gatewayType === 'stripe' && tx.stripeSessionId) {
    try {
      const session = await stripeClient.checkout.sessions.retrieve(tx.stripeSessionId);
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as any)?.id;

      if (paymentIntentId) {
        const refund = await stripeClient.refunds.create({
          payment_intent: paymentIntentId,
          amount: params.amount ? Math.round(params.amount * 100) : undefined,
          reason: 'requested_by_customer',
        });
        stripeRefundId = refund.id;
      }
    } catch (err: any) {
      console.error('[Stripe Refund Error]', err);
      throw new Error(`Stripe refund failed: ${err.message || 'Payment intent refund error'}`);
    }
  }

  // Execute database refund and revoke course access
  const result = storage.refundTransaction(tx.id, params.reason, params.amount);
  if (result.transaction && stripeRefundId) {
    result.transaction.refundId = stripeRefundId;
  }

  return {
    success: true,
    transaction: result.transaction,
    user: result.user,
    message: `Refund of $${result.transaction?.refundAmount || tx.amount} ${tx.currency} processed successfully. Course access has been revoked.`
  };
}
