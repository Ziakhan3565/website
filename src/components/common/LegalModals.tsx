import React from 'react';
import { X, ShieldAlert, FileText, Lock, RotateCcw, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'terms' | 'privacy' | 'risk' | 'refund' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0f1018] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212338] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {activeModal === 'terms' && <FileText className="w-5 h-5" />}
              {activeModal === 'privacy' && <Lock className="w-5 h-5" />}
              {activeModal === 'risk' && <ShieldAlert className="w-5 h-5" />}
              {activeModal === 'refund' && <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                Learn and Grow · Official Policy
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                {activeModal === 'terms' && 'Terms of Service & Student Honor Code'}
                {activeModal === 'privacy' && 'Privacy Policy & Student Data Protection'}
                {activeModal === 'risk' && 'General Financial & Cryptocurrency Risk Disclosure'}
                {activeModal === 'refund' && 'Course Access & Refund Policy'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#1a1c2a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-4">
          {activeModal === 'terms' && (
            <>
              <p>
                Welcome to <strong>Learn and Grow</strong> ("the Academy"). By accessing our trading modules, live sessions, or signal dispatches, you agree to comply with and be bound by the following Terms of Service.
              </p>
              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 1. Educational Use Only
                </h4>
                <p className="text-xs text-neutral-400">
                  All video lessons, technical charts, live streams, and signals provided by Lead Instructor Zia Khan and the Learn and Grow Trading Desk are strictly for educational and informational purposes. They do not constitute financial, investment, or legal advice.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 2. Account Security & Integrity
                </h4>
                <p className="text-xs text-neutral-400">
                  Enrolled students are responsible for maintaining the confidentiality of their credentials and service PIN. Sharing course access, downloading content without authorization, or redistributing signals publicly will result in immediate termination of academy access without refund.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> 3. Risk Acceptance
                </h4>
                <p className="text-xs text-neutral-400">
                  You acknowledge that financial trading involves substantial market risk. Any trades executed based on learning material are performed at your sole discretion and personal risk.
                </p>
              </div>
            </>
          )}

          {activeModal === 'privacy' && (
            <>
              <p>
                At <strong>Learn and Grow</strong>, we respect your privacy and are committed to safeguarding all student personal data, verification receipts, and platform activity.
              </p>
              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white">Data We Collect</h4>
                <p className="text-xs text-neutral-400">
                  We only collect your name, email address, optional contact handle, course completion status, and transaction references necessary to verify your academy enrollment.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white">No Third-Party Advertising</h4>
                <p className="text-xs text-neutral-400">
                  Your data is never sold, leased, or transferred to third-party advertisers. All payment verification details are processed securely and encrypted.
                </p>
              </div>
            </>
          )}

          {activeModal === 'risk' && (
            <>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm space-y-2">
                <strong className="font-bold block text-amber-300 uppercase tracking-wider font-mono">
                  High-Risk Financial Disclosure:
                </strong>
                <p className="leading-relaxed">
                  Trading cryptocurrencies, spot digital assets, perpetual futures, and leveraged derivatives carries a high level of risk and may not be suitable for all investors. High leverage can work against you as well as for you.
                </p>
              </div>
              <p>
                Before deciding to trade digital assets, you should carefully evaluate your investment objectives, level of experience, and risk tolerance. There is a possibility that you could sustain a loss of some or all of your initial investment. You should never invest money that you cannot afford to lose.
              </p>
              <p>
                Past performance of trading signals or curriculum examples is not indicative of future results. Learn and Grow mandates strict position sizing (never risking more than 1% to 2% per trade) and using disciplined stop-losses.
              </p>
            </>
          )}

          {activeModal === 'refund' && (
            <>
              <p>
                <strong>Learn and Grow</strong> is dedicated to delivering high-caliber trading curriculum and transparent service for every enrolled student.
              </p>
              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white">Refund Requests</h4>
                <p className="text-xs text-neutral-400">
                  If you encounter an accidental duplicate purchase or technical difficulty accessing the course, you may request a review through the Official Service Desk within 7 days of enrollment.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#141624] border border-[#24273c] space-y-2">
                <h4 className="font-bold text-white">Course Revocation</h4>
                <p className="text-xs text-neutral-400">
                  Upon approval and execution of a refund, course access and associated signal benefits are automatically updated and revoked in the academy database.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#212338]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
