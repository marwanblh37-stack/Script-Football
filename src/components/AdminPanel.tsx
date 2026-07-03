import React, { useState, useEffect } from "react";
import { 
  Plus, Trash, Edit2, ShieldCheck, Sparkles, Key, Check, 
  Database, RefreshCw, Eye, Lock, ToggleLeft, ToggleRight, X, AlertTriangle, FileText
} from "lucide-react";
import { Match, ActivationCode } from "../types";

interface AdminPanelProps {
  onNotifyUpdate: () => void;
}

export default function AdminPanel({ onNotifyUpdate }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"matches" | "codes" | "backup">("matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form State for creating/editing a Match
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchForm, setMatchForm] = useState({
    homeTeam: "",
    homeLogo: "⚽",
    awayTeam: "",
    awayLogo: "⚽",
    group: "المجموعة 1",
    time: "20:00",
    date: "25 يونيو",
    isVIP: false,
    odds1: "1.70",
    oddsX: "3.40",
    odds2: "4.20",
    oddsOver: "1.85",
    oddsUnder: "1.95",
    probHome: 50,
    probDraw: 30,
    probAway: 20,
    cornersOdds: "أكثر من 8.5 ركنية",
    cardsOdds: "أقل من 3.5 بطاقة",
    goalsOdds: "أكثر من 1.5 هدف",
    primaryPrediction: "فوز المضيف أو تعادل + أكثر من 1.5 هدف",
    secondaryPrediction: "كلا الفريقين يسجلان (نعم)",
    primaryOdds: "1.75",
    secondaryOdds: "1.90",
    correctScore: "2 - 1 أو 1 - 1",
    analysis: "تحليل تكتيكي مفصل يتوقع أفضلية نسبية لأصحاب الأرض بسبب الاستقرار الفني وجودة الهجوم.",
    h2hData: "المواجهات المباشرة متكافئة تاريخياً بانتصارين لكل طرف.",
    homeFormStr: "W,D,W,L,W",
    awayFormStr: "W,L,L,D,W"
  });

  // Code form
  const [newCode, setNewCode] = useState("");
  const [newCodeNote, setNewCodeNote] = useState("");

  // Raw DB editor
  const [rawDbJson, setRawDbJson] = useState("");

  useEffect(() => {
    fetchMatches();
    fetchCodes();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/codes");
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini AI Generation for match details
  const handleAiGenerate = async () => {
    if (!matchForm.homeTeam || !matchForm.awayTeam) {
      setMessage({ text: "يرجى كتابة اسم الفريق المستضيف والضيف أولاً لتوليد التحليل!", isError: true });
      return;
    }

    setAiLoading(true);
    setMessage({ text: "جاري تحليل المعطيات وتوليد التوقعات عبر الذكاء الاصطناعي... 🤖✨", isError: false });

    try {
      const res = await fetch("/api/admin/generate-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: matchForm.homeTeam,
          awayTeam: matchForm.awayTeam,
          group: matchForm.group,
          date: matchForm.date,
          time: matchForm.time
        })
      });

      if (res.ok) {
        const aiData = await res.json();
        setMatchForm(prev => ({
          ...prev,
          group: aiData.group || prev.group,
          time: aiData.time || prev.time,
          date: aiData.date || prev.date,
          odds1: aiData.odds1X2?.home || prev.odds1,
          oddsX: aiData.odds1X2?.draw || prev.oddsX,
          odds2: aiData.odds1X2?.away || prev.odds2,
          oddsOver: aiData.oddsOverUnder?.over || prev.oddsOver,
          oddsUnder: aiData.oddsOverUnder?.under || prev.oddsUnder,
          probHome: aiData.probability?.home || prev.probHome,
          probDraw: aiData.probability?.draw || prev.probDraw,
          probAway: aiData.probability?.away || prev.probAway,
          cornersOdds: aiData.cornersOdds || prev.cornersOdds,
          cardsOdds: aiData.cardsOdds || prev.cardsOdds,
          goalsOdds: aiData.goalsOdds || prev.goalsOdds,
          primaryPrediction: aiData.primaryPrediction || prev.primaryPrediction,
          secondaryPrediction: aiData.secondaryPrediction || prev.secondaryPrediction,
          primaryOdds: aiData.primaryOdds || prev.primaryOdds,
          secondaryOdds: aiData.secondaryOdds || prev.secondaryOdds,
          correctScore: aiData.correctScore || prev.correctScore,
          analysis: aiData.analysis || prev.analysis,
          h2hData: aiData.h2hData || prev.h2hData,
          homeFormStr: aiData.homeForm ? aiData.homeForm.join(",") : prev.homeFormStr,
          awayFormStr: aiData.awayForm ? aiData.awayForm.join(",") : prev.awayFormStr,
        }));
        setMessage({ text: "تم توليد التحليل الرياضي والتوقعات بنجاح عبر الذكاء الاصطناعي! 🤖✨", isError: false });
      } else {
        const errData = await res.json();
        setMessage({ text: errData.error || "حدث خطأ أثناء توليد التحليل.", isError: true });
      }
    } catch (err) {
      setMessage({ text: "تعذر الاتصال بالخادم لتوليد التوقعات الذكية.", isError: true });
    } finally {
      setAiLoading(false);
    }
  };

  const resetMatchForm = () => {
    setEditingMatchId(null);
    setMatchForm({
      homeTeam: "",
      homeLogo: "⚽",
      awayTeam: "",
      awayLogo: "⚽",
      group: "المجموعة 1",
      time: "20:00",
      date: "25 يونيو",
      isVIP: false,
      odds1: "1.70",
      oddsX: "3.40",
      odds2: "4.20",
      oddsOver: "1.85",
      oddsUnder: "1.95",
      probHome: 50,
      probDraw: 30,
      probAway: 20,
      cornersOdds: "أكثر من 8.5 ركنية",
      cardsOdds: "أقل من 3.5 بطاقة",
      goalsOdds: "أكثر من 1.5 هدف",
      primaryPrediction: "فوز المضيف أو تعادل + أكثر من 1.5 هدف",
      secondaryPrediction: "كلا الفريقين يسجلان (نعم)",
      primaryOdds: "1.75",
      secondaryOdds: "1.90",
      correctScore: "2 - 1 أو 1 - 1",
      analysis: "تحليل تكتيكي مفصل يتوقع أفضلية نسبية لأصحاب الأرض بسبب الاستقرار الفني وجودة الهجوم.",
      h2hData: "المواجهات المباشرة متكافئة تاريخياً بانتصارين لكل طرف.",
      homeFormStr: "W,D,W,L,W",
      awayFormStr: "W,L,L,D,W"
    });
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm.homeTeam || !matchForm.awayTeam) return;

    setLoading(true);
    const payload = {
      homeTeam: matchForm.homeTeam,
      homeLogo: matchForm.homeLogo,
      awayTeam: matchForm.awayTeam,
      awayLogo: matchForm.awayLogo,
      group: matchForm.group,
      time: matchForm.time,
      date: matchForm.date,
      isVIP: matchForm.isVIP,
      odds1X2: { home: matchForm.odds1, draw: matchForm.oddsX, away: matchForm.odds2 },
      oddsOverUnder: { over: matchForm.oddsOver, under: matchForm.oddsUnder },
      probability: { home: Number(matchForm.probHome), draw: Number(matchForm.probDraw), away: Number(matchForm.probAway) },
      cornersOdds: matchForm.cornersOdds,
      cardsOdds: matchForm.cardsOdds,
      goalsOdds: matchForm.goalsOdds,
      primaryPrediction: matchForm.primaryPrediction,
      secondaryPrediction: matchForm.secondaryPrediction,
      primaryOdds: matchForm.primaryOdds,
      secondaryOdds: matchForm.secondaryOdds,
      correctScore: matchForm.correctScore,
      analysis: matchForm.analysis,
      h2hData: matchForm.h2hData,
      homeForm: matchForm.homeFormStr.split(",").map(s => s.trim().toUpperCase()),
      awayForm: matchForm.awayFormStr.split(",").map(s => s.trim().toUpperCase()),
    };

    try {
      const url = editingMatchId ? `/api/admin/matches/${editingMatchId}` : "/api/admin/matches";
      const method = editingMatchId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ text: editingMatchId ? "تم تعديل المباراة بنجاح!" : "تم إضافة المباراة بنجاح!", isError: false });
        resetMatchForm();
        fetchMatches();
        onNotifyUpdate();
      } else {
        setMessage({ text: "فشل حفظ بيانات المباراة.", isError: true });
      }
    } catch (err) {
      setMessage({ text: "خطأ في الاتصال بالخادم.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (m: Match) => {
    setEditingMatchId(m.id);
    setMatchForm({
      homeTeam: m.homeTeam,
      homeLogo: m.homeLogo || "⚽",
      awayTeam: m.awayTeam,
      awayLogo: m.awayLogo || "⚽",
      group: m.group || "المجموعة 1",
      time: m.time || "20:00",
      date: m.date || "25 يونيو",
      isVIP: !!m.isVIP,
      odds1: m.odds1X2?.home || "1.70",
      oddsX: m.odds1X2?.draw || "3.40",
      odds2: m.odds1X2?.away || "4.20",
      oddsOver: m.oddsOverUnder?.over || "1.85",
      oddsUnder: m.oddsOverUnder?.under || "1.95",
      probHome: m.probability?.home || 50,
      probDraw: m.probability?.draw || 30,
      probAway: m.probability?.away || 20,
      cornersOdds: m.cornersOdds || "أكثر من 8.5 ركنية",
      cardsOdds: m.cardsOdds || "أقل من 3.5 بطاقة",
      goalsOdds: m.goalsOdds || "أكثر من 1.5 هدف",
      primaryPrediction: m.primaryPrediction || "",
      secondaryPrediction: m.secondaryPrediction || "",
      primaryOdds: m.primaryOdds || "1.75",
      secondaryOdds: m.secondaryOdds || "1.90",
      correctScore: m.correctScore || "",
      analysis: m.analysis || "",
      h2hData: m.h2hData || "",
      homeFormStr: m.homeForm ? m.homeForm.join(",") : "W,D,W,L,W",
      awayFormStr: m.awayForm ? m.awayForm.join(",") : "W,L,L,D,W"
    });
    // Scroll form into view
    document.getElementById("match-form-title")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المباراة نهائياً؟")) return;

    try {
      const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "تم حذف المباراة بنجاح.", isError: false });
        fetchMatches();
        onNotifyUpdate();
      } else {
        setMessage({ text: "فشل حذف المباراة.", isError: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Code CRUD
  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, note: newCodeNote })
      });

      if (res.ok) {
        setMessage({ text: "تم إضافة كود التفعيل الجديد بنجاح!", isError: false });
        setNewCode("");
        setNewCodeNote("");
        fetchCodes();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "فشل إضافة الكود", isError: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCode = async (codeStr: string) => {
    try {
      const res = await fetch(`/api/admin/codes/${codeStr}/toggle`, { method: "PUT" });
      if (res.ok) {
        fetchCodes();
        setMessage({ text: "تم تعديل حالة كود التفعيل.", isError: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCode = async (codeStr: string) => {
    if (!confirm(`هل تريد حذف الكود [${codeStr}] نهائياً؟`)) return;

    try {
      const res = await fetch(`/api/admin/codes/${codeStr}`, { method: "DELETE" });
      if (res.ok) {
        fetchCodes();
        setMessage({ text: "تم حذف كود التفعيل بنجاح.", isError: false });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRandomCode = () => {
    const random = "VIP-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
    setNewCode(random);
  };

  return (
    <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 md:p-8 space-y-6" id="admin-panel-container">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-black tracking-wider">
              SECRET PANEL
            </span>
            <h2 className="text-xl font-black text-white">لوحة تحكم المشرف السرية 👑</h2>
          </div>
          <p className="text-xs text-slate-400">إدارة المباريات، تفعيل الذكاء الاصطناعي، وإنتاج أكواد الـ VIP والمحتوى الرياضي.</p>
        </div>
        
        {/* Quick metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">المباريات</span>
            <span className="text-sm font-black text-white font-mono">{matches.length}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">VIP نشط</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {matches.filter(m => m.isVIP).length}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block">أكواد التفعيل</span>
            <span className="text-sm font-black text-blue-400 font-mono">{codes.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
          message.isError 
            ? "bg-red-950/40 border-red-900/50 text-red-400" 
            : "bg-emerald-950/40 border-emerald-900/50 text-emerald-400"
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${message.isError ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`} />
            <p>{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("matches")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === "matches"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          إدارة المباريات والمقالات
        </button>
        <button
          onClick={() => setActiveSubTab("codes")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === "codes"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          أكواد الـ VIP والاشتراكات
        </button>
      </div>

      {/* SUB TAB 1: MATCHES */}
      {activeSubTab === "matches" && (
        <div className="space-y-8">
          
          {/* Matches List Grid */}
          <div>
            <h3 className="text-sm font-black text-slate-300 mb-4">قائمة المباريات المتاحة حالياً</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {m.homeTeam} {m.homeLogo} × {m.awayTeam} {m.awayLogo}
                      </span>
                      {m.isVIP ? (
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-bold">
                          VIP
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded font-bold">
                          مجاني
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {m.group} | {m.date} - {m.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(m)}
                      title="تعديل"
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(m.id)}
                      title="حذف"
                      className="p-2 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create/Edit Form */}
          <div className="p-6 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-sm font-black text-white" id="match-form-title">
                {editingMatchId ? "تعديل بيانات المباراة الحالية 📝" : "إضافة مباراة تحليلية جديدة ⚽"}
              </h3>
              {editingMatchId && (
                <button
                  onClick={resetMatchForm}
                  className="text-xs text-red-400 hover:underline"
                >
                  إلغاء التعديل والعودة للإضافة
                </button>
              )}
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-5">
              
              {/* Teams & Logos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">الفريق المستضيف (أرضه)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اسم المستضيف، مثل: ألمانيا"
                      value={matchForm.homeTeam}
                      onChange={(e) => setMatchForm({ ...matchForm, homeTeam: e.target.value })}
                      required
                      className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="علم"
                      value={matchForm.homeLogo}
                      onChange={(e) => setMatchForm({ ...matchForm, homeLogo: e.target.value })}
                      className="w-12 p-2 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">الفريق الضيف</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اسم الضيف، مثل: الإكوادور"
                      value={matchForm.awayTeam}
                      onChange={(e) => setMatchForm({ ...matchForm, awayTeam: e.target.value })}
                      required
                      className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="علم"
                      value={matchForm.awayLogo}
                      onChange={(e) => setMatchForm({ ...matchForm, awayLogo: e.target.value })}
                      className="w-12 p-2 text-center bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Group, Time, Date & VIP Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">المجموعة / الدوري</label>
                  <input
                    type="text"
                    value={matchForm.group}
                    onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">التاريخ</label>
                  <input
                    type="text"
                    value={matchForm.date}
                    onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">التوقيت</label>
                  <input
                    type="text"
                    value={matchForm.time}
                    onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 border border-slate-800 rounded-xl text-xs text-white">
                    <input
                      type="checkbox"
                      checked={matchForm.isVIP}
                      onChange={(e) => setMatchForm({ ...matchForm, isVIP: e.target.checked })}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      مباراة VIP مشفرة
                    </span>
                  </label>
                </div>
              </div>

              {/* AI Auto-Generation Trigger Banner (Magnificent CMS tool!) */}
              <div className="p-4 bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-950/50 rounded-2xl border border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                    <h4 className="text-xs font-black text-white">مولد التحليلات التلقائي بالذكاء الاصطناعي</h4>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    اكتب اسم الفريقين وسيقوم الذكاء الاصطناعي من جوجل (Gemini) بملء كل التوقعات، النسب، والتحليل الفني بالعربية الفصحى فوراً!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !matchForm.homeTeam || !matchForm.awayTeam}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {aiLoading ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      جاري التوليد...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ولد بالذكاء الاصطناعي ✨</span>
                    </>
                  )}
                </button>
              </div>

              {/* Public Odds & Probabilities */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[11px] font-black text-slate-400 block border-b border-slate-850 pb-1.5">أرقام ونسب المباريات العامة</span>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">فوز المضيف (Odds 1)</label>
                    <input
                      type="text"
                      value={matchForm.odds1}
                      onChange={(e) => setMatchForm({ ...matchForm, odds1: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">تعادل (Odds X)</label>
                    <input
                      type="text"
                      value={matchForm.oddsX}
                      onChange={(e) => setMatchForm({ ...matchForm, oddsX: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">فوز الضيف (Odds 2)</label>
                    <input
                      type="text"
                      value={matchForm.odds2}
                      onChange={(e) => setMatchForm({ ...matchForm, odds2: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">أكثر من 2.5 هدف</label>
                    <input
                      type="text"
                      value={matchForm.oddsOver}
                      onChange={(e) => setMatchForm({ ...matchForm, oddsOver: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">أقل من 2.5 هدف</label>
                    <input
                      type="text"
                      value={matchForm.oddsUnder}
                      onChange={(e) => setMatchForm({ ...matchForm, oddsUnder: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Probabilities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">احتمالية فوز المضيف (%)</label>
                    <input
                      type="number"
                      value={matchForm.probHome}
                      onChange={(e) => setMatchForm({ ...matchForm, probHome: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">احتمالية التعادل (%)</label>
                    <input
                      type="number"
                      value={matchForm.probDraw}
                      onChange={(e) => setMatchForm({ ...matchForm, probDraw: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">احتمالية فوز الضيف (%)</label>
                    <input
                      type="number"
                      value={matchForm.probAway}
                      onChange={(e) => setMatchForm({ ...matchForm, probAway: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Stickers (Corners, Cards, Goals) */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[11px] font-black text-slate-400 block border-b border-slate-850 pb-1.5">ستيكرز البيانات والإحصائيات</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">توقع الركنيات</label>
                    <input
                      type="text"
                      value={matchForm.cornersOdds}
                      onChange={(e) => setMatchForm({ ...matchForm, cornersOdds: e.target.value })}
                      placeholder="أكثر من 8.5 ركنية"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">توقع البطاقات والإنذارات</label>
                    <input
                      type="text"
                      value={matchForm.cardsOdds}
                      onChange={(e) => setMatchForm({ ...matchForm, cardsOdds: e.target.value })}
                      placeholder="أقل من 3.5 بطاقة"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">توقع الأهداف الإجمالي</label>
                    <input
                      type="text"
                      value={matchForm.goalsOdds}
                      onChange={(e) => setMatchForm({ ...matchForm, goalsOdds: e.target.value })}
                      placeholder="أكثر من 1.5 هدف"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Predictions (VIP elements) */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-4">
                <span className="text-[11px] font-black text-slate-400 block border-b border-slate-850 pb-1.5">التوقعات المشفرة بالـ VIP (مخفية للزوار العاديين)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 block">التوقع الأساسي</label>
                    <textarea
                      rows={2}
                      value={matchForm.primaryPrediction}
                      onChange={(e) => setMatchForm({ ...matchForm, primaryPrediction: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500">معامل رهان أساسي:</span>
                      <input
                        type="text"
                        value={matchForm.primaryOdds}
                        onChange={(e) => setMatchForm({ ...matchForm, primaryOdds: e.target.value })}
                        className="w-20 p-1 bg-slate-900 border border-slate-800 rounded text-xs text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 block">التوقع الثانوي</label>
                    <textarea
                      rows={2}
                      value={matchForm.secondaryPrediction}
                      onChange={(e) => setMatchForm({ ...matchForm, secondaryPrediction: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500">معامل رهان ثانوي:</span>
                      <input
                        type="text"
                        value={matchForm.secondaryOdds}
                        onChange={(e) => setMatchForm({ ...matchForm, secondaryOdds: e.target.value })}
                        className="w-20 p-1 bg-slate-900 border border-slate-800 rounded text-xs text-white text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">النتيجة الدقيقة المستهدفة (Correct Score)</label>
                    <input
                      type="text"
                      value={matchForm.correctScore}
                      onChange={(e) => setMatchForm({ ...matchForm, correctScore: e.target.value })}
                      placeholder="2 - 1 أو 3 - 1"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">المواجهات المباشرة H2H</label>
                    <input
                      type="text"
                      value={matchForm.h2hData}
                      onChange={(e) => setMatchForm({ ...matchForm, h2hData: e.target.value })}
                      placeholder="ألمانيا متفوقة بـ 4 انتصارات"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Tactical Analysis box */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] text-slate-500 block">التحليل الفني والتاكتيكي الشامل</label>
                  <textarea
                    rows={3}
                    value={matchForm.analysis}
                    onChange={(e) => setMatchForm({ ...matchForm, analysis: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Team Form values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">فورم المستضيف (مفصولة بفواصل، 5 أحرف W,D,L)</label>
                    <input
                      type="text"
                      value={matchForm.homeFormStr}
                      onChange={(e) => setMatchForm({ ...matchForm, homeFormStr: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">فورم الضيف (مفصولة بفواصل، 5 أحرف W,D,L)</label>
                    <input
                      type="text"
                      value={matchForm.awayFormStr}
                      onChange={(e) => setMatchForm({ ...matchForm, awayFormStr: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={resetMatchForm}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إعادة تهيئة
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "جاري الحفظ..." : editingMatchId ? "حفظ التعديلات" : "إضافة المباراة للجدول"}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* SUB TAB 2: CODES */}
      {activeSubTab === "codes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Code Form */}
            <div className="md:col-span-1 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-white">إضافة كود تفعيل VIP جديد</h3>
              
              <form onSubmit={handleAddCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 block">كود التفعيل (أو كود عشوائي)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VIP-XXXX"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                      className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-xl border border-slate-700 cursor-pointer"
                    >
                      عشوائي
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 block">ملاحظة الكود (من صاحب الكود؟)</label>
                  <input
                    type="text"
                    placeholder="مثال: اشتراك تجريبي لمشترك تليجرام"
                    value={newCodeNote}
                    onChange={(e) => setNewCodeNote(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إنشاء كود التفعيل
                </button>
              </form>
            </div>

            {/* List Codes */}
            <div className="md:col-span-2 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-white">الأكواد الفعالة وقائمة الاشتراكات</h3>
              
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                {codes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">لا توجد أكواد مضافة حالياً.</p>
                ) : (
                  codes.map((c) => (
                    <div key={c.code} className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-blue-400 tracking-wider">
                            {c.code}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                            c.isActive 
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}>
                            {c.isActive ? "فعال" : "معطل"}
                          </span>
                        </div>
                        {c.note && <p className="text-[10px] text-slate-500">{c.note}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCode(c.code)}
                          title={c.isActive ? "تعطيل الكود" : "تفعيل الكود"}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          {c.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCode(c.code)}
                          title="حذف نهائياً"
                          className="p-1.5 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
