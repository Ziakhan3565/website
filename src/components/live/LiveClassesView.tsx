import React, { useState, useEffect } from 'react';
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Video,
  Send,
  ThumbsUp,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Play,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { LiveClass, LiveChatMessage } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getEmbedUrl, isDirectVideo } from '../../utils/videoUtils.ts';

interface LiveClassesViewProps {
  liveClasses: LiveClass[];
  onOpenScheduleClass?: () => void;
  onRefreshClasses: () => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({
  liveClasses,
  onOpenScheduleClass,
  onRefreshClasses,
  onOpenPayment,
}) => {
  const { user, isAdmin, isPremium, hasAdvancedAccess } = useAuth();
  const canWatchLive = isAdmin || isPremium || hasAdvancedAccess;
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(
    liveClasses.find(c => c.status === 'live') ||
    liveClasses.find(c => c.status === 'upcoming') ||
    liveClasses[0] ||
    null
  );

  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'questions'>('all');
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Sync selectedClass if liveClasses update
  useEffect(() => {
    if (selectedClass) {
      const refreshed = liveClasses.find(c => c.id === selectedClass.id);
      if (refreshed) setSelectedClass(refreshed);
    } else if (liveClasses.length > 0) {
      setSelectedClass(
        liveClasses.find(c => c.status === 'live') ||
        liveClasses.find(c => c.status === 'upcoming') ||
        liveClasses[0]
      );
    }
  }, [liveClasses]);

  // Load chat messages for the selected class
  useEffect(() => {
    if (!selectedClass) return;
    const fetchChat = async () => {
      try {
        const res = await api.getClassChat(selectedClass.id);
        setChatMessages(res.messages);
      } catch (e) {
        console.error('Failed to load chat', e);
      }
    };
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [selectedClass?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !inputText.trim()) return;
    try {
      const res = await api.postChatMessage(selectedClass.id, inputText, isQuestion);
      setChatMessages(prev => [...prev, res.message]);
      setInputText('');
      setIsQuestion(false);
    } catch (e: any) {
      console.error('Failed to send message:', e.message);
    }
  };

  const handleUpvote = async (msgId: string) => {
    try {
      const res = await api.upvoteChatMessage(msgId);
      setChatMessages(prev => prev.map(m => m.id === msgId ? res.message : m));
    } catch (e) {
      console.error('Failed to upvote', e);
    }
  };

  const handleCheckInAttendance = async () => {
    if (!selectedClass || !user) return;
    setAttendanceLoading(true);
    try {
      const res = await api.attendClass(selectedClass.id);
      setSelectedClass(res.liveClass);
      onRefreshClasses();
    } catch (e) {
      console.error('Failed to record attendance', e);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const isAttended = Boolean(selectedClass && user?.attendedClasses.includes(selectedClass.id));

  // Group classes by status
  const liveNow = liveClasses.filter(c => c.status === 'live');
  const upcoming = liveClasses.filter(c => c.status === 'upcoming');
  const completed = liveClasses.filter(c => c.status === 'completed');

  const filteredChat = chatMessages.filter(m => chatFilter === 'all' || m.isQuestion);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Host Action */}
      <div className="rounded-2xl bg-[#171717] border border-[#2a2a2a] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono mb-2">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> LIVE TRADING FLOOR & WEBINARS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Trading Classes & Execution Desk
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Watch the Course Crash Trading Desk execute in real-time, ask questions during the New York open, analyze order flow anomalies, and review archived replays.
            </p>
          </div>

          {isAdmin && onOpenScheduleClass && (
            <button
              onClick={onOpenScheduleClass}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-950 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Start / Schedule Live Class
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Stream Player & Live Q&A Chat */}
      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Stream Player & Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black border border-[#2a2a2a] aspect-video relative shadow-2xl">
              {!canWatchLive ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#171717] relative z-20">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                    <Lock className="w-7 h-7 text-rose-400" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold mb-2">
                    <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> ADVANCED VIP EXCLUSIVE DESK
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white max-w-md">
                    Live Stream Desk Is Reserved For Advanced VIP Members
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-md leading-relaxed">
                    Live execution during the New York open, real-time chart scalps, and interactive Q&A are only visible to students who unlock the Advanced Tier.
                  </p>
                  <button
                    onClick={() => onOpenPayment?.('advanced')}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(16,163,127,0.35)] transition-all flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Unlock Advanced VIP ($79) to Watch Live <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : selectedClass.status === 'live' && selectedClass.streamUrl ? (
                isDirectVideo(selectedClass.streamUrl) ? (
                  <video
                    src={selectedClass.streamUrl}
                    controls
                    autoPlay
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(selectedClass.streamUrl)}
                    title={selectedClass.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              ) : selectedClass.status === 'completed' && selectedClass.replayUrl ? (
                isDirectVideo(selectedClass.replayUrl) ? (
                  <video
                    src={selectedClass.replayUrl}
                    controls
                    autoPlay
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(selectedClass.replayUrl)}
                    title={selectedClass.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#171717]">
                  <Radio className="w-12 h-12 text-rose-500/60 mb-3 animate-pulse" />
                  <h3 className="text-base font-bold text-white">
                    {selectedClass.status === 'upcoming' ? 'Scheduled Live Stream' : 'Live Broadcast Feed'}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md">
                    {selectedClass.status === 'upcoming'
                      ? `This session is scheduled for ${new Date(selectedClass.scheduledAt).toLocaleDateString()} at ${new Date(selectedClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                      : 'Join the video room using the link below.'}
                  </p>
                  {selectedClass.meetingLink && (
                    <a
                      href={selectedClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,163,127,0.3)] transition-colors"
                    >
                      <Video className="w-4 h-4" /> Open In {selectedClass.platform} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Status Overlay Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {selectedClass.status === 'live' ? (
                  <span className="px-2.5 py-1 rounded bg-rose-600/90 backdrop-blur-md text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE ON AIR
                  </span>
                ) : selectedClass.status === 'upcoming' ? (
                  <span className="px-2.5 py-1 rounded bg-[#06b6d4]/90 backdrop-blur-md text-white text-xs font-mono font-bold">
                    UPCOMING
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-[#212121]/90 backdrop-blur-md text-neutral-300 text-xs font-mono border border-[#333333]">
                    ARCHIVED REPLAY
                  </span>
                )}
                <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md text-neutral-300 text-[11px] font-mono border border-[#2a2a2a]">
                  {selectedClass.platform}
                </span>
              </div>
            </div>

            {/* Class Info Box */}
            <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedClass.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                    <span>Host: <strong className="text-neutral-200">{selectedClass.instructorName}</strong> ({selectedClass.instructorRole})</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#38bdf8]" /> {selectedClass.durationMinutes} minutes
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#10a37f]" /> {selectedClass.attendees.length} Attendees
                    </span>
                  </div>
                </div>

                {/* Attendance Check-in Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedClass.meetingLink && (
                    <a
                      href={selectedClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#2e2e2e]"
                    >
                      <Video className="w-3.5 h-3.5 text-[#38bdf8]" />
                      External Room <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  )}

                  <button
                    onClick={handleCheckInAttendance}
                    disabled={attendanceLoading || isAttended}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                      isAttended
                        ? 'bg-[#10a37f]/20 text-[#19c37d] border border-[#10a37f]/40'
                        : 'bg-[#10a37f] hover:bg-[#19c37d] text-white shadow-[0_0_15px_rgba(16,163,127,0.3)]'
                    }`}
                  >
                    {isAttended ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#10a37f]" /> Attended & Logged
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" /> Check In / Record Attendance
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-[#262626]">
                {selectedClass.description}
              </p>

              {selectedClass.notesDoc && (
                <div className="p-3 rounded-lg bg-[#212121] border border-[#2e2e2e] text-xs text-neutral-300">
                  <span className="font-semibold text-[#10a37f] font-mono uppercase text-[10px] block mb-0.5">
                    Live Session Briefing Note:
                  </span>
                  {selectedClass.notesDoc}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 span): Live Chat & Q&A Panel */}
          <div className="rounded-xl bg-[#171717] border border-[#2a2a2a] flex flex-col h-[580px] lg:h-auto overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#10a37f]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Trading Chat & Q&A
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#1c1c1c] p-0.5 rounded border border-[#2a2a2a] text-[10px]">
                <button
                  onClick={() => setChatFilter('all')}
                  className={`px-2 py-0.5 rounded ${chatFilter === 'all' ? 'bg-[#2a2a2a] text-white font-medium' : 'text-neutral-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setChatFilter('questions')}
                  className={`px-2 py-0.5 rounded ${chatFilter === 'questions' ? 'bg-[#10a37f] text-white font-medium' : 'text-neutral-400'}`}
                >
                  Q&A
                </button>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-sans">
              {filteredChat.map((msg) => {
                const isAdminMsg = msg.userRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-lg text-xs border ${
                      msg.isQuestion
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isAdminMsg
                        ? 'bg-[#10a37f]/10 border-[#10a37f]/30'
                        : 'bg-[#212121] border-[#2e2e2e]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="font-bold text-neutral-200">{msg.userName}</span>
                        {isAdminMsg && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                            STAFF
                          </span>
                        )}
                        {msg.isQuestion && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                            <HelpCircle className="w-2.5 h-2.5" /> QUESTION
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-neutral-200 leading-relaxed font-sans">{msg.text}</p>

                    <div className="mt-1.5 flex items-center justify-end">
                      <button
                        onClick={() => handleUpvote(msg.id)}
                        className="text-[10px] font-mono text-neutral-400 hover:text-[#10a37f] flex items-center gap-1 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" /> {msg.upvotes}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredChat.length === 0 && (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No messages yet. Ask a question or say hello!
                </div>
              )}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#262626] bg-[#141414] space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={user ? "Ask a question or comment..." : "Sign in to chat in live class"}
                  disabled={!user}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#212121] border border-[#2a2a2a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#10a37f] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !inputText.trim()}
                  className="p-2 rounded-lg bg-[#10a37f] hover:bg-[#19c37d] disabled:opacity-40 text-white transition-colors shadow-sm"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                    className="rounded bg-[#212121] border-[#2a2a2a] text-[#10a37f] focus:ring-0 w-3 h-3"
                  />
                  <span>Highlight as Question to Instructor</span>
                </label>
                <span className="text-[10px]">Real-time chat</span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#171717] rounded-xl border border-[#2a2a2a]">
          <Radio className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-neutral-200">No Live Classes Currently Scheduled</h4>
          <p className="text-xs text-neutral-400 mt-1">Check the schedule below or return during New York session open.</p>
        </div>
      )}

      {/* Class Schedule Grid: Live, Upcoming, Replays */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#10a37f]" /> Complete Live Schedule & Video Replays
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveClasses.map((item) => {
            const isSelected = selectedClass?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedClass(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#212121] border-[#10a37f] shadow-[0_0_15px_rgba(16,163,127,0.15)]'
                    : 'bg-[#171717] border-[#2a2a2a] hover:border-[#10a37f]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      item.status === 'live'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : item.status === 'upcoming'
                        ? 'bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/30'
                        : 'bg-[#212121] text-neutral-400'
                    }`}>
                      {item.status === 'live' ? '● Streaming Now' : item.status}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {item.platform}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-[#19c37d] transition-colors line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-[#10a37f] font-semibold">
                    {isSelected ? 'Currently Viewing' : 'Select Stream'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
