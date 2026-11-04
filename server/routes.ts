import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { storage, verifyPassword } from './storage.ts';
import type { UserRole, MarketTicker } from '../src/types/index.ts';
import {
  getGatewayInfo,
  createPaymentSession,
  verifyPaymentSession,
  processSandboxTestPayment,
  handleStripeWebhookEvent,
  issueStripeRefund
} from './stripeService.ts';
import {
  getSupabase,
  syncUserToSupabase,
  syncPaymentToSupabase,
  syncSignalToSupabase,
  testSupabaseHealth,
  syncAllLocalDataToSupabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL
} from './supabase.ts';

export const apiRouter = Router();

function generateToken(userId: string, role: UserRole): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days session persistence in database
  storage.saveSession(token, userId, role, expiresAt);
  return token;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token) return next();

  // 1. Supabase JWT token verification
  if (token.split('.').length === 3) {
    try {
      const supabase = getSupabase();
      const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
      if (!error && sbUser) {
        const cleanEmail = (sbUser.email || '').trim().toLowerCase();
        const isAdmin = cleanEmail === 'learnandgrow8433@gmail.com';
        (req as any).userId = sbUser.id;
        (req as any).userRole = isAdmin ? 'admin' : 'student';
        (req as any).userEmail = cleanEmail;
        (req as any).token = token;

        // Ensure user is present in local cache for fast lookups
        const existing = storage.findUserById(sbUser.id) || storage.findUserByEmail(cleanEmail);
        if (!existing) {
          storage.createUserDirect({
            id: sbUser.id,
            email: cleanEmail,
            name: sbUser.user_metadata?.name || (isAdmin ? 'Learn and Grow' : cleanEmail.split('@')[0]),
            role: isAdmin ? 'admin' : 'student',
            tier: isAdmin ? 'premium' : 'free',
            hasBeginnerAccess: isAdmin,
            hasAdvancedAccess: isAdmin,
          });
        }
        return next();
      }
    } catch {
      // Continue to local session check
    }
  }

  // 2. Local session fallback
  const session = storage.findSession(token);
  if (session && session.expiresAt > Date.now()) {
    (req as any).userId = session.userId;
    (req as any).userRole = session.role;
    (req as any).token = token;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  const user = userId ? storage.findUserById(userId) : null;
  const userEmail = (req as any).userEmail || user?.email?.toLowerCase();
  const isAuthorizedAdmin = userEmail === 'learnandgrow8433@gmail.com';
  if (!userId || !isAuthorizedAdmin) {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  next();
}

// ================= AUTH ROUTES =================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

apiRouter.post('/auth/check-email', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email address is required' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      validFormat: false,
      exists: false,
      error: 'Invalid email address format. Please enter a valid Gmail / Email (e.g. user@gmail.com)'
    });
  }

  let existingUser: any = null;
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from('users').select('*').ilike('email', cleanEmail).maybeSingle();
    if (data) {
      existingUser = data;
    }
  } catch {
    // fallback to storage
  }

  if (!existingUser) {
    existingUser = storage.findUserByEmail(cleanEmail);
  }

  return res.json({
    validFormat: true,
    exists: !!existingUser,
    message: existingUser
      ? 'An account with this email already exists. You can sign in directly.'
      : 'Email is available for registration.'
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address format. Please enter a valid email (e.g. user@gmail.com)' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  const existing = storage.findUserByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'This email address already exists! Please sign in instead.' });
  }

  // If email matches admin's email, give admin role
  const isDefaultAdmin = cleanEmail === 'learnandgrow8433@gmail.com';
  const role = isDefaultAdmin ? 'admin' : 'student';
  const tier = isDefaultAdmin ? 'premium' : 'free';

  const user = storage.createUser({ email: cleanEmail, password, name: isDefaultAdmin ? 'Learn and Grow' : name, role, tier });
  const token = generateToken(user.id, user.role);

  // Synchronize to Supabase backend asynchronously
  syncUserToSupabase(user).catch(err => console.error('[Supabase Register Sync]', err));

  res.json({ user, token });
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const emailInput = req.body.email || req.body.identifier;
  const password = req.body.password;
  if (!emailInput || !password) {
    return res.status(400).json({ error: 'Email or username and password are required' });
  }
  const identifier = String(emailInput).trim();
  let cleanEmail = identifier.toLowerCase();
  if (cleanEmail === 'admin') {
    cleanEmail = 'learnandgrow8433@gmail.com';
  }

  const isAdminEmail = cleanEmail === 'learnandgrow8433@gmail.com';

  // Admin authentication strictly requires Supabase Auth password verification only
  if (isAdminEmail) {
    try {
      const supabase = getSupabase();
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!sbError && sbData?.user && sbData.session) {
        let user: any = storage.findUserById(sbData.user.id) || storage.findUserByEmail(cleanEmail);
        if (!user) {
          user = storage.createUserDirect({
            id: sbData.user.id,
            email: cleanEmail,
            name: sbData.user.user_metadata?.name || 'Learn and Grow',
            role: 'admin',
            tier: 'premium',
            hasBeginnerAccess: true,
            hasAdvancedAccess: true,
          });
        } else {
          user.role = 'admin';
          user.name = 'Learn and Grow';
          user.tier = 'premium';
          user.hasBeginnerAccess = true;
          user.hasAdvancedAccess = true;
        }
        const token = sbData.session.access_token || generateToken(user?.id || sbData.user.id, (user?.role as UserRole) || 'admin');
        const { passwordHash, salt, ...safeUser } = (user || {}) as any;
        return res.json({ user: safeUser, token });
      }

      return res.status(401).json({ error: 'Incorrect credentials. Administrator access requires verified Supabase Auth.' });
    } catch {
      return res.status(401).json({ error: 'Authentication failed. Please verify administrator credentials.' });
    }
  }

  // For regular student accounts, attempt Supabase Auth first
  try {
    const supabase = getSupabase();
    const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (!sbError && sbData?.user && sbData.session) {
      let user: any = storage.findUserById(sbData.user.id) || storage.findUserByEmail(cleanEmail);
      if (!user) {
        user = storage.createUserDirect({
          id: sbData.user.id,
          email: cleanEmail,
          name: sbData.user.user_metadata?.name || cleanEmail.split('@')[0],
          role: 'student',
          tier: 'free',
          hasBeginnerAccess: false,
          hasAdvancedAccess: false,
        });
      }
      const token = sbData.session.access_token || generateToken(user?.id || sbData.user.id, (user?.role as UserRole) || 'student');
      const { passwordHash, salt, ...safeUser } = (user || {}) as any;
      return res.json({ user: safeUser, token });
    }
  } catch {
    // Proceed to verify local storage credentials
  }

  // Local storage credentials for students only (strictly disallowed for admin accounts)
  const user = storage.findUserByEmail(cleanEmail);
  if (!user || user.role === 'admin') {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const valid = verifyPassword(password, user.passwordHash, user.salt);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash, salt, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = storage.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, salt, ...safeUser } = user;
  res.json({ user: safeUser });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const token = (req as any).token;
  if (token) {
    storage.deleteSession(token);
  }
  res.json({ success: true, message: 'Session logged out and cleared.' });
});

