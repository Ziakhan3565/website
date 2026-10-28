import React, { useState, useEffect } from 'react';
import {
  Vote,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  Plus,
  Trash2,
  Calendar,
  Lock,
  ChevronRight,
  Flame,
  Radio,
  GraduationCap,
  Users,
  Check
} from 'lucide-react';
import type { CommunityPoll } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CommunityDemandPortalProps {
  onNavigate?: (tab: string) => void;
  onOpenLiveClass?: () => void;
}

const cleanOptionText = (text: string): string => {
  return (text || '').replace(/^\d+[\.\)]\s*/, '').trim();
};

export const CommunityDemandPortal: React.FC<CommunityDemandPortalProps> = ({
  onNavigate,
  onOpenLiveClass
}) => {
  const { user, isAdmin } = useAuth();
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);
  const [userVotedPolls, setUserVotedPolls] = useState<Record<string, string>>({});
  const [filterTab, setFilterTab] = useState<'all' | 'voted' | 'pending'>('all');

  // Admin New Poll Modal
  const [showNewPollModal, setShowNewPollModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAnalysisDate, setNewAnalysisDate] = useState('Upcoming NY Live Stream');
  const [rawOptions, setRawOptions] = useState<string[]>([
    'Bitcoin (BTC) — Institutional Orderflow & $75K Targets',
    'Gold (XAUUSD) — Macro Safe-Haven Breakout vs USD',
    'Ethereum (ETH) — L1 Layer-2 Liquidity Inflow',
    'Solana (SOL) — Futures CVD Absorption & Breakout'
  ]);
  const [submittingPoll, setSubmittingPoll] = useState(false);

  const fetchPolls = async () => {
    try {
      const res = await api.getPolls();
      if (res.polls) {
        setPolls(res.polls);
        // Find which polls current user voted on
        if (user) {
          const votesMap: Record<string, string> = {};
          res.polls.forEach(p => {
            if (p.userVotes && p.userVotes[user.id]) {
              votesMap[p.id] = p.userVotes[user.id];
            }
          });
          setUserVotedPolls(votesMap);
        }
      }
    } catch (err) {
      console.error('Failed to fetch community polls', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [user]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Please sign in or select an account to cast your lecture request vote.');
      return;
    }
    setVotingOptionId(optionId);
    try {
      const res = await api.votePoll(pollId, optionId);
      if (res.poll) {
        setPolls(prev => prev.map(p => (p.id === pollId ? res.poll : p)));
        setUserVotedPolls(prev => ({ ...prev, [pollId]: optionId }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit your vote.');
    } finally {
      setVotingOptionId(null);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = rawOptions.map(o => o.trim()).filter(Boolean);
    if (!newTitle.trim() || validOptions.length < 2) {
      alert('Please provide a title and at least 2 options.');
      return;
    }
    setSubmittingPoll(true);
    try {
      await api.createPoll({
        title: newTitle.trim(),
        description: newDesc.trim() || 'Vote for your preferred topic. Highest votes dictate our next live deep-dive lecture!',
        options: validOptions,
        analysisDate: newAnalysisDate.trim()
      });
      setShowNewPollModal(false);
      setNewTitle('');
      setNewDesc('');
      await fetchPolls();
    } catch (err: any) {
      alert(err.message || 'Failed to create poll');
    } finally {
      setSubmittingPoll(false);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    // Delete immediately on click without blocking confirm popup
    setPolls(prev => prev.filter(p => p.id !== pollId));
    try {
      await api.deletePoll(pollId);
    } catch (err: any) {
      console.error('Failed to delete poll:', err);
      await fetchPolls();
    }
  };

  const votedCount = polls.filter(p => userVotedPolls[p.id]).length;
  const unvotedCount = polls.filter(p => !userVotedPolls[p.id]).length;

  const displayedPolls = polls.filter(p => {
    if (filterTab === 'voted') return Boolean(userVotedPolls[p.id]);
    if (filterTab === 'pending') return !userVotedPolls[p.id];
    return true;
  });

  if (loading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#0f1019] border border-[#23253b] text-neutral-400 font-mono text-xs">
        Loading Student Community Demand Portal...
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* 1. Controller Header Banner (Matching Exact Track Controller Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1814] via-[#10191c] to-[#0a1012] p-5 sm:p-6 rounded-2xl border border-emerald-500/40 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold mb-1 border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>STUDENT DEMAND & TOPIC CONTROLLER</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
            <span>Student Community Demand Portal</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              {polls.length} Topics
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-xl leading-relaxed">
            Vote for the cryptocurrency, technical framework, or market asset you want Admin Zia Khan to analyze in the next live lecture and video breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewPollModal(true)}
            className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:opacity-95 text-black text-[11px] sm:text-xs font-black font-mono flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Request Topic</span>
          </button>

          {onOpenLiveClass && (
            <button
              type="button"
              onClick={onOpenLiveClass}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#161726] hover:bg-[#202235] text-neutral-200 border border-amber-500/30 text-[11px] sm:text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Live Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs with Live Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black shadow-md shadow-amber-500/25'
              : 'bg-[#121422] text-neutral-400 hover:text-amber-300 border border-[#222438]'
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>All Demand Topics</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'all' ? 'bg-black/25 text-black' : 'bg-black/40 text-amber-300'}`}>
            {polls.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('voted')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            filterTab === 'voted'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black shadow-md shadow-amber-500/25'
              : 'bg-[#121422] text-neutral-400 hover:text-amber-300 border border-[#222438]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Voted by You</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'voted' ? 'bg-black/25 text-black' : 'bg-black/40 text-amber-300'}`}>
            {votedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('pending')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black shadow-md shadow-amber-500/25'
              : 'bg-[#121422] text-neutral-400 hover:text-amber-300 border border-[#222438]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Awaiting Vote</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'pending' ? 'bg-black/25 text-black' : 'bg-black/40 text-amber-300'}`}>
            {unvotedCount}
          </span>
        </button>
      </div>

      {/* 3. Empty State or Active Topics List */}
      {displayedPolls.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[#11131c] rounded-2xl border border-[#23253b] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Vote className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              {filterTab === 'voted'
                ? 'No Voted Topics Yet'
                : filterTab === 'pending'
                ? 'You Have Voted on All Active Topics!'
                : 'No Active Lecture Request Topics Yet'}
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {filterTab === 'voted'
                ? 'Select a topic from "All Demand Topics" to cast your vote.'
                : 'Click the button below to submit your topic request or propose a market breakdown for Admin Zia Khan.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewPollModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Request First Lecture Topic</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedPolls.map(poll => {
            const hasVoted = Boolean(userVotedPolls[poll.id]);
            const userVoteOptionId = userVotedPolls[poll.id];

            return (
              <div
                key={poll.id}
                className="p-5 rounded-2xl bg-[#10121b] border border-[#23253b] hover:border-emerald-500/40 transition-all shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Topic Meta Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#1c1f30] pb-3 min-w-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                          ACTIVE POLL
                        </span>
                        {poll.analysisDate && (
                          <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Calendar className="w-3 h-3" />
                            <span>{poll.analysisDate}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400">
                          {poll.totalVotes} Total Votes
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight break-words pt-1">
                        {poll.title}
                      </h4>
                      {poll.description && (
                        <p className="text-xs text-neutral-400 break-words leading-relaxed">
                          {poll.description}
                        </p>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeletePoll(poll.id);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeletePoll(poll.id);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
                        title="Delete Poll Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  {/* Vote Options List (WhatsApp / Instagram Poll Style) */}
                  <div className="space-y-2.5 pt-3">
                    {poll.options.map((option) => {
                      const isSelected = userVoteOptionId === option.id;
                      const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

                      return (
                        <div
                          key={option.id}
                          onClick={() => handleVote(poll.id, option.id)}
                          className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/10'
                              : 'bg-[#151726] border-[#252840] hover:border-amber-500/40 hover:bg-[#1a1d30]'
                          }`}
                        >
                          {/* Background Progress Bar - ONLY visible after user votes */}
                          {hasVoted && (
                            <div
                              className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                                isSelected ? 'bg-amber-500/25' : 'bg-white/[0.08]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          )}

                          {/* Option Row Content */}
                          <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Circular Radio Indicator (WhatsApp/Instagram style) */}
                              <div
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-500 text-black'
                                    : 'border-neutral-500 group-hover:border-amber-400'
                                }`}
                              >
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />}
                              </div>

                              <span
                                className={`text-xs sm:text-sm transition-colors break-words leading-snug min-w-0 flex-1 ${
                                  isSelected ? 'text-amber-200 font-bold' : 'text-neutral-200 group-hover:text-white font-medium'
                                }`}
                              >
                                {cleanOptionText(option.text)}
                              </span>
                            </div>

                            {/* Percent & Votes - ONLY visible after user votes */}
                            {hasVoted && (
                              <div className="flex items-center gap-2 shrink-0 pl-2">
                                <span className="text-xs font-mono font-bold text-white">
                                  {percent}%
                                </span>
                                <span className="text-[11px] font-mono text-neutral-400">
                                  ({option.votes})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer status - WhatsApp style */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1c1f30] text-[11px] font-mono text-neutral-400">
                  <span>
                    {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                    {hasVoted ? ' • ✓ Vote recorded' : ' • Select an option to vote'}
                  </span>
                  {hasVoted && (
                    <span className="text-neutral-400 text-[10px]">
                      Tap another to change
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Modal: Create New Lecture Poll / Demand Portal */}
      {showNewPollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreatePoll}
            className="w-full max-w-lg bg-[#11121d] border border-[#272a42] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#212338] pb-3">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Add Lecture Demand Poll</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPollModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Poll Question / Demand Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Which asset should our next live market analysis & lecture cover?"
                className="w-full bg-[#161726] border border-[#282b42] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Description / Context (Optional)
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Vote for the topic you want our desk to dissect. The winner receives dedicated live analysis."
                className="w-full bg-[#161726] border border-[#282b42] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 h-16"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-300 block mb-1">
                Scheduled Analysis Date / Target Session
              </label>
              <input
                type="text"
                value={newAnalysisDate}
                onChange={(e) => setNewAnalysisDate(e.target.value)}
                placeholder="e.g. Wednesday Live NY Desk or Upcoming Masterclass"
                className="w-full bg-[#161726] border border-[#282b42] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Options list */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-300 block">
                Voting Options (e.g. Bitcoin vs. Gold)
              </label>
              {rawOptions.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-purple-400 font-bold w-5">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...rawOptions];
                      updated[index] = e.target.value;
                      setRawOptions(updated);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-[#161726] border border-[#282b42] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  {rawOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setRawOptions(rawOptions.filter((_, i) => i !== index))}
                      className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all shrink-0 cursor-pointer"
                      title="Remove Choice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {rawOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setRawOptions([...rawOptions, ''])}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Choice</span>
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#212338]">
              <button
                type="button"
                onClick={() => setShowNewPollModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1b1d2e] text-neutral-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPoll}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono shadow-md disabled:opacity-50"
              >
                {submittingPoll ? 'Publishing...' : 'Publish Lecture Demand Poll'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
