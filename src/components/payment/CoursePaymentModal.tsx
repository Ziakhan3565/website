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
    beginnerPrice: 10,
    advancedPrice: 24,
    currency: 'USD',
    usdtTrc20Address: 'TQ3aXm9yKLZpTRC20OfficialCourseCrashDesk99',
    usdtBep20Address: '0x71C...b48CourseCrashOfficialWallet',
    easypaisaTitle: 'Course Crash Official Desk',
    easypaisaNumber: '0300-8492019',
    jazzcashTitle: 'Course Crash Official Desk',
    jazzcashNumber: '0301-7291048',
    bankName: 'Meezan Bank Ltd / Standard Chartered',
    bankAccountTitle: 'Course Crash Digital Academy',
    bankIban: 'PK36MEZN0001092847291048',
    upiId: 'coursecrash@okaxis',
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
        setSuccessMessage('Payment details submitted! Zia Khan Desk will verify your reference and activate your account.');
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
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-[#0f1017] border border-[#232536] rounded-3xl shadow-2xl overflow-hidden my-6">
          {/* Top Breadcrumbs / Flow Indicator */}
          <div className="bg-[#141520] border-b border-[#232536] px-4 py-2.5 hidden sm:flex items-center justify-center gap-4 text-xs font-mono">
            <span className="text-neutral-500">Student Account</span>
            <span className="text-neutral-600">›</span>
            <span className="text-neutral-500">Course Selection</span>
            <span className="text-neutral-600">›</span>
            <span className="text-purple-400 font-bold bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              Secure Payment Checkout
            </span>
            <span className="text-neutral-600">›</span>
            <span className="text-neutral-500">Instant Access Unlock</span>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            {/* Left Column: Educational Platform Background Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#121320] via-[#0f1019] to-[#0a0a10] p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-[#232536] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                    SYSTEMATIC ACADEMY
                  </span>

                  {/* Gateway Status Badge */}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{gatewayInfo?.isStripeConfigured ? 'Stripe Gateway Live' : 'Test Sandbox Gateway'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Course Crash Digital Academy
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Master professional crypto quantitative strategy, SMC order flow, and institutional risk management with Zia Khan.
                  </p>
                </div>

                {/* Plan Selector Pills */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                    Choose Course Track:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan('beginner');
                        setActiveSandboxSession(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === 'beginner'
                          ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/50'
                          : 'bg-[#181926] border-[#292b3d] hover:border-[#383b54]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Beginner Course</span>
                        <span className="text-xs font-mono font-bold text-purple-400">${pricing.beginnerPrice}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Foundations & Risk</span>
                      {hasBeginnerAccess && (
                        <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          ✓ Already Owned
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan('advanced');
                        setActiveSandboxSession(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === 'advanced'
                          ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/50'
                          : 'bg-[#181926] border-[#292b3d] hover:border-[#383b54]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Advanced VIP</span>
                        <span className="text-xs font-mono font-bold text-purple-400">${pricing.advancedPrice}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">Live Desk & Signals</span>
                      {hasAdvancedAccess && (
                        <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          ✓ Already Owned
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Curriculum Bullet Checklist */}
                <div className="space-y-3 pt-3 border-t border-[#1f202f] text-xs">
                  <div>
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Complete Curriculum Access
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5 pl-5">
                      Lifetime access to all video lessons, future updates, and high-resolution chart models.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono text-purple-300">
                      <Zap className="w-3.5 h-3.5 text-purple-400" /> Verified Server Unlocking
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5 pl-5">
                      Zero mock success. Orders are verified server-side with anti-duplicate guarantees.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono text-purple-300">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Student Profile & Receipts
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5 pl-5">
                      Official transaction reference and verifiable proof of enrollment in your profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Tutorial CTA Button */}
              <div className="pt-4 border-t border-[#1f202f]">
                <button
                  type="button"
                  onClick={() => openTutorialForCurrentMethod()}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#1d1f30] hover:bg-[#25283f] text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-purple-400" />
                  <span>Payment Video Tutorial ({paymentMode === 'card' ? 'Debit/Credit Card' : localMethod === 'crypto' ? 'USDT' : 'Pakistani Desk'} Guide)</span>
                </button>
              </div>
            </div>

            {/* Right Column: Checkout Execution Console */}
            <div className="lg:col-span-7 bg-[#ffffff] text-[#111218] p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Modal Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                        Complete Checkout
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Secure payment processor · PCI-DSS Compliant
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Anti-Duplicate Warning if already enrolled */}
                {isAlreadyEnrolled ? (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
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
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono transition-colors"
                      >
                        Go to My Lessons
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Method Switcher */}
                    <div className="flex items-center justify-between mt-4 mb-4">
                      <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-full border border-neutral-200 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMode('card');
                            setActiveSandboxSession(null);
                          }}
                          className={`px-3 py-1 rounded-full font-bold transition-all ${
                            paymentMode === 'card'
                              ? 'bg-[#7c3aed] text-white shadow-sm'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          Debit / Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMode('crypto_local');
                            setActiveSandboxSession(null);
                          }}
                          className={`px-3 py-1 rounded-full font-bold transition-all ${
                            paymentMode === 'crypto_local'
                              ? 'bg-[#7c3aed] text-white shadow-sm'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          Easypaisa / JazzCash / Bank / USDT
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openTutorialForCurrentMethod()}
                        className="text-xs text-[#7c3aed] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Watch Tutorial</span>
                      </button>
                    </div>

                    {/* Subscription Details Box */}
                    <div className="p-4 rounded-2xl bg-[#f5f3ff] border border-[#e4dcff] flex items-center justify-between mb-5">
                      <div>
                        <span className="text-xs font-bold text-neutral-800 block">
                          {selectedPlan === 'beginner' ? 'Beginner Trading Crash Course' : 'Advanced Quant VIP Access & Signals'}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          Student: <strong className="text-neutral-800">{userEmail}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-[#7c3aed] font-mono">
                          ${currentPrice}
                        </span>
                        <span className="text-xs font-bold text-neutral-500 ml-0.5">USD</span>
                      </div>
                    </div>

                    {/* Alerts / Error feedback */}
                    {errorMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                        <div>
                          <strong className="block font-bold">Transaction Refused</strong>
                          <span>{errorMessage}</span>
                        </div>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                      </div>
                    )}
                    {processingStage && (
                      <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono flex items-center gap-2 animate-pulse">
                        <span className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
                        <span>{processingStage}</span>
                      </div>
                    )}

                    {/* MODE 1: Debit & Credit Card Flow */}
                    {paymentMode === 'card' && (
                      <div>
                        {!activeSandboxSession ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                              <div className="flex items-center gap-2 font-bold text-neutral-800 text-sm">
                                <CreditCard className="w-4 h-4 text-[#7c3aed]" />
                                <span>Global Card Checkout</span>
                              </div>
                              <p className="text-neutral-600 leading-relaxed">
                                Pay securely using any Visa, Mastercard, or Pakistani International Debit/Credit Card. Raw card numbers and CVV codes are never stored on our server.
                              </p>
                              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500">
                                <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded font-bold">VISA</span>
                                <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded font-bold">Mastercard</span>
                                <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded font-bold">UnionPay</span>
                                <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded font-bold">Pakistani 3D-Secure</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleInitiateCardCheckout}
                              disabled={loading}
                              className="w-full py-3.5 px-5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                            >
                              {loading ? (
                                <span>Initializing Gateway...</span>
                              ) : (
                                <span>Proceed to Card Checkout (${currentPrice})</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* Interactive Sandbox Test Gateway Screen */
                          <form onSubmit={handleExecuteSandboxPayment} className="space-y-4">
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-amber-600" />
                                Gateway Test Mode Active (Order: {activeSandboxSession.orderRef})
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveSandboxSession(null)}
                                className="text-[11px] text-amber-700 underline font-mono"
                              >
                                Cancel Order
                              </button>
                            </div>

                            {/* Preset Buttons for Easy Testing */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono uppercase text-neutral-500 block font-bold">
                                Quick Fill Sandbox Test Scenarios:
                              </label>
                              <div className="grid grid-cols-3 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => fillTestCard('success')}
                                  className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono transition-colors text-center"
                                >
                                  ✓ Standard Card (4242)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => fillTestCard('declined')}
                                  className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold font-mono transition-colors text-center"
                                >
                                  ✕ Declined Test (0002)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => fillTestCard('funds')}
                                  className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold font-mono transition-colors text-center"
                                >
                                  ✕ Insufficient Funds (0069)
                                </button>
                              </div>
                            </div>

                            {/* Card Input Frame */}
                            <div className="rounded-2xl border-2 border-neutral-300 focus-within:border-[#7c3aed] bg-white overflow-hidden transition-all shadow-sm">
                              {/* Row 1: Card Number */}
                              <div className="flex items-center px-3.5 py-2.5 border-b border-neutral-200">
                                <CreditCard className="w-5 h-5 text-neutral-400 mr-2.5 shrink-0" />
                                <input
                                  type="text"
                                  placeholder="Card number (4242...)"
                                  value={cardNumber}
                                  onChange={(e) => handleCardNumberChange(e.target.value)}
                                  maxLength={19}
                                  className="w-full text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none"
                                  required
                                />
                              </div>

                              {/* Row 2: Expiry & CVV */}
                              <div className="grid grid-cols-2 divide-x divide-neutral-200">
                                <div className="px-3.5 py-2">
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => handleCardExpiryChange(e.target.value)}
                                    maxLength={5}
                                    className="w-full text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none"
                                    required
                                  />
                                </div>

                                <div className="px-3.5 py-2 flex items-center">
                                  <input
                                    type="password"
                                    placeholder="CVV"
                                    value={cardCvv}
                                    onChange={(e) => handleCardCvvChange(e.target.value)}
                                    maxLength={4}
                                    className="w-full text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none"
                                    required
                                  />
                                  <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
                                </div>
                              </div>

                              {/* Row 3: Cardholder Name */}
                              <div className="px-3.5 py-2 border-t border-neutral-200">
                                <input
                                  type="text"
                                  placeholder="Cardholder Name"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  className="w-full text-xs font-sans text-neutral-900 placeholder-neutral-400 focus:outline-none"
                                  required
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-3.5 px-5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                            >
                              {loading ? (
                                <span>Verifying Card Payment...</span>
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
                      <form onSubmit={handleLocalCheckout} className="space-y-4">
                        {/* Method Selector */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLocalMethod('crypto')}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                              localMethod === 'crypto'
                                ? 'bg-purple-100 border-[#7c3aed] text-[#7c3aed]'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            USDT Desk
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalMethod('easypaisa')}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                              localMethod === 'easypaisa'
                                ? 'bg-purple-100 border-[#7c3aed] text-[#7c3aed]'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            EasyPaisa
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalMethod('jazzcash')}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                              localMethod === 'jazzcash'
                                ? 'bg-purple-100 border-[#7c3aed] text-[#7c3aed]'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            JazzCash
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalMethod('bank')}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                              localMethod === 'bank'
                                ? 'bg-purple-100 border-[#7c3aed] text-[#7c3aed]'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            Meezan IBAN
                          </button>
                        </div>

                        {/* Method Details */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                          {localMethod === 'crypto' && (
                            <div>
                              <span className="font-bold text-neutral-800 block mb-1">
                                USDT (TRC-20 Official Wallet):
                              </span>
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-neutral-200">
                                <code className="text-[11px] font-mono text-neutral-700 flex-1 truncate">
                                  {pricing.usdtTrc20Address}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(pricing.usdtTrc20Address, 'trc20')}
                                  className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer"
                                >
                                  {copiedKey === 'trc20' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          )}

                          {localMethod === 'easypaisa' && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-neutral-800">EasyPaisa Mobile Number:</span>
                                <span className="font-mono font-bold text-emerald-700">{pricing.easypaisaNumber}</span>
                              </div>
                              <span className="text-neutral-500 text-[11px] block">Title: {pricing.easypaisaTitle}</span>
                            </div>
                          )}

                          {localMethod === 'jazzcash' && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-neutral-800">JazzCash Mobile Number:</span>
                                <span className="font-mono font-bold text-orange-700">{pricing.jazzcashNumber}</span>
                              </div>
                              <span className="text-neutral-500 text-[11px] block">Title: {pricing.jazzcashTitle}</span>
                            </div>
                          )}

                          {localMethod === 'bank' && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-neutral-800">{pricing.bankName}:</span>
                                <span className="font-mono font-bold text-blue-700 text-[11px]">{pricing.bankIban}</span>
                              </div>
                              <span className="text-neutral-500 text-[11px] block">Title: {pricing.bankAccountTitle}</span>
                            </div>
                          )}
                        </div>

                        {/* Transaction Reference Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-mono text-neutral-600 block mb-1">
                              Transaction Reference / TID (Required)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. TID-892042 or TxHash"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#7c3aed]"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono text-neutral-600 block mb-1">
                              Sender Phone or Account Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 0300... or Account Title"
                              value={senderAccount}
                              onChange={(e) => setSenderAccount(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#7c3aed]"
                            />
                          </div>
                        </div>

                        {/* Optional Receipt Screenshot Upload */}
                        <div>
                          <label className="text-[11px] font-mono text-neutral-600 block mb-1">
                            Attach Receipt Screenshot (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleReceiptUpload}
                            className="w-full text-[10px] text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-neutral-200 file:text-neutral-800 hover:file:bg-neutral-300 cursor-pointer"
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
                          className="w-full py-3.5 px-5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
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

              {/* Bottom Footer */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-neutral-500 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
                  <span>256-bit Encrypted Backend Verification</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Anti-Duplicate Protected</span>
                </div>
              </div>
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