// Forgot Password & Reset
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = storage.findUserByEmail(email);
  if (!user) {
    return res.json({ message: 'If that email exists, password reset instructions have been generated.', resetToken: null });
  }
  const token = crypto.randomBytes(16).toString('hex');
  resetTokens.set(token, { email: user.email, expiresAt: Date.now() + 60 * 60 * 1000 });
  res.json({
    message: 'Reset instructions generated successfully.',
    resetToken: token,
    demoHelp: `Demo token: ${token}`
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }
  const record = resetTokens.get(resetToken);
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }
  const user = storage.findUserByEmail(record.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  storage.setUserPassword(user.id, newPassword);
  resetTokens.delete(resetToken);
  res.json({ message: 'Password has been updated successfully. Please log in.' });
});

apiRouter.post('/auth/sync-password', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid password of at least 6 characters is required' });
  }
  const user = storage.findUserById(userId);
  if (user) {
    storage.setUserPassword(user.id, newPassword);
  }
  res.json({ success: true, message: 'Password synchronized.' });
});

// User updates (progress, bookmarks)
apiRouter.post('/user/progress', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { lessonId, completed } = req.body;
  const user = storage.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let completedLessons = [...user.completedLessons];
  if (completed) {
    if (!completedLessons.includes(lessonId)) completedLessons.push(lessonId);
  } else {
    completedLessons = completedLessons.filter(id => id !== lessonId);
  }

  const updated = storage.updateUser(userId, { completedLessons });
  res.json({ user: updated });
});

