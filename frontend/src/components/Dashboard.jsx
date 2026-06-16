import React from 'react';
import { 
  Zap, 
  Clock, 
  CheckCircle2, 
  Smile, 
  Lightbulb, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ analytics, latestInsight, setActiveTab }) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const { productivityScore, metrics, todayTimeline } = analytics;
  const focusHours = (metrics.focusMinutes / 60).toFixed(1);
  const sleepHours = (metrics.sleepMinutes / 60).toFixed(1);

  // Focus score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'stroke-emerald-400 text-emerald-400';
    if (score >= 60) return 'stroke-violet-400 text-violet-400';
    return 'stroke-amber-400 text-amber-400';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Good Morning, Varsha
          </h1>
          <p className="text-slate-400 mt-1">Here is your productivity intelligence overview for today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-slate-300 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Grid: Score + Core Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Productivity Score Ring */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" /> AI Productivity Score
          </h2>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circle background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="88" 
                cy="88" 
                r="74" 
                className="stroke-slate-800" 
                strokeWidth="10" 
                fill="transparent" 
              />
              <circle 
                cx="88" 
                cy="88" 
                r="74" 
                className={`transition-all duration-1000 ease-out ${getScoreColor(productivityScore)}`}
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - productivityScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-5xl font-extrabold tracking-tight text-white">{productivityScore}%</span>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                {productivityScore >= 80 ? 'Optimal' : productivityScore >= 60 ? 'Good' : 'Needs Focus'}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400 mt-6 leading-relaxed">
            Formulated from focus duration (35%), habit checks (25%), sleep health (20%), and daily mood (20%).
          </p>
        </div>

        {/* Core Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Deep Focus */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                <Clock className="w-6 h-6 text-violet-400" />
              </div>
              <span className="text-xs text-violet-400 font-semibold bg-violet-500/10 px-2.5 py-1 rounded-full">
                Target: 4.0h
              </span>
            </div>
            <div className="mt-8">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Deep Focus</span>
              <h3 className="text-3xl font-bold text-white mt-1">{focusHours} <span className="text-lg font-normal text-slate-400">hours</span></h3>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metrics.focusMinutes / 240) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sleep duration */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full">
                Target: 8.0h
              </span>
            </div>
            <div className="mt-8">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sleep Logged</span>
              <h3 className="text-3xl font-bold text-white mt-1">{sleepHours} <span className="text-lg font-normal text-slate-400">hours</span></h3>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metrics.sleepMinutes / 480) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Habits Completion */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded-full">
                {metrics.habitsCompleted}/{metrics.habitsTotal} Done
              </span>
            </div>
            <div className="mt-8">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Habit Completion</span>
              <h3 className="text-3xl font-bold text-white mt-1">
                {metrics.habitsTotal > 0 ? Math.round((metrics.habitsCompleted / metrics.habitsTotal) * 100) : 0}%
              </h3>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.habitsTotal > 0 ? (metrics.habitsCompleted / metrics.habitsTotal) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mood Scale */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Smile className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full">
                Avg: {metrics.averageMood}/10
              </span>
            </div>
            <div className="mt-8">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Mood</span>
              <h3 className="text-3xl font-bold text-white mt-1">
                {metrics.averageMood >= 8 ? 'Focused & Happy' : metrics.averageMood >= 6 ? 'Steady' : 'Fatigued'}
              </h3>
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.averageMood * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Second Row: AI Suggestion panel + Today's Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AI Suggestion panel */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" /> AI Coach Advice
              </h2>
              <span className="text-xs text-slate-500">Updated daily</span>
            </div>
            
            {latestInsight ? (
              <div className="space-y-4">
                <blockquote className="text-slate-300 italic leading-relaxed border-l-2 border-violet-500/50 pl-4">
                  "{latestInsight.analysis}"
                </blockquote>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">Key Recommendation</h4>
                  <div className="text-sm text-slate-300 space-y-1.5">
                    {latestInsight.recommendation.split('\n').map((item, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-violet-400 mt-1">•</span>
                        <span>{item.replace(/^- /, '')}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-8 text-center">
                <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p>No AI analysis generated yet.</p>
                <button 
                  onClick={() => setActiveTab('coach')}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-lg transition"
                >
                  Generate Recommendation
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <button 
              onClick={() => setActiveTab('coach')}
              className="text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1.5 group/btn"
            >
              Consult AI productivity coach <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> Today's Timeline
            </h2>
            
            {todayTimeline.length > 0 ? (
              <div className="relative border-l-2 border-slate-800/80 ml-3 pl-6 space-y-6">
                {todayTimeline.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-indigo-400 flex items-center justify-center transition-transform group-hover:scale-125">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{item.time}</span>
                      <span className="text-xs bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-700/30">
                        {item.type} • {item.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 font-medium">{item.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-12">
                <p>No activities logged today yet.</p>
                <button 
                  onClick={() => setActiveTab('logger')}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg transition"
                >
                  Log Your First Activity
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <button 
              onClick={() => setActiveTab('logger')}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 group/btn"
            >
              Add activities or start timer <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
