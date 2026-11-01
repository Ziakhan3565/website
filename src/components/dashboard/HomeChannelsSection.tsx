import React from 'react';
import {
  Send,
  MessageCircle,
  Youtube,
  Instagram,
  Share2,
  ExternalLink,
  Radio
} from 'lucide-react';

interface HomeChannelsSectionProps {
  onOpenChannelModal?: () => void;
}

export const HomeChannelsSection: React.FC<HomeChannelsSectionProps> = ({
  onOpenChannelModal,
}) => {
  const officialChannels = [
    {
      id: 'telegram',
      name: 'Telegram VIP Channel',
      handle: '@LearnAndGrowOfficial',
      description: 'Daily crypto signals, technical analysis charts, news alerts & live market breakdowns.',
      url: 'https://t.me/LearnAndGrowTrading',
      icon: Send,
      color: 'from-sky-500 to-blue-600',
      badge: '50K+ Members',
      btnText: 'Join Telegram',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Community',
      handle: '+92 300 8492019',
      description: 'Official student updates, mentorship desk support, and urgent announcements.',
      url: 'https://wa.me/923008492019?text=Hello%20Learn%20and%20Grow,%20I%20want%20to%20join%20the%20community',
      icon: MessageCircle,
      color: 'from-emerald-500 to-green-600',
      badge: 'Active Desk',
      btnText: 'Join WhatsApp',
    },
    {
      id: 'youtube',
      name: 'YouTube Trading Academy',
      handle: '@LearnAndGrowOfficial',
      description: 'Free video masterclasses, live candlestick tutorials, and recorded trading sessions.',
      url: 'https://youtube.com',
      icon: Youtube,
      color: 'from-red-500 to-rose-600',
      badge: 'Weekly Streams',
      btnText: 'Watch on YouTube',
    },
    {
      id: 'instagram',
      name: 'Instagram Community',
      handle: '@learnandgrow_official',
      description: 'Trading psychology tips, infographic summaries, and student profit highlights.',
      url: 'https://instagram.com',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      badge: 'Daily Insights',
      btnText: 'Follow Instagram',
    },
  ];

  return (
    <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-bold uppercase mb-2">
            <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>Official Community Channels</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Connect With Learn and Grow Everywhere
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Join our verified official channels to receive free signals, breaking financial updates, and connect with fellow traders.
          </p>
        </div>

        {onOpenChannelModal && (
          <button
            onClick={onOpenChannelModal}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>View All Channels</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {officialChannels.map((ch) => {
          const IconComp = ch.icon;
          return (
            <div
              key={ch.id}
              className="rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 p-4 flex flex-col justify-between transition-all group hover:scale-[1.01] hover:bg-white shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${ch.color} flex items-center justify-center text-white shadow-sm`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {ch.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {ch.name}
                </h4>
                <p className="text-[11px] font-mono text-purple-600 font-bold mb-2">
                  {ch.handle}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white text-slate-800 border border-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>{ch.btnText}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