apiRouter.post('/user/saved-signals', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { signalId } = req.body;
  const user = storage.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let savedSignals = [...user.savedSignals];
  if (savedSignals.includes(signalId)) {
    savedSignals = savedSignals.filter(id => id !== signalId);
  } else {
    savedSignals.push(signalId);
  }

  const updated = storage.updateUser(userId, { savedSignals });
  res.json({ user: updated });
});

apiRouter.post('/user/tier', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { tier } = req.body;
  if (tier !== 'free' && tier !== 'premium') {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  const updated = storage.updateUser(userId, { tier });
  res.json({ user: updated });
});

apiRouter.put('/user/profile', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { name, avatarUrl } = req.body;
  const updates: Record<string, any> = {};
  if (typeof name === 'string' && name.trim()) {
    updates.name = name.trim();
  }
  if (avatarUrl !== undefined) {
    updates.avatarUrl = avatarUrl;
  }
  const updated = storage.updateUser(userId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Synchronize profile changes to Supabase
  syncUserToSupabase(updated).catch(err => console.error('[Supabase Profile Sync]', err));

  res.json({ user: updated });
});

// ================= PRICING & PAYMENT ROUTES =================

apiRouter.get('/pricing', (_req: Request, res: Response) => {
  const config = storage.getPricingConfig();
  res.json({ pricing: config });
});

apiRouter.put('/admin/pricing', requireAdmin, (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.beginnerPrice !== undefined) updates.beginnerPrice = Number(updates.beginnerPrice);
  if (updates.advancedPrice !== undefined) updates.advancedPrice = Number(updates.advancedPrice);
  const updated = storage.updatePricingConfig(updates);
  res.json({ success: true, pricing: updated, message: 'Course pricing & payment methods updated successfully' });
});

// ================= PAYMENT GATEWAY & CHECKOUT ROUTES =================

apiRouter.get('/payments/gateway-info', (_req: Request, res: Response) => {
  const info = getGatewayInfo();
  res.json({ gateway: info });
});

apiRouter.post('/payments/create-session', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { courseType } = req.body;

    if (courseType !== 'beginner' && courseType !== 'advanced') {
      return res.status(400).json({ error: 'Invalid course type. Must be "beginner" or "advanced"' });
    }

    const user = storage.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Student account not found' });
    }

    // Determine host origin URL for redirect
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const originUrl = req.headers.origin || `${protocol}://${host}`;

    const sessionData = await createPaymentSession({
      userId,
      userName: user.name,
      userEmail: user.email,
      courseType,
      originUrl,
    });

    res.json({
      success: true,
      ...sessionData,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to initiate checkout session' });
  }
});

apiRouter.post('/payments/verify-session', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId parameter' });
    }

    const result = await verifyPaymentSession(sessionId, userId);
    res.json({
      success: result.status === 'approved',
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment verification failed' });
  }
});

apiRouter.post('/payments/sandbox-checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { orderId, cardNumber, expiry, cvv, cardHolder } = req.body;

    if (!orderId || !cardNumber || !cvv) {
      return res.status(400).json({ error: 'Missing required card verification fields' });
    }

    const result = await processSandboxTestPayment({
      orderId,
      userId,
      cardNumber,
      expiry,
      cvv,
      cardHolder: cardHolder || 'Test Student',
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Card payment processing failed' });
  }
});

apiRouter.post('/payments/webhook', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['stripe-signature'] as string) || '';
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));

    const result = await handleStripeWebhookEvent(rawBody, signature);
    res.json(result);
  } catch (err: any) {
    console.error('[Payment Webhook Error]', err.message);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/transactions', requireAdmin, (_req: Request, res: Response) => {
  const transactions = storage.getTransactions();
  res.json({ transactions });
});

