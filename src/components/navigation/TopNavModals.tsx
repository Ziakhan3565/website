import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Instagram,
  Youtube,
  SendHorizontal,
  Mail,
  KeyRound,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen,
  MessageCircle,
  Share2,
  Globe
} from 'lucide-react';
import type { SocialChannel } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface TopNavModalsProps {
  activeModal: 'channel' | 'service' | 'about' | 'feedback' | null;
  onClose: () => void;
}

export const TopNavModals: React.FC<TopNavModalsProps> = ({ activeModal, onClose }) => {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Course Content');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (activeModal === 'channel') {
      setChannelsLoading(true);
      api.getChannels()
        .then(res => {
          if (res.channels) setChannels(res.channels.filter(c => c.active));
        })
        .catch(err => console.error('Failed to load channels', err))
        .finally(() => setChannelsLoading(false));
    }
  }, [activeModal]);

  // Service form
  const [serviceEmail, setServiceEmail] = useState('');
  const [servicePin, setServicePin] = useState('');
  const [serviceMessage, setServiceMessage] = useState('');
  const [serviceSubmitted, setServiceSubmitted] = useState(false);

  if (!activeModal) return null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      onClose();
    }, 2000);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServiceSubmitted(true);
    setTimeout(() => {
      setServiceSubmitted(false);
      setServiceMessage('');
      setServicePin('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#11121a] border border-[#232536] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-[#1a1b26] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL 1: CHANNEL (Instagram, YouTube, Telegram) */}
        {activeModal === 'channel' && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                Official Channels
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                Join Our Communities
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Connect with our trading mentors, market updates, and official media feeds.
              </p>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {channelsLoading && (
                <div className="p-4 text-center text-xs font-mono text-neutral-400">
                  Loading official channels...
                </div>
              )}

              {!channelsLoading && channels.length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-[#171825] border border-[#27293d] text-neutral-400 text-xs">
                  No channels configured yet. Admin can add official channels from the Admin Panel.
                </div>
              )}

              {channels.map((chan) => {
                let IconComponent = Globe;
                let colorClass = 'text-purple-400 bg-purple-500/15 border-purple-500/30 group-hover:border-purple-500/50';

                if (chan.platform === 'youtube') {
                  IconComponent = Youtube;
                  colorClass = 'text-rose-400 bg-rose-500/15 border-rose-500/30 group-hover:border-rose-500/50';
                } else if (chan.platform === 'telegram') {
                  IconComponent = SendHorizontal;
                  colorClass = 'text-sky-400 bg-sky-500/15 border-sky-500/30 group-hover:border-sky-500/50';
                } else if (chan.platform === 'instagram') {
                  IconComponent = Instagram;
                  colorClass = 'text-pink-400 bg-pink-500/15 border-pink-500/30 group-hover:border-pink-500/50';
                } else if (chan.platform === 'whatsapp') {
                  IconComponent = MessageCircle;
                  colorClass = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30 group-hover:border-emerald-500/50';
                } else if (chan.platform === 'discord') {
                  IconComponent = MessageSquare;
                  colorClass = 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30 group-hover:border-indigo-500/50';
                } else if (chan.platform === 'twitter') {
                  IconComponent = Share2;
                  colorClass = 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30 group-hover:border-cyan-500/50';
                }

                return (
                  <a
                    key={chan.id}
                    href={chan.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-[#171825] border border-[#27293d] hover:border-neutral-500 flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white group-hover:text-purple-300">
                            {chan.title}
                          </h4>
                          {chan.subscribers && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-black/40 text-neutral-400 border border-neutral-700/50">
                              {chan.subscribers}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono block">
                          {chan.handle || chan.url}
                        </span>
                        {chan.description && (
                          <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                            {chan.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0 ml-2" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL 2: SERVICE (@gmail.com, enter PIN/help) */}
        {activeModal === 'service' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                Student Help Desk
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                Student & Account Support
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Official contact for account activation, verification, and technical assistance.
              </p>
            </div>

            {serviceSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Support Request Received!</h4>
                <p className="text-xs text-emerald-200">
                  Our team will review your account inquiry and contact you at your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleServiceSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    Your Gmail / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="you@gmail.com"
                      value={serviceEmail}
                      onChange={(e) => setServiceEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    PIN / Account Verification Code (Optional)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 4-digit PIN or Transaction Ref"
                      value={servicePin}
                      onChange={(e) => setServicePin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    How can we assist you?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your question or issue with course access..."
                    value={serviceMessage}
                    onChange={(e) => setServiceMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 resize-none"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#161724] border border-[#25273b] text-[11px] text-neutral-400">
                  Direct Administrator Email: <strong className="text-white font-mono">admin@gmail.com</strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Request</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODAL 3: ABOUT (About our course) */}
        {activeModal === 'about' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                Platform Philosophy
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                About Course Crash
              </h3>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed bg-[#151624] p-4 rounded-2xl border border-[#24263a]">
              <p>
                <strong className="text-white">Course Crash</strong> is a dedicated quantitative education portal engineered to demystify financial markets and cryptocurrency trading.
              </p>
              <p>
                Our curriculum bridges the gap between retail speculation and institutional mechanics. From spot order execution and risk-to-reward discipline to advanced order flow (CVD) and perpetual futures liquidation clustering, we equip students with repeatable, probabilistic frameworks.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-[#1b1c2e] border border-[#2b2d45]">
                  <span className="text-purple-400 font-bold block">10 Foundation Modules</span>
                  <span className="text-neutral-400">Beginner Track</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1b1c2e] border border-[#2b2d45]">
                  <span className="text-purple-400 font-bold block">Live Desk & Signals</span>
                  <span className="text-neutral-400">Advanced VIP Pass</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-500/40 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* MODAL 4: FEEDBACK (Feedback about course & what should be developed) */}
        {activeModal === 'feedback' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                Community Feedback
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-2">
                Feedback About Course
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Tell us your thoughts and what features or lessons should be developed next.
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Thank You for Your Feedback!</h4>
                <p className="text-xs text-emerald-200">
                  Your feedback has been recorded. Our development team will review it for upcoming curriculum releases.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Course Content">Course Content / Lessons</option>
                    <option value="Trading Signals">Trading Signals & Accuracy</option>
                    <option value="Platform Feature">Feature Request / What to Develop</option>
                    <option value="Live Desk">Live Streaming Experience</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-300 block mb-1">
                    What should be developed or improved?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share what new topics, features, or tools you'd like to see developed..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#171826] border border-[#27293d] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Course Feedback</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
