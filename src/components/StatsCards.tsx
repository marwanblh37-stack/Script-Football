import { Calendar, Target, CheckCircle2, TrendingUp } from "lucide-react";
import { DashboardStats } from "../types";

interface StatsCardsProps {
  stats?: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // Fallbacks if stats are loading or not provided
  const currentStats: DashboardStats = stats || {
    totalMatches: 31,
    successfulPredictions: 24,
    accuracyRate: 78,
    averageGoals: 2.8,
  };

  const cards = [
    {
      id: "stat-total",
      title: "إجمالي المباريات المتاحة",
      value: `${currentStats.totalMatches} مباراة`,
      subtext: "محللة ومغطاة بالكامل",
      icon: Calendar,
      colorClass: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
      accentDot: "bg-blue-400",
    },
    {
      id: "stat-accuracy",
      title: "دقة التوقعات العامة",
      value: `${currentStats.accuracyRate}%`,
      subtext: "نسبة نجاح التوصيات المعتمدة",
      icon: Target,
      colorClass: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      accentDot: "bg-emerald-400",
    },
    {
      id: "stat-success",
      title: "توقعات ناجحة",
      value: `+${currentStats.successfulPredictions} توقع`,
      subtext: "تجاوزت حاجز التوقع الصعب",
      icon: CheckCircle2,
      colorClass: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
      accentDot: "bg-amber-400",
    },
    {
      id: "stat-goals",
      title: "متوسط الأهداف اليومي",
      value: currentStats.averageGoals.toFixed(1),
      subtext: "معدل تهديفي مرتفع للمباريات",
      icon: TrendingUp,
      colorClass: "from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 text-purple-400",
      accentDot: "bg-purple-400",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-section">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className={`relative overflow-hidden bg-gradient-to-br ${card.colorClass} border p-5 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
          >
            {/* Ambient Background Light */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">{card.title}</span>
                <span className="text-2xl font-black text-white tracking-tight font-mono">{card.value}</span>
              </div>
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900/40 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${card.accentDot}`} />
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
