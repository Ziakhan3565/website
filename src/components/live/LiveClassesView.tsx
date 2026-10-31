import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  Users,
  Video,
  Send,
  ThumbsUp,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Play,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Share2,
  Calendar
} from 'lucide-react';
import type { LiveClass, LiveChatMessage, ExchangeReferral } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { getEmbedUrl, isDirectVideo, getAutoThumbnail } from '../../utils/videoUtils.ts';
import { ExchangeReferralCards } from '../common/ExchangeReferralCards.tsx';

interface LiveClassesViewProps {
  liveClasses: LiveClass[];
  exchanges?: ExchangeReferral[];
  onOpenScheduleClass?: () => void;
  onRefreshClasses: () => void;
  onOpenPayment?: (plan: 'beginner' | 'advanced') => void;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({
  liveClasses,
  exchanges = [],
  onOpenScheduleClass,
  onRefreshClasses,
}) => {
  const { user, isAdmin } = useAuth();

  // Find active live class first, otherwise upcoming, otherwise first available
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(() => {
    return (
      liveClasses.find(c => c.status === 'live') ||
      liveClasses.find(c => c.status === 'upcoming') ||
      liveClasses[0] ||
      null
    );
  });

  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'questions'>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Admin Quick Edit Stream Link state
  const [isEditingStream, setIsEditingStream] = useState(false);
  const [editStreamUrl, setEditStreamUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [adminToggling, setAdminToggling] = useState(false);

  // Sync selectedClass if liveClasses update
  useEffect(() => {
    if (selectedClass) {
      const refreshed = liveClasses.find(c => c.id === selectedClass.id);
      if (refreshed) {
        setSelectedClass(refreshed);
      }
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
        setChatMessages(res.messages || []);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => clearInterval(interval);
  }, [selectedClass?.id]);

  // Auto record attendance for logged-in user when viewing live stream
  useEffect(() => {
    if (selectedClass && user && selectedClass.status === 'live') {
      if (!selectedClass.attendees.includes(user.id)) {
        api.attendClass(selectedClass.id).then(() => {
          onRefreshClasses();
        }).catch(() => {});
      }
    }
  }, [selectedClass?.id, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !inputText.trim()) return;
    try {
      const res = await api.postChatMessage(selectedClass.id, inputText.trim(), isQuestion);
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

  const handleAdminToggleLive = async () => {
    if (!selectedClass) return;
    setAdminToggling(true);
    const newStatus = selectedClass.status === 'live' ? 'completed' : 'live';
    try {
      await api.updateLiveClass(selectedClass.id, { status: newStatus });
      onRefreshClasses();
      setActionFeedback(
        newStatus === 'live'
          ? '🔴 Broadcast Started! Your live video is now streaming to all students.'
          : 'Live broadcast ended and archived for replay.'
      );
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (e: any) {
      setActionFeedback(e.message || 'Failed to update live stream status');
    } finally {
      setAdminToggling(false);
    }
  };

  const handleOpenEditStream = () => {
    if (!selectedClass) return;
    setEditTitle(selectedClass.title);
    setEditStreamUrl(selectedClass.streamUrl || selectedClass.replayUrl || '');
    setIsEditingStream(true);
  };

  const handleSaveStreamEdit = async () => {
    if (!selectedClass || !editStreamUrl.trim()) return;
    setIsSavingEdit(true);
    try {
      await api.updateLiveClass(selectedClass.id, {
        title: editTitle.trim() || selectedClass.title,
        streamUrl: editStreamUrl.trim(),
        replayUrl: editStreamUrl.trim(),
      });
      onRefreshClasses();
      setIsEditingStream(false);
      setActionFeedback('Stream URL updated successfully! Player is refreshed.');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback(e.message || 'Failed to update stream URL');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleShareStream = () => {
    navigator.clipboard?.writeText(window.location.href);
    setActionFeedback('Live stream link copied to clipboard!');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const isLiveNow = selectedClass?.status === 'live';
  const filteredChat = chatMessages.filter(m => chatFilter === 'all' || m.isQuestion);
  const activeVideoUrl = selectedClass?.streamUrl || selectedClass?.replayUrl || '';

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Header with Learn & Grow Brand */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#14120c] via-[#0e0f18] to-[#0a0b12] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isLiveNow ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>BROADCASTING LIVE NOW</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>LEARN AND GROW LIVE DESK</span>
              </span>
            )}
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              Host: <strong className="text-amber-300">Zia Khan</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Live Stream & Trading Room
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
            Watch real-time live market analysis, New York open executions, and direct student Q&A.
          </p>
        </div>

        {/* Quick Actions (Admin + Student) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleShareStream}
            className="px-3.5 py-2.5 rounded-xl bg-[#141525] hover:bg-[#1f2038] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Share Stream Link"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {isAdmin && selectedClass && (
            <>
              <button
                type="button"
                onClick={handleOpenEditStream}
                className="px-3.5 py-2.5 rounded-xl bg-[#17161c] hover:bg-[#23212c] border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Set Stream Link</span>
              </button>

              <button
                type="button"
                disabled={adminToggling}
                onClick={handleAdminToggleLive}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isLiveNow
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-black shadow-amber-500/30'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isLiveNow ? 'End Live Broadcast' : 'Start Live Broadcast'}</span>
              </button>
            </>
          )}

          {isAdmin && onOpenScheduleClass && (
            <button
              type="button"
              onClick={onOpenScheduleClass}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>+ New Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-neutral-400 hover:text-white text-base leading-none px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Admin Quick Edit Modal / Inline Panel */}
      {isEditingStream && selectedClass && (
        <div className="p-5 rounded-2xl bg-[#14120a] border-2 border-amber-500 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Edit3 className="w-4 h-4" />
              <span>Admin: Update Live Stream Video Source</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingStream(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Session Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Live Trading Session & Market Breakdown"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a12] border border-amber-500/40 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                YouTube Live URL / Video Embed Link
              </label>
              <input
                type="text"
                value={editStreamUrl}
                onChange={(e) => setEditStreamUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a12] border border-amber-500/40 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingStream(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={handleSaveStreamEdit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black flex items-center gap-2 hover:opacity-95 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingEdit ? 'Saving...' : 'Save & Stream Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Live Video Player & Live Interactive Chat */}
      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Stream Player (Left 2 Spans) */}
          <div className="lg:col-span-2 space-y-4">
            {/* The 16:9 Video Player - 1-Click Play with ZERO Barriers */}
            <div className="rounded-2xl overflow-hidden bg-black border-2 border-amber-500/40 aspect-video relative shadow-2xl">
              {activeVideoUrl ? (
                isDirectVideo(activeVideoUrl) ? (
                  <video
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(activeVideoUrl)}
                    title={selectedClass.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0d0e18] relative">
                  <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                    <Radio className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white max-w-md">
                    {selectedClass.status === 'upcoming'
                      ? 'Live Stream Scheduled'
                      : 'Live Broadcast Standby'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-md">
                    {selectedClass.status === 'upcoming'
                      ? `Session begins ${new Date(selectedClass.scheduledAt).toLocaleDateString()} at ${new Date(selectedClass.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                      : 'Instructor Zia Khan will go live shortly. Stay tuned on this page.'}
                  </p>

                  {selectedClass.meetingLink && (
                    <a
                      href={selectedClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/30 hover:opacity-95 transition-all"
                    >
                      <Video className="w-4 h-4" /> Open Live Room ({selectedClass.platform})
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleOpenEditStream}
                      className="mt-3 text-xs text-amber-400 underline hover:text-amber-300 font-mono"
                    >
                      Paste stream link or YouTube video URL
                    </button>
                  )}
                </div>
              )}

              {/* Status Badge Tag Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                {isLiveNow ? (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-mono font-black flex items-center gap-1.5 shadow-lg shadow-rose-600/40">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE ON AIR
                  </span>
                ) : selectedClass.status === 'upcoming' ? (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-mono font-black shadow-lg">
                    UPCOMING
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-[#18192a] text-neutral-200 text-xs font-mono font-bold border border-amber-500/30">
                    RECORDED REPLAY
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-[11px] font-mono border border-amber-500/30">
                  {selectedClass.platform}
                </span>
              </div>
            </div>

            {/* Video Info Card */}
            <div className="rounded-2xl bg-[#0c0d16] border border-amber-500/30 p-5 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {selectedClass.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
                    <span className="text-neutral-200">
                      Instructor: <strong className="text-amber-400">{selectedClass.instructorName || 'Zia Khan'}</strong> ({selectedClass.instructorRole || 'Head Trader'})
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {selectedClass.durationMinutes} min
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      {Math.max(selectedClass.attendees.length, 12)} Live Viewers
                    </span>
                  </div>
                </div>

                {selectedClass.meetingLink && (
                  <a
                    href={selectedClass.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#141525] hover:bg-[#1f2038] text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-500/30 shrink-0"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>External Meet Room</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                )}
              </div>

              {selectedClass.description && (
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pt-2 border-t border-amber-500/15">
                  {selectedClass.description}
                </p>
              )}

              {selectedClass.notesDoc && (
                <div className="p-3.5 rounded-xl bg-[#121320] border border-amber-500/25 text-xs text-neutral-200">
                  <span className="font-bold text-amber-400 font-mono uppercase text-[10px] block mb-0.5 tracking-wider">
                    Desk Notes & Strategy Briefing:
                  </span>
                  {selectedClass.notesDoc}
                </div>
              )}
            </div>
          </div>

          {/* Live Interactive Chat (Right 1 Span) */}
          <div className="rounded-2xl bg-[#0c0d16] border-2 border-amber-500/35 flex flex-col h-[520px] lg:h-auto overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-amber-500/30 flex items-center justify-between bg-[#121320]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Live Trading Chat
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#090a12] p-0.5 rounded-lg border border-amber-500/30 text-[10px]">
                <button
                  type="button"
                  onClick={() => setChatFilter('all')}
                  className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    chatFilter === 'all'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setChatFilter('questions')}
                  className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                    chatFilter === 'questions'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Q&A
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 font-sans">
              {filteredChat.map((msg) => {
                const isAdminMsg = msg.userRole === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs border ${
                      msg.isQuestion
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : isAdminMsg
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-[#121320] border-[#1e2032]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="font-bold text-neutral-200">{msg.userName}</span>
                        {isAdminMsg && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                            INSTRUCTOR
                          </span>
                        )}
                        {msg.isQuestion && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center gap-0.5 border border-amber-500/30">
                            <HelpCircle className="w-2.5 h-2.5" /> QUESTION
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {msg.timestamp.includes(':')
                          ? msg.timestamp
                          : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-neutral-200 leading-relaxed">{msg.text}</p>

                    <div className="mt-1.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleUpvote(msg.id)}
                        className="text-[10px] font-mono text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3 text-amber-400/80" /> {msg.upvotes}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredChat.length === 0 && (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  No chat messages yet. Type below to ask a question or chat live!
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-amber-500/20 bg-[#121320] space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={user ? "Ask Zia Khan or chat with students..." : "Sign in to chat live"}
                  disabled={!user}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#090a12] border border-amber-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!user || !inputText.trim()}
                  className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-95 disabled:opacity-40 transition-opacity shadow-sm cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                    className="rounded bg-[#090a12] border-amber-500/40 text-amber-500 focus:ring-0 w-3 h-3 accent-amber-500"
                  />
                  <span>Mark as Question</span>
                </label>
                <span className="text-[10px] text-amber-400/70">Live Chat</span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0c0d16] rounded-2xl border border-amber-500/30">
          <Radio className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No Live Stream Currently Scheduled</h4>
          <p className="text-xs text-neutral-400 mt-1">Check back soon for the next live session.</p>
        </div>
      )}

      {/* Playlist / Previous Streams & Upcoming Sessions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>All Live Sessions & Recorded Replays</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Click any session to switch video player
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveClasses.map((item) => {
            const isSelected = selectedClass?.id === item.id;
            const thumb = getAutoThumbnail(item.streamUrl || item.replayUrl);

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedClass(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#18150c] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-[#0c0d16] border border-amber-500/25 hover:border-amber-400/60 hover:bg-[#121320]'
                }`}
              >
                <div>
                  {/* Thumbnail Preview with Play Icon */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-neutral-900 border border-amber-500/20">
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shadow-md ${
                        item.status === 'live'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : item.status === 'upcoming'
                          ? 'bg-amber-500 text-black'
                          : 'bg-black/80 text-neutral-300 border border-neutral-700'
                      }`}>
                        {item.status === 'live' ? '● Live Now' : item.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300">
                      {item.durationMinutes} min
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                    {item.description || 'Live trading analysis and execution.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    {isSelected ? '✓ Watching Now' : 'Click to Watch'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Exchange Referral Accounts (MEXC • Binance • Bybit) */}
      {exchanges && exchanges.length > 0 && (
        <ExchangeReferralCards
          exchanges={exchanges}
          title="Official Exchange Portals (MEXC • Binance • Bybit)"
          subtitle="Follow along with real-time live trading streams and order executions with verified partner links."
        />
      )}
    </div>
  );
};
