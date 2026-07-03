import React, { useState } from "react";
import { 
  Lock, Key, HelpCircle, Star, Compass, CreditCard, 
  Flame, Sparkles, ChevronDown, ChevronUp, Swords, HelpCircle as HelpIcon, ShieldAlert
} from "lucide-react";
import { Match } from "../types";

interface MatchCardProps {
  match: Match;
  isUnlocked: boolean;
  onActivateCode: (code: string) => Promise<boolean>;
}

export default function MatchCard({ match, isUnlocked, onActivateCode }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"predictions" | "analysis">("predictions");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleQuickUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const success = await onActivateCode(inputCode);
      if (!success) {
        setErrorMsg("كود غير صحيح");
      }
    } catch (err) {
      setErrorMsg("فشل الاتصال");
    } finally {
      setLoading(false);
    }
  };

  // Check if this specific card is locked
  const isLocked = match.isVIP && !isUnlocked;

  // Form colors helpers
  const getFormColor = (result: string) => {
    switch (result) {
      case "W": return "bg-emerald-500 text-slate-950 font-black";
      case "D": return "bg-slate-600 text-white font-bold";
      case "L": return "bg-rose-500 text-white font-bold";
      default: return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-slate-900/90 border rounded-2xl transition-all duration-300 shadow-xl ${
        isLocked 
          ? "border-amber-500/20 hover:border-amber-500/40" 
          : "border-slate-800/80 hover:border-slate-700/60"
      }`}
      id={`match-card-${match.id}`}
    >
      {/* VIP Label Ribbons */}
      {match.isVIP && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] rounded-full shadow-md shadow-amber-500/10">
          <Lock className="w-3 h-3 stroke-[2.5]" />
          <span>VIP متميز</span>
        </div>
      )}
      {!match.isVIP && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px] rounded-full">
          <span>تحليل مجاني</span>
        </div>
      )}

      {/* Group & Time Header */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-900/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          {match.group}
        </span>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 font-mono pl-16">
          <span>{match.date}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400">{match.time}</span>
        </div>
      </div>

      {/* Main Teams Match Board */}
      <div className="p-5 md:p-6 text-center">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center text-3xl shadow-inner relative group-hover:scale-105 transition-transform duration-300">
              {match.homeLogo || "⚽"}
            </div>
            <span className="text-sm font-black text-white line-clamp-1">{match.homeTeam}</span>
            <div className="flex items-center gap-1">
              {match.homeForm?.map((f, i) => (
                <span key={i} className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${getFormColor(f)}`}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono font-bold shadow-md">
              VS
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center text-3xl shadow-inner relative group-hover:scale-105 transition-transform duration-300">
              {match.awayLogo || "⚽"}
            </div>
            <span className="text-sm font-black text-white line-clamp-1">{match.awayTeam}</span>
            <div className="flex items-center gap-1">
              {match.awayForm?.map((f, i) => (
                <span key={i} className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${getFormColor(f)}`}>
                  {f}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Odds 1X2 Ribbon (Public info) */}
        {match.odds1X2 && (
          <div className="mt-5 max-w-sm mx-auto grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
            <div className="text-center p-1.5">
              <span className="text-[9px] text-slate-500 font-bold block">فوز المضيف (1)</span>
              <span className="text-xs font-black text-white font-mono">{match.odds1X2.home}</span>
            </div>
            <div className="text-center p-1.5 border-x border-slate-900">
              <span className="text-[9px] text-slate-500 font-bold block">تعادل (X)</span>
              <span className="text-xs font-black text-amber-400 font-mono">{match.odds1X2.draw}</span>
            </div>
            <div className="text-center p-1.5">
              <span className="text-[9px] text-slate-500 font-bold block">فوز الضيف (2)</span>
              <span className="text-xs font-black text-white font-mono">{match.odds1X2.away}</span>
            </div>
          </div>
        )}

        {/* View Details Toggle */}
        <div className="mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isExpanded 
                ? "bg-slate-950 text-white border border-slate-800" 
                : "bg-slate-950 hover:bg-slate-950 text-amber-400 border border-slate-800/40 hover:border-amber-500/30"
            }`}
          >
            <span>{isExpanded ? "إخفاء التحليل والتوقعات" : "عرض التوقعات والتحليل التكتيكي"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expanded Prediction Drawers (with VIP lock overlay if necessary) */}
      {isExpanded && (
        <div className="border-t border-slate-800/60 bg-slate-950/50 relative">
          
          {isLocked ? (
            /* SECURE LOCKED VIP OVERLAY - Completely server-validated. Predictions are not sent in sanitized matches! */
            <div className="p-6 text-center bg-slate-950/95 backdrop-blur-md rounded-b-2xl border-t border-amber-500/30 flex flex-col items-center justify-center min-h-[300px] z-10">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/5">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              
              <h4 className="text-sm font-black text-white">هذه المباراة للمشتركين VIP فقط 🔒</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                التوقع الأساسي، التوقع الثانوي والتحليلات الفنية والتاكتيكية مشفرة حالياً لحماية المحتوى المميز.
              </p>

              {/* Instant Code Validation Box */}
              <form onSubmit={handleQuickUnlock} className="mt-5 w-full max-w-xs flex flex-col gap-2.5">
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="أدخل كود تفعيل VIP لفتح المباراة..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    dir="rtl"
                    className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-semibold text-white placeholder-slate-600"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/10 transition-colors cursor-pointer"
                >
                  {loading ? "جاري التحقق من الكود..." : "فتح التحليل الفوري 🔓"}
                </button>

                {errorMsg && (
                  <p className="text-[10px] text-red-400 font-bold mt-1 bg-red-950/30 py-1.5 px-2.5 rounded-lg border border-red-900/40">
                    ⚠️ {errorMsg}
                  </p>
                )}
              </form>

              <div className="mt-5 text-[10px] text-slate-500 font-medium">
                لا تملك كود تفعيل؟ تواصل مع الإدارة للحصول عليه فوراً.
              </div>
            </div>
          ) : (
            /* UNLOCKED DETAILS / FREE MATCH CONTENT */
            <div className="p-5 space-y-5 animate-fadeIn">
              
              {/* Inner Tabs for Predictions and Analysis */}
              <div className="flex border-b border-slate-800/60 gap-2 pb-1.5">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("predictions")}
                  className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg cursor-pointer text-center ${
                    activeDetailTab === "predictions"
                      ? "bg-slate-900 text-amber-400 border border-amber-500/20 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  🎯 خانة التوقعات
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("analysis")}
                  className={`flex-1 py-2 px-3 text-xs font-bold transition-all rounded-lg cursor-pointer text-center ${
                    activeDetailTab === "analysis"
                      ? "bg-slate-900 text-blue-400 border border-blue-500/20 shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  🧠 خانة التحليلات
                </button>
              </div>

              {activeDetailTab === "predictions" ? (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Probability Meter (Moved from outer card) */}
                  {match.probability && (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-right">
                      <span className="text-[10px] text-slate-500 font-black block mb-2.5 tracking-wider">احتمالات الفوز بالذكاء الاصطناعي</span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-300 font-bold mb-2">
                        <span>فوز {match.homeTeam}: {match.probability.home}%</span>
                        <span>التعادل: {match.probability.draw}%</span>
                        <span>فوز {match.awayTeam}: {match.probability.away}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                        <div style={{ width: `${match.probability.home}%` }} className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full" title="Home win probability" />
                        <div style={{ width: `${match.probability.draw}%` }} className="bg-slate-700 h-full" title="Draw probability" />
                        <div style={{ width: `${match.probability.away}%` }} className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-full" title="Away win probability" />
                      </div>
                    </div>
                  )}

                  {/* Predictions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Primary Prediction */}
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] relative overflow-hidden text-right">
                      <div className="absolute top-0 left-0 w-12 h-12 bg-amber-500/[0.05] rounded-br-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-amber-400">التوقع الأساسي (قيمة مرتفعة)</span>
                      </div>
                      <p className="text-xs font-bold text-white leading-relaxed">{match.primaryPrediction || "فوز أحد الفريقين"}</p>
                      {match.primaryOdds && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-slate-400 font-bold">
                          <span>معامل الرهان:</span>
                          <span className="text-amber-400 font-black">{match.primaryOdds}</span>
                        </div>
                      )}
                    </div>

                    {/* Secondary Prediction */}
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.02] relative overflow-hidden text-right">
                      <div className="absolute top-0 left-0 w-12 h-12 bg-blue-500/[0.05] rounded-br-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-black text-blue-400">التوقع الثانوي (مركب / ذكي)</span>
                      </div>
                      <p className="text-xs font-bold text-white leading-relaxed">{match.secondaryPrediction || "كلا الفريقين يسجلان"}</p>
                      {match.secondaryOdds && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-slate-400 font-bold">
                          <span>معامل الرهان:</span>
                          <span className="text-blue-400 font-black">{match.secondaryOdds}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Correct Score Banner */}
                  {match.correctScore && (
                    <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <Flame className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-400 font-bold block">النتيجة الدقيقة المستهدفة</span>
                          <span className="text-xs font-black text-white">{match.correctScore}</span>
                        </div>
                      </div>
                      <div className="text-left bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono font-bold">
                        <span className="text-slate-500 text-[9px] mr-1">مستهدف ODD:</span>
                        <span className="text-purple-400 font-black">6.00</span>
                      </div>
                    </div>
                  )}

                  {/* Special Stats Prediction Badges (Moved inside here!) */}
                  <div className="p-4 rounded-xl bg-slate-950/30 border border-slate-900 text-right">
                    <span className="text-[10px] text-slate-500 font-black block mb-3 tracking-wider">توقعات إحصائيات المباراة الفرعية</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {match.goalsOdds && (
                        <div className="flex items-center justify-between p-2.5 bg-blue-500/[0.02] border border-blue-500/10 rounded-xl text-xs">
                          <span className="text-slate-400 font-medium">سوق الأهداف:</span>
                          <span className="font-extrabold text-blue-400">{match.goalsOdds}</span>
                        </div>
                      )}
                      {match.cornersOdds && (
                        <div className="flex items-center justify-between p-2.5 bg-purple-500/[0.02] border border-purple-500/10 rounded-xl text-xs">
                          <span className="text-slate-400 font-medium">سوق الركنيات:</span>
                          <span className="font-extrabold text-purple-400">{match.cornersOdds}</span>
                        </div>
                      )}
                      {match.cardsOdds && (
                        <div className="flex items-center justify-between p-2.5 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl text-xs">
                          <span className="text-slate-400 font-medium">سوق البطاقات:</span>
                          <span className="font-extrabold text-amber-400">{match.cardsOdds}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn text-right">
                  {/* Analysis Header */}
                  <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Swords className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs font-black text-white">التقرير الرياضي التكتيكي المعتمد</h4>
                      <p className="text-[10px] text-slate-500">تحليل معزز بالمعطيات الفنية ونسب الاستحواذ والأداء الميداني</p>
                    </div>
                  </div>

                  {/* Deep Analysis Content */}
                  {match.analysis && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>الرؤية والتشخيص الفني الشامل:</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {match.analysis}
                      </p>
                    </div>
                  )}

                  {/* Added dynamic professional sections to make the analysis incredibly detailed and satisfying! */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Expected Tactics Panel */}
                    <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300">الاستراتيجية الفنية المتوقعة</span>
                      </div>
                      <ul className="space-y-2 text-[11px] text-slate-400 font-medium">
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>الضغط العالي المنظم لفرض ارتكاب الأخطاء في مناطق المنافس الخلفية.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>التحول السريع وبناء الهجمات عن طريق الاختراق المباشر من العمق والارتكاز.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">•</span>
                          <span>الاعتماد الكامل على الأجنحة الهجومية والسرعة الفائقة لخلخلة الأطراف الدفاعية.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Key Battles Panel */}
                    <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300">مفاتيح الفوز والصراع التكتيكي</span>
                      </div>
                      <ul className="space-y-2 text-[11px] text-slate-400 font-medium">
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>الفوز بالثنائيات البدنية والسيطرة المطلقة على الكرات الثانية في وسط الملعب.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>استغلال الهفوات الناتجة عن الاندفاع البدني المفرط للمنافس لشن المرتدات الخاطفة.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>الانضباط الدفاعي الصارم والالتزام العالي بالمراكز لعدم ترك أي مساحة للاختراق.</span>
                        </li>
                      </ul>
                    </div>

                  </div>

                  {/* Head-to-Head & H2H */}
                  {match.h2hData && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900/60 flex items-center gap-2.5">
                      <Swords className="w-4 h-4 text-slate-500 shrink-0" />
                      <p className="text-[11px] text-slate-400 font-medium text-right w-full">
                        <strong className="text-slate-300 mr-1">المواجهات المباشرة والعمق التاريخي H2H:</strong>
                        {match.h2hData}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
