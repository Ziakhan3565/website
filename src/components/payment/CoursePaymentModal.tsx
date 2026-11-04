import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Zap,
  CreditCard,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building,
  Smartphone,
  Upload,
  PlayCircle,
  HelpCircle,
  Info,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  CheckSquare,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { CoursePricingConfig, PaymentGatewayInfo } from '../../types/index.ts';
import { PaymentTutorialModal } from './PaymentTutorialModal.tsx';

interface CoursePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'beginner' | 'advanced';
  onSuccess?: () => void;
}

export const CoursePaymentModal: React.FC<CoursePaymentModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'beginner',
  onSuccess,
}) => {
  const { user, checkoutCourse, hasBeginnerAccess, hasAdvancedAccess, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'beginner' | 'advanced'>(initialPlan);
  const [paymentMode, setPaymentMode] = useState<'card' | 'crypto_local'>('card');
  const [localMethod, setLocalMethod] = useState<'crypto' | 'easypaisa' | 'jazzcash' | 'bank' | 'upi'>('crypto');

  // Video Tutorial Modal State
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialMethod, setTutorialMethod] = useState<'card' | 'crypto' | 'local'>('card');

  // Gateway Info & Config
  const [gatewayInfo, setGatewayInfo] = useState<PaymentGatewayInfo | null>(null);

  // Dynamic pricing config loaded from server
  const [pricing, setPricing] = useState<CoursePricingConfig>({
    beginnerPrice: 2,
    advancedPrice: 5,
    currency: 'USD',
    usdtTrc20Address: 'TQ3aXm9yKLZpTRC20LearnAndGrowDesk99',
    usdtBep20Address: '0x71C...b48LearnAndGrowOfficialWallet',
    easypaisaTitle: 'Learn and Grow Official Desk',
    easypaisaNumber: '0300-8492019',
    jazzcashTitle: 'Learn and Grow Official Desk',
    jazzcashNumber: '0301-7291048',
    bankName: 'Meezan Bank Ltd / Standard Chartered',
    bankAccountTitle: 'Learn and Grow Trading Academy',
    bankIban: 'PK36MEZN0001092847291048',
    upiId: 'learnandgrow@okaxis',
    whatsappSupport: '+923008492019',
    paymentNotice: 'Send the exact fee amount set by admin. Enter your transaction reference or receipt to activate your account.',
    autoApproveInstant: true,
  });

  // Credit Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');

  // Sandbox Session State
  const [activeSandboxSession, setActiveSandboxSession] = useState<{
    orderId: string;
    sessionId: string;
    orderRef: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Local / Crypto Form States
  const [transactionRef, setTransactionRef] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if current user is already enrolled in the selected course
  const isAlreadyEnrolled =
    (selectedPlan === 'beginner' && hasBeginnerAccess) ||
    (selectedPlan === 'advanced' && hasAdvancedAccess);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(initialPlan);
      setSuccessMessage(null);
      setErrorMessage(null);
      setProcessingStage('');
      setActiveSandboxSession(null);

      // Load pricing
      api.getPricing()
        .then((res) => {
          if (res.pricing) setPricing(res.pricing);
        })
        .catch(() => {});

      // Load gateway config
      api.getPaymentGatewayInfo()
        .then((res) => {
          if (res.gateway) setGatewayInfo(res.gateway);
        })
        .catch(() => {});
    }
  }, [isOpen, initialPlan]);

  const openTutorialForCurrentMethod = (methodOverride?: 'card' | 'crypto' | 'local') => {
    if (methodOverride) {
      setTutorialMethod(methodOverride);
    } else if (paymentMode === 'card') {
      setTutorialMethod('card');
    } else if (localMethod === 'crypto') {
      setTutorialMethod('crypto');
    } else {
      setTutorialMethod('local');
    }
    setTutorialOpen(true);
  };

  if (!isOpen) return null;

  const currentPrice = selectedPlan === 'beginner' ? pricing.beginnerPrice : pricing.advancedPrice;
  const userEmail = user?.email || 'student@coursecrash.io';

  // Format Card Number input with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    setErrorMessage(null);
  };

  // Format Card Expiry MM/YY
  const handleCardExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
    setErrorMessage(null);
  };

  // Format CVV / PIN
  const handleCardCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
    setErrorMessage(null);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to pre-populate standard test cards for sandbox validation
  const fillTestCard = (type: 'success' | 'declined' | 'funds') => {
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvv('923');
      setCardHolder(user?.name || 'Authorized Student');
    } else if (type === 'declined') {
      setCardNumber('4000 0000 0000 0002');
      setCardExpiry('10/27');
      setCardCvv('411');
      setCardHolder('Cardholder Declined Test');
    } else {
      setCardNumber('4000 0000 0000 0069');
      setCardExpiry('08/29');
      setCardCvv('789');
      setCardHolder('Cardholder Insufficient Funds');
    }
    setErrorMessage(null);
  };

  // Initiate Stripe or Sandbox Checkout Session
  const handleInitiateCardCheckout = async () => {
    if (isAlreadyEnrolled) {
      setErrorMessage(`You already have active access to this course! Duplicate enrollment prevented.`);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    setProcessingStage('Creating secure server checkout session...');

    try {
      const session = await api.createCheckoutSession({
        courseType: selectedPlan,
      });

      // If live or test Stripe hosted checkout URL is returned, redirect securely
      if (session.sessionUrl && !session.isSandbox) {
        setProcessingStage('Redirecting to Stripe PCI-compliant checkout page...');
        window.location.href = session.sessionUrl;
        return;
      }

      // If in Developer Sandbox mode, mount interactive test gateway
      setActiveSandboxSession({
        orderId: session.orderId,
        sessionId: session.sessionId,
        orderRef: session.orderRef,
        amount: session.amount,
        currency: session.currency,
      });

      // Pre-fill valid test card for convenient one-click testing
      fillTestCard('success');
      setProcessingStage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create payment session. Please try again.');
      setProcessingStage('');
    } finally {
      setLoading(false);
    }
  };

  // Execute Sandbox Test Payment with server verification
  const handleExecuteSandboxPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSandboxSession) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      setProcessingStage('Sending card token to secure server gateway for verification...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStage(`Verifying test payment of $${activeSandboxSession.amount} ${activeSandboxSession.currency}...`);

      const res = await api.processSandboxCheckout({
        orderId: activeSandboxSession.orderId,
        cardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
        cardHolder: cardHolder || user?.name || 'Test Student',
      });

      await refreshUser();
      setProcessingStage('');
      setSuccessMessage(res.message);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setProcessingStage('');
      setErrorMessage(err.message || 'Payment verification refused by gateway.');
    } finally {
      setLoading(false);
    }
  };

  // Manual / Alternative Gateway Checkout (Easypaisa, Jazzcash, Meezan Bank IBAN, USDT)
  const handleLocalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAlreadyEnrolled) {
      setErrorMessage(`You already have active access to this course! Duplicate enrollment prevented.`);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await checkoutCourse({
        courseType: selectedPlan,
        paymentMethod: localMethod,
        transactionReference: transactionRef || `REF_${Date.now()}`,
        senderAccount: senderAccount || undefined,
        receiptUrl: receiptUrl || undefined,
        instantApprove: pricing.autoApproveInstant,
      });

      await refreshUser();

      if (res.status === 'approved' || pricing.autoApproveInstant) {
        setSuccessMessage('Payment Verified! Course access is now active on your account.');
      } else {
        setSuccessMessage('Payment details submitted! Learn and Grow Desk will verify your reference and activate your account.');
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <div className="relative w-full max-w-[96vw] sm:max-w-lg md:max-w-2xl max-h-[94vh] sm:max-h-[90vh] bg-white border border-purple-200 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto text-slate-900">
          
          {/* Header - Fixed & Compact */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/70 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                  <span>Secure Course Checkout</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                  {gatewayInfo?.isStripeConfigured ? 'Stripe 256-bit Encrypted' : 'Instant Verified Access'} · Learn and Grow Academy
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-900">
            {/* 1. Track Selector Pills (Compact Beginner vs Advanced) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                  Select Course Track:
                </label>
                <button
                  type="button"
                  onClick={() => openTutorialForCurrentMethod()}
                  className="text-[11px] text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Video Tutorial</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('beginner');
                    setActiveSandboxSession(null);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'beginner'
                      ? 'bg-purple-50/90 border-purple-500 ring-1 ring-purple-400 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Beginner Course</span>
                    <span className="text-xs font-mono font-black text-purple-700">${pricing.beginnerPrice} USD</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Foundations & Risk</span>
                  {hasBeginnerAccess && (
                    <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      ✓ Active Access
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('advanced');
                    setActiveSandboxSession(null);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlan === 'advanced'
                      ? 'bg-purple-50/90 border-purple-500 ring-1 ring-purple-400 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Advanced VIP</span>
                    <span className="text-xs font-mono font-black text-purple-700">${pricing.advancedPrice} USD</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Live Desk & Signals</span>
                  {hasAdvancedAccess && (
                    <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      ✓ Active Access
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Anti-Duplicate Warning if already enrolled */}
            {isAlreadyEnrolled ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Course Already Unlocked!</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  Your account already has full, permanent access to the {selectedPlan === 'beginner' ? 'Beginner Academy' : 'Advanced VIP Masterclass'}. You cannot be charged again for the same course.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Go to My Lessons
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 2. Method Switcher Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('card');
                      setActiveSandboxSession(null);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-center text-xs transition-all cursor-pointer ${
                      paymentMode === 'card'
                        ? 'bg-white text-purple-700 shadow-xs font-extrabold ring-1 ring-purple-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💳 Debit / Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('crypto_local');
                      setActiveSandboxSession(null);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-center text-xs transition-all cursor-pointer ${
                      paymentMode === 'crypto_local'
                        ? 'bg-white text-purple-700 shadow-xs font-extrabold ring-1 ring-purple-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Easypaisa / JazzCash / IBAN / USDT
                  </button>
                </div>

                {/* Subscription Details Box */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {selectedPlan === 'beginner' ? 'Beginner Trading Crash Course' : 'Advanced Quant VIP Access & Signals'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Student: <strong className="text-slate-700">{userEmail}</strong>
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl sm:text-2xl font-black text-purple-700 font-mono">
                      ${currentPrice}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 ml-0.5">USD</span>
                  </div>
                </div>

                {/* Alerts / Error feedback */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <strong className="block font-bold">Transaction Refused</strong>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}
                {processingStage && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono flex items-center gap-2 animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
                    <span>{processingStage}</span>
                  </div>
                )}

                {/* MODE 1: Debit & Credit Card Flow */}
                {paymentMode === 'card' && (
                  <div>
                    {!activeSandboxSession ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            <span>Global Card Checkout</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            Pay securely using any Visa, Mastercard, or Pakistani International Debit/Credit Card. Raw card numbers and CVV codes are never stored on our server.
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold">VISA</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold">Mastercard</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold">UnionPay</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-bold">Pakistani 3D-Secure</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleInitiateCardCheckout}
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                        >
                          {loading ? (
                            <span>Initializing Gateway...</span>
                          ) : (
                            <span>Proceed to Card Checkout (${currentPrice} USD)</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* Interactive Sandbox Test Gateway Screen */
                      <form onSubmit={handleExecuteSandboxPayment} className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-[11px]">
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            Test Mode (Order: {activeSandboxSession.orderRef})
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSandboxSession(null)}
                            className="text-[10px] text-purple-700 underline font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Preset Buttons for Easy Testing */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-slate-500 block font-bold">
                            Quick Fill Test Scenarios:
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => fillTestCard('success')}
                              className="p-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono transition-colors text-center cursor-pointer"
                            >
                              ✓ Success (4242)
                            </button>
                            <button
                              type="button"
                              onClick={() => fillTestCard('declined')}
                              className="p-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold font-mono transition-colors text-center cursor-pointer"
                            >
                              ✕ Declined
                            </button>
                            <button
                              type="button"
                              onClick={() => fillTestCard('funds')}
                              className="p-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold font-mono transition-colors text-center cursor-pointer"
                            >
                              ✕ Low Funds
                            </button>
                          </div>
                        </div>

                        {/* Card Input Frame */}
                        <div className="rounded-xl border border-slate-300 focus-within:border-purple-600 bg-white overflow-hidden transition-all shadow-xs">
                          {/* Row 1: Card Number */}
                          <div className="flex items-center px-3 py-2 border-b border-slate-200">
                            <CreditCard className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <input
                              type="text"
                              placeholder="Card number (4242...)"
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              maxLength={19}
                              className="w-full text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden"
                              required
                            />
                          </div>

                          {/* Row 2: Expiry & CVV */}
                          <div className="grid grid-cols-2 divide-x divide-slate-200">
                            <div className="px-3 py-1.5">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => handleCardExpiryChange(e.target.value)}
                                maxLength={5}
                                className="w-full text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden"
                                required
                              />
                            </div>

                            <div className="px-3 py-1.5 flex items-center">
                              <input
                                type="password"
                                placeholder="CVV"
                                value={cardCvv}
                                onChange={(e) => handleCardCvvChange(e.target.value)}
                                maxLength={4}
                                className="w-full text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden"
                                required
                              />
                              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                            </div>
                          </div>

                          {/* Row 3: Cardholder Name */}
                          <div className="px-3 py-1.5 border-t border-slate-200">
                            <input
                              type="text"
                              placeholder="Cardholder Name"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full text-xs font-sans text-slate-900 placeholder-slate-400 focus:outline-hidden"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                        >
                          {loading ? (
                            <span>Verifying Payment...</span>
                          ) : (
                            <span>Authorize & Pay ${currentPrice} USD</span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* MODE 2: Alternative Pakistani & Crypto Transfer Desk */}
                {paymentMode === 'crypto_local' && (
                  <form onSubmit={handleLocalCheckout} className="space-y-3">
                    {/* Method Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setLocalMethod('crypto')}
                        className={`p-2.5 sm:p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          localMethod === 'crypto'
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        💎 USDT Desk
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalMethod('easypaisa')}
                        className={`p-2.5 sm:p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          localMethod === 'easypaisa'
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        📱 EasyPaisa
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalMethod('jazzcash')}
                        className={`p-2.5 sm:p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          localMethod === 'jazzcash'
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ⚡ JazzCash
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalMethod('bank')}
                        className={`p-2.5 sm:p-2 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          localMethod === 'bank'
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🏛️ Meezan IBAN
                      </button>
                    </div>

                    {/* Method Details */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      {localMethod === 'crypto' && (
                        <div>
                          <span className="font-bold text-slate-900 block mb-1 text-xs">
                            USDT (TRC-20 Official Wallet):
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                            <code className="text-[11px] font-mono text-slate-800 flex-1 break-all select-all">
                              {pricing.usdtTrc20Address}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(pricing.usdtTrc20Address, 'trc20')}
                              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer self-end sm:self-auto shrink-0 transition-colors"
                            >
                              {copiedKey === 'trc20' ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                      {localMethod === 'easypaisa' && (
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">EasyPaisa Mobile Number:</span>
                              <span className="font-mono font-bold text-emerald-700 text-sm">{pricing.easypaisaNumber}</span>
                              <span className="text-slate-500 text-[11px] block mt-0.5">Title: <strong className="text-slate-700">{pricing.easypaisaTitle}</strong></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(pricing.easypaisaNumber, 'easypaisa')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold cursor-pointer self-end sm:self-auto shrink-0 transition-colors"
                            >
                              {copiedKey === 'easypaisa' ? '✓ Copied' : 'Copy Number'}
                            </button>
                          </div>
                        </div>
                      )}

                      {localMethod === 'jazzcash' && (
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">JazzCash Mobile Number:</span>
                              <span className="font-mono font-bold text-orange-700 text-sm">{pricing.jazzcashNumber}</span>
                              <span className="text-slate-500 text-[11px] block mt-0.5">Title: <strong className="text-slate-700">{pricing.jazzcashTitle}</strong></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(pricing.jazzcashNumber, 'jazzcash')}
                              className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold cursor-pointer self-end sm:self-auto shrink-0 transition-colors"
                            >
                              {copiedKey === 'jazzcash' ? '✓ Copied' : 'Copy Number'}
                            </button>
                          </div>
                        </div>
                      )}

                      {localMethod === 'bank' && (
                        <div className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">{pricing.bankName}:</span>
                              <span className="font-mono font-bold text-blue-700 text-xs sm:text-sm break-all">{pricing.bankIban}</span>
                              <span className="text-slate-500 text-[11px] block mt-0.5">Title: <strong className="text-slate-700">{pricing.bankAccountTitle}</strong></span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(pricing.bankIban, 'iban')}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer self-end sm:self-auto shrink-0 transition-colors"
                            >
                              {copiedKey === 'iban' ? '✓ Copied' : 'Copy IBAN'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transaction Reference Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-slate-700 block mb-1 font-bold">
                          Transaction Reference / TID (Required)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TID-892042 or TxHash"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-700 block mb-1 font-bold">
                          Sender Phone or Account Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0300... or Account Name"
                          value={senderAccount}
                          onChange={(e) => setSenderAccount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                        />
                      </div>
                    </div>

                    {/* Optional Receipt Screenshot Upload */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-700 block mb-1 font-bold">
                        Attach Receipt Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="w-full text-[10px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                      />
                      {receiptFileName && (
                        <span className="text-[10px] text-emerald-600 font-mono mt-0.5 block">
                          ✓ {receiptFileName} attached
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                    >
                      {loading ? (
                        <span>Submitting Verification...</span>
                      ) : (
                        <span>Submit Payment Proof (${currentPrice} USD)</span>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Footer - Fixed & Compact */}
          <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>256-bit Encrypted Backend Verification</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-Duplicate Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Tutorial Video Modal */}
      <PaymentTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        defaultMethod={tutorialMethod}
        courseTitle={selectedPlan === 'beginner' ? 'Beginner Crash Course' : 'Advanced Quant VIP Access'}
        coursePrice={currentPrice}
        onProceedToPay={(method) => {
          if (method === 'card') {
            setPaymentMode('card');
          } else if (method === 'crypto') {
            setPaymentMode('crypto_local');
            setLocalMethod('crypto');
          } else {
            setPaymentMode('crypto_local');
            setLocalMethod('easypaisa');
          }
        }}
      />
    </>
  );
};
