import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const RiskBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2.5 text-[11px] text-amber-200/90 font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">High Risk Warning: </span>
          Cryptocurrency trading and leveraged futures involve substantial financial risk of loss. Past performance does not guarantee future results.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-5 my-8 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
            Learn and Grow Risk Disclosure & Educational Notice
          </h4>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            All curriculum lessons, market data, and signals provided on <span className="text-amber-400 font-semibold font-serif">Learn and Grow</span> are published strictly for educational and training purposes. Cryptocurrency derivatives and perpetual contracts carry a high level of risk and may result in total capital loss. High leverage can work against you as well as for you. Never trade with capital you cannot afford to lose.
          </p>
          <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-neutral-500">
            <span className="flex items-center gap-1 text-[#10a37f]">
              <ShieldCheck className="w-3.5 h-3.5" /> Transparent Order Flow
            </span>
            <span>·</span>
            <span>Zero Fabricated Metrics</span>
            <span>·</span>
            <span>Official Binance API Grounded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