apiRouter.put('/admin/transactions/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes, failureReason } = req.body;
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending' && status !== 'failed' && status !== 'cancelled') {
    return res.status(400).json({ error: 'Status must be approved, rejected, pending, failed, or cancelled' });
  }
  const result = storage.updateTransactionStatus(id, status, adminNotes, failureReason);
  if (!result.transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Sync updated transaction to Supabase
  syncPaymentToSupabase(result.transaction).catch(err => console.error('[Supabase Admin Tx Sync]', err));
  if (result.user) {
    syncUserToSupabase(result.user).catch(() => {});
  }

  res.json({
    success: true,
    transaction: result.transaction,
    user: result.user,
    message: status === 'approved'
      ? 'Payment approved! Course access has been activated for the student.'
      : 'Payment status updated.'
  });
});

apiRouter.post('/admin/payments/:id/refund', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;
    const result = await issueStripeRefund({
      transactionId: id,
      reason,
      amount: amount ? Number(amount) : undefined
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Refund processing failed' });
  }
});

apiRouter.get('/user/transactions', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = storage.findUserById(userId);
  const transactions = storage.getTransactions().filter(t => t.userId === userId);
  res.json({
    transactions,
    enrollments: user?.enrollments || []
  });
});

apiRouter.post('/user/payment/checkout', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { courseType, paymentMethod, transactionReference, senderAccount, receiptUrl } = req.body;
  if (courseType !== 'beginner' && courseType !== 'advanced') {
    return res.status(400).json({ error: 'Invalid course type. Must be "beginner" or "advanced"' });
  }

  // Anti-duplicate protection: prevent duplicate enrollment
  if (storage.isUserEnrolled(userId, courseType)) {
    return res.status(400).json({
      error: `You are already enrolled in the ${courseType === 'beginner' ? 'Beginner Academy' : 'Advanced VIP Masterclass'}. Duplicate purchases are prevented.`
    });
  }

  const user = storage.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const pricing = storage.getPricingConfig();
  const amount = courseType === 'beginner' ? pricing.beginnerPrice : pricing.advancedPrice;

  // Local transfers (Easypaisa, Jazzcash, Bank, Crypto) require admin verification or auto-approval
  const isInstant = pricing.autoApproveInstant && (paymentMethod === 'instant' || paymentMethod === 'bank');
  const status = isInstant ? 'approved' : 'pending';

  const tx = storage.createTransaction({
    userId,
    userName: user.name,
    userEmail: user.email,
    courseType,
    amount,
    currency: pricing.currency || 'USD',
    paymentMethod: paymentMethod || 'bank',
    gatewayType: (paymentMethod as any) || 'bank',
    transactionReference: transactionReference || `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    senderAccount: senderAccount || undefined,
    receiptUrl: receiptUrl || undefined,
    status
  });

  // Synchronize transaction and enrollment to Supabase backend table
  syncPaymentToSupabase(tx).catch(err => console.error('[Supabase Checkout Tx Sync]', err));

  // Get refreshed user record
  const updatedUser = storage.findUserById(userId);
  const { passwordHash, salt, ...safeUser } = updatedUser!;

  if (tx.status === 'approved') {
    syncUserToSupabase(safeUser).catch(() => {});
  }

  res.json({
    success: true,
    transaction: tx,
    status: tx.status,
    message: tx.status === 'approved'
      ? `Payment of $${amount} verified! ${courseType === 'beginner' ? 'Beginner Course Crash' : 'Advanced VIP Masterclass & Signals'} is now active!`
      : `Payment receipt submitted (Ref: ${tx.transactionReference}). Access will activate automatically as soon as verified by Learn and Grow Desk.`,
    user: safeUser
  });
});

// ================= LESSONS ROUTES =================

apiRouter.get('/lessons', (req: Request, res: Response) => {
  const level = req.query.level as string;
  let lessons = storage.getLessons();
  if (level) {
    lessons = lessons.filter(l => l.level === level);
  }
  res.json({ lessons });
});

apiRouter.get('/lessons/:id', (req: Request, res: Response) => {
  const lesson = storage.getLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson });
});

apiRouter.post('/admin/lessons', requireAdmin, (req: Request, res: Response) => {
  const lesson = storage.createLesson(req.body);
  res.status(201).json({ lesson });
});

apiRouter.put('/admin/lessons/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateLesson(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ lesson: updated });
});

apiRouter.delete('/admin/lessons/:id', requireAdmin, (req: Request, res: Response) => {
  const success = storage.deleteLesson(req.params.id);
  if (!success) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ success: true });
});

// ================= LIVE CLASSES ROUTES =================

apiRouter.get('/live-classes', (_req: Request, res: Response) => {
  const classes = storage.getLiveClasses();
  res.json({ liveClasses: classes });
});

apiRouter.get('/live-classes/:id', (req: Request, res: Response) => {
  const liveClass = storage.getLiveClassById(req.params.id);
  if (!liveClass) return res.status(404).json({ error: 'Live class not found' });
  res.json({ liveClass });
});

apiRouter.post('/live-classes/:id/attend', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const updated = storage.recordClassAttendance(req.params.id, userId);
  if (!updated) return res.status(404).json({ error: 'Class not found' });
  res.json({ liveClass: updated });
});

apiRouter.get('/live-classes/:id/chat', (req: Request, res: Response) => {
  const messages = storage.getChatMessages(req.params.id);
  res.json({ messages });
});

apiRouter.post('/live-classes/:id/chat', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = storage.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { text, isQuestion } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Message text required' });
  }

  const message = storage.addChatMessage({
    classId: req.params.id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    text: text.trim(),
    isQuestion: !!isQuestion,
  });

  res.status(201).json({ message });
});

apiRouter.post('/live-classes/chat/:msgId/upvote', (req: Request, res: Response) => {
  const updated = storage.upvoteChatMessage(req.params.msgId);
  if (!updated) return res.status(404).json({ error: 'Message not found' });
  res.json({ message: updated });
});

apiRouter.post('/admin/live-classes', requireAdmin, (req: Request, res: Response) => {
  const newClass = storage.createLiveClass(req.body);
  res.status(201).json({ liveClass: newClass });
});

apiRouter.put('/admin/live-classes/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateLiveClass(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Class not found' });
  res.json({ liveClass: updated });
});

apiRouter.delete('/admin/live-classes/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteLiveClass(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Class not found' });
  res.json({ success: true });
});

// ================= SPOT SIGNALS ROUTES =================

apiRouter.get('/signals/spot', (_req: Request, res: Response) => {
  const signals = storage.getSpotSignals();
  res.json({ signals });
});

apiRouter.post('/admin/signals/spot', requireAdmin, (req: Request, res: Response) => {
  const signal = storage.createSpotSignal(req.body);
  syncSignalToSupabase('spot', signal).catch(() => {});
  res.status(201).json({ signal });
});

apiRouter.put('/admin/signals/spot/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateSpotSignal(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Signal not found' });
  syncSignalToSupabase('spot', updated).catch(() => {});
  res.json({ signal: updated });
});

apiRouter.delete('/admin/signals/spot/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteSpotSignal(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Signal not found' });
  res.json({ success: true });
});

// ================= FUTURES SIGNALS ROUTES =================

apiRouter.get('/signals/futures', (_req: Request, res: Response) => {
  const signals = storage.getFuturesSignals();
  res.json({ signals });
});

apiRouter.post('/admin/signals/futures', requireAdmin, (req: Request, res: Response) => {
  const signal = storage.createFuturesSignal(req.body);
  syncSignalToSupabase('futures', signal).catch(() => {});
  res.status(201).json({ signal });
});

apiRouter.put('/admin/signals/futures/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateFuturesSignal(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Signal not found' });
  syncSignalToSupabase('futures', updated).catch(() => {});
  res.json({ signal: updated });
});

apiRouter.delete('/admin/signals/futures/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteFuturesSignal(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Signal not found' });
  res.json({ success: true });
});

// ================= MARKET ANALYSIS & MATERIALS =================

apiRouter.get('/reports', (_req: Request, res: Response) => {
  res.json({ reports: storage.getAnalysisReports() });
});

apiRouter.post('/admin/reports', requireAdmin, (req: Request, res: Response) => {
  const report = storage.createAnalysisReport(req.body);
  res.status(201).json({ report });
});

apiRouter.delete('/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteAnalysisReport(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Report not found' });
  res.json({ success: true });
});

apiRouter.get('/materials', (_req: Request, res: Response) => {
  res.json({ materials: storage.getMaterials() });
});

apiRouter.post('/admin/materials', requireAdmin, (req: Request, res: Response) => {
  const material = storage.createMaterial(req.body);
  res.status(201).json({ material });
});

apiRouter.delete('/admin/materials/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteMaterial(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Material not found' });
  res.json({ success: true });
});

apiRouter.get('/announcements', (_req: Request, res: Response) => {
  res.json({ announcements: storage.getAnnouncements() });
});

apiRouter.post('/admin/announcements', requireAdmin, (req: Request, res: Response) => {
  const announcement = storage.createAnnouncement(req.body);
  res.status(201).json({ announcement });
});

apiRouter.delete('/admin/announcements/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteAnnouncement(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Announcement not found' });
  res.json({ success: true });
});

// ================= OFFICIAL CHANNELS ROUTES =================

apiRouter.get('/channels', (_req: Request, res: Response) => {
  res.json({ channels: storage.getChannels() });
});

apiRouter.post('/admin/channels', requireAdmin, (req: Request, res: Response) => {
  const channel = storage.createChannel(req.body);
  res.status(201).json({ channel });
});

apiRouter.put('/admin/channels/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateChannel(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Channel not found' });
  res.json({ channel: updated });
});

apiRouter.delete('/admin/channels/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteChannel(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Channel not found' });
  res.json({ success: true });
});

// ================= EXCHANGE PARTNER REFERRALS ROUTES =================

apiRouter.get('/exchanges', (req: Request, res: Response) => {
  const all = storage.getExchangeReferrals();
  const isAdminUser = (req as any).userRole === 'admin';
  const exchanges = isAdminUser ? all : all.filter(e => e.active);
  res.json({ exchanges });
});

apiRouter.post('/exchanges/:id/click', (req: Request, res: Response) => {
  const result = storage.trackReferralClick(req.params.id);
  res.json(result);
});

apiRouter.post('/admin/exchanges', requireAdmin, (req: Request, res: Response) => {
  const { name, referralUrl, referralCode } = req.body;
  if (!name || !referralUrl) {
    return res.status(400).json({ error: 'Exchange name and referral URL are required' });
  }
  const exchange = storage.createExchangeReferral({
    name: req.body.name,
    exchangeKey: req.body.exchangeKey || 'other',
    referralUrl: req.body.referralUrl,
    referralCode: req.body.referralCode || '',
    bonusTag: req.body.bonusTag || '',
    description: req.body.description || '',
    badge: req.body.badge || '',
    active: req.body.active !== false
  });
  res.status(201).json({ exchange });
});

apiRouter.put('/admin/exchanges/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = storage.updateExchangeReferral(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Exchange referral not found' });
  res.json({ exchange: updated });
});

apiRouter.delete('/admin/exchanges/:id', requireAdmin, (req: Request, res: Response) => {
  const ok = storage.deleteExchangeReferral(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Exchange referral not found' });
  res.json({ success: true });
});

// ================= ADMIN USER MANAGEMENT =================

apiRouter.get('/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const users = storage.getUsers();
  res.json({ users });
});

apiRouter.put('/admin/users/:id/tier', requireAdmin, (req: Request, res: Response) => {
  const { tier } = req.body;
  const updated = storage.updateUser(req.params.id, { tier });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  syncUserToSupabase(updated).catch(() => {});
  res.json({ user: updated });
});

apiRouter.put('/admin/users/:id/role', requireAdmin, (req: Request, res: Response) => {
  const { role } = req.body;
  const updated = storage.updateUser(req.params.id, { role });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  syncUserToSupabase(updated).catch(() => {});
  res.json({ user: updated });
});

apiRouter.put('/admin/users/:id/access', requireAdmin, (req: Request, res: Response) => {
  const { hasBeginnerAccess, hasAdvancedAccess } = req.body;
  const updates: any = {};
  if (hasBeginnerAccess !== undefined) updates.hasBeginnerAccess = Boolean(hasBeginnerAccess);
  if (hasAdvancedAccess !== undefined) {
    updates.hasAdvancedAccess = Boolean(hasAdvancedAccess);
    if (updates.hasAdvancedAccess) {
      updates.tier = 'premium';
    }
  }
  const updated = storage.updateUser(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  syncUserToSupabase(updated).catch(() => {});
  res.json({ success: true, user: updated });
});

// ================= LIVE MARKET DATA PROXY =================
// Fetches real live cryptocurrency market data from the official Binance API.
// Never fabricates prices. Caches last known real values and alerts if connection drops.

const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'SUIUSDT',
  'NEARUSDT', 'RENDERUSDT', 'PEPEUSDT', 'ARBUSDT', 'OPUSDT'
];

let cachedTickers: MarketTicker[] = [];
let lastFetchTimestamp: string | null = null;
let lastFetchError: string | null = null;

async function fetchRealMarketData(): Promise<{ tickers: MarketTicker[]; stale: boolean; error: string | null }> {
  try {
    const symbolParam = encodeURIComponent(JSON.stringify(TRACKED_SYMBOLS));
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolParam}`;
    
    // Also fetch futures funding rates for context
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const [spotRes, fundingRes] = await Promise.allSettled([
      fetch(binanceUrl, { signal: controller.signal }),
      fetch('https://fapi.binance.com/fapi/v1/fundingRate?limit=20', { signal: controller.signal })
    ]);
    clearTimeout(timeout);

    if (spotRes.status !== 'fulfilled' || !spotRes.value.ok) {
      throw new Error(spotRes.status === 'rejected' ? spotRes.reason?.message : `Binance HTTP ${spotRes.value.status}`);
    }

    const spotData = await spotRes.value.json();

    let fundingMap: Record<string, number> = {};
    if (fundingRes.status === 'fulfilled' && fundingRes.value.ok) {
      try {
        const fundingData = await fundingRes.value.json();
        if (Array.isArray(fundingData)) {
          for (const item of fundingData) {
            fundingMap[item.symbol] = parseFloat(item.fundingRate);
          }
        }
      } catch (err) {
        // funding rate is secondary
      }
    }

    const now = new Date().toISOString();
    const parsedTickers: MarketTicker[] = spotData.map((t: any) => {
      const baseAsset = t.symbol.replace('USDT', '');
      return {
        symbol: t.symbol,
        baseAsset,
        quoteAsset: 'USDT',
        lastPrice: parseFloat(t.lastPrice),
        priceChangePercent: parseFloat(t.priceChangePercent),
        highPrice: parseFloat(t.highPrice),
        lowPrice: parseFloat(t.lowPrice),
        volume: parseFloat(t.volume),
        quoteVolume: parseFloat(t.quoteVolume),
        fundingRate: fundingMap[t.symbol] !== undefined ? fundingMap[t.symbol] : undefined,
        updatedAt: now,
      };
    });

    cachedTickers = parsedTickers;
    lastFetchTimestamp = now;
    lastFetchError = null;

    return { tickers: parsedTickers, stale: false, error: null };
  } catch (error: any) {
    console.warn('Real Binance API fetch warning:', error?.message);
    lastFetchError = error?.message || 'Failed to connect to market data provider';
    return {
      tickers: cachedTickers,
      stale: true,
      error: lastFetchError,
    };
  }
}

// Initial fetch on boot
fetchRealMarketData().catch(() => {});

apiRouter.get('/market/overview', async (_req: Request, res: Response) => {
  const result = await fetchRealMarketData();
  res.json({
    tickers: result.tickers,
    stale: result.stale,
    error: result.error,
    lastUpdate: lastFetchTimestamp,
    provider: 'Binance Official Market API'
  });
});

// ================= SUPABASE STATUS & SYNC ROUTES =================
apiRouter.get('/supabase/status', async (_req: Request, res: Response) => {
  try {
    const health = await testSupabaseHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      error: err?.message
    });
  }
});

apiRouter.post('/supabase/sync-all', async (_req: Request, res: Response) => {
  try {
    const result = await syncAllLocalDataToSupabase(storage);
    res.json({
      success: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

