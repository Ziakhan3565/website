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
  Radio
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
    if (confirm('Delete this community poll permanently?')) {
      try {
        await api.deletePoll(pollId);
        await fetchPolls();
      } catch (err: any) {
        alert(err.message || 'Failed to delete poll');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#0f1019] border border-[#23253b] text-neutral-400 font-mono text-xs">
        Loading Community Lecture Request Portal...
      </div>
    );
  }

  return (
    <section className="relative rounded-3xl bg-gradient-to-br from-[#121024] via-[#0d0f1a] to-[#090b12] border border-purple-500/25 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold mb-2">
            <Vote className="w-3.5 h-3.5 text-purple-400" />
            <span>COMMUNITY DEMAND PORTAL · NEXT LECTURE VOTE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Which Topic or Asset Do You Want in the Next Lecture?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Cast your vote! Whichever market asset or topic receives the most student votes (e.g. <strong>Bitcoin vs. Gold</strong>) will be selected by Admin Zia Khan for complete institutional analysis in the next live stream and video lesson.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowNewPollModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Request Topic</span>
            </button>
          )}

          {onOpenLiveClass && (
            <button
              type="button"
              onClick={onOpenLiveClass}
              className="px-4 py-2.5 rounded-xl bg-[#1a1b2a] hover:bg-[#25273c] text-neutral-200 border border-[#2e314a] text-xs font-bold font-mono flex items-center gap-1.5 transition-all"
            >
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Live Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* Poll Cards */}
      <div className="relative z-10 space-y-6">
        {polls.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#141524] border border-[#24263b] text-neutral-400 space-y-2">
            <BarChart2 className="w-8 h-8 text-neutral-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Active Lecture Request Polls</h4>
            <p className="text-xs text-neutral-400">
              Admin Zia Khan can create a lecture demand poll using the button above.
            </p>
          </div>
        ) : (
          polls.map(poll => {
            const hasVoted = Boolean(userVotedPolls[poll.id]);
            const userVoteOptionId = userVotedPolls[poll.id];

            // Determine leading option
            let leader = poll.options[0];
            poll.options.forEach(opt => {
              if (opt.votes > (leader?.votes || 0)) {
                leader = opt;
              }
            });

            return (
              <div
                key={poll.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#0f111c] border border-[#23263e] shadow-xl space-y-5"
              >
                {/* Poll Meta */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#1f2238] pb-4 min-w-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        ACTIVE VOTE
                      </span>
                      {poll.analysisDate && (
                        <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Calendar className="w-3 h-3" />
                          <span>{poll.analysisDate}</span>
                        </span>
                      )}
                      <span className="text-xs font-mono text-neutral-400">
                        {poll.totalVotes} Total Student Votes
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight break-words">
                      {poll.title}
                    </h3>
                    {poll.description && (
                      <p className="text-xs text-neutral-400 break-words">{poll.description}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeletePoll(poll.id)}
                      className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                      title="Delete Poll Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Topic</span>
                    </button>
                  )}
                </div>

                {/* Leading Option Highlight Banner */}
                {leader && poll.totalVotes > 0 && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block truncate">
                          #1 CURRENT WINNING SELECTION ({Math.round((leader.votes / poll.totalVotes) * 100)}% VOTES)
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white break-words leading-snug">
                          {cleanOptionText(leader.text)}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg shrink-0 font-bold self-start sm:self-auto">
                      ★ Scheduled for Live Breakdown
                    </span>
                  </div>
                )}

                {/* Vote Options List */}
                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const isSelected = userVoteOptionId === option.id;
                    const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    const isLeader = leader?.id === option.id && poll.totalVotes > 0;

                    return (
                      <div
                        key={option.id}
                        onClick={() => handleVote(poll.id, option.id)}
                        className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20'
                            : 'bg-[#141624] border-[#24273e] hover:border-purple-500/50 hover:bg-[#181a2c]'
                        }`}
                      >
                        {/* Background Progress Bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none opacity-20 ${
                            isLeader ? 'bg-amber-400' : 'bg-purple-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 min-w-0">
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            {/* Radio / Selection Indicator */}
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 ${
                                isSelected
                                  ? 'border-purple-400 bg-purple-600 text-white'
                                  : 'border-neutral-500 group-hover:border-purple-400'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>

                            <span
                              className={`text-xs sm:text-sm font-semibold transition-colors break-words leading-snug min-w-0 flex-1 ${
                                isSelected ? 'text-purple-200 font-bold' : 'text-neutral-200 group-hover:text-white'
                              }`}
                            >
                              {cleanOptionText(option.text)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-8 sm:pl-0">
                            <span className="text-xs font-mono font-bold text-white">
                              {percent}%
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400">
                              ({option.votes} votes)
                            </span>
                            {isLeader && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                Leading
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer hint */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] font-mono text-neutral-400">
                  <span>
                    {hasVoted ? (
                      <span className="text-emerald-400 font-semibold">
                        ✓ Your request is recorded. Click any other option to change your vote.
                      </span>
                    ) : (
                      <span>Click any option above to cast your demand vote.</span>
                    )}
                  </span>
                  <span className="text-neutral-400">
                    Highest voted market gets complete multi-timeframe analysis & video lesson.
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

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
