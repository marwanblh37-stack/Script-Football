import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import MatchCard from "./components/MatchCard";
import AboutUs from "./components/AboutUs";
import AdminPanel from "./components/AdminPanel";
import { Match, DashboardStats } from "./types";
import { Search, Compass, ShieldCheck, Flame, Sparkles, MessageCircle, AlertCircle } from "lucide-react";

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "matches" | "about">("home");
  const [selectedDate, setSelectedDate] = useState<string>("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  
  // VIP status states
  const [vipCode, setVipCode] = useState<string>(() => {
    return localStorage.getItem("vip_activation_code") || "";
  });
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Hidden/Secret Admin Mode
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return window.location.pathname === "/secret-manage-2026";
  });

  useEffect(() => {
    // Listen to route changes
    const handleLocationChange = () => {
      setIsAdminMode(window.location.pathname === "/secret-manage-2026");
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateToAdmin = (enable: boolean) => {
    if (enable) {
      window.history.pushState({}, "", "/secret-manage-2026");
      setIsAdminMode(true);
    } else {
      window.history.pushState({}, "", "/");
      setIsAdminMode(false);
    }
  };

  // Fetch matches from server
  const fetchMatchesData = async () => {
    try {
      // Pass the activation code to the server so that VIP data is securely returned if validated!
      const codeParam = vipCode ? `?code=${encodeURIComponent(vipCode)}` : "";
      const res = await fetch(`/api/matches${codeParam}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
        setIsUnlocked(data.isUnlocked);
      }
    } catch (err) {
      console.error("Failed to fetch matches", err);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, [vipCode]);

  // Activation code submit helper
  const handleActivateCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      if (res.ok) {
        localStorage.setItem("vip_activation_code", code.trim());
        setVipCode(code.trim());
        setIsUnlocked(true);
        fetchMatchesData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Extract unique match days for the filter row dynamically from matches list
  const availableDates = ["الكل", ...Array.from(new Set(matches.map(m => m.date).filter(Boolean)))];

  // Filtered matches list
  const filteredMatches = matches.filter((m) => {
    const matchDate = m.date || "";
    const dateOk = selectedDate === "الكل" || matchDate.trim() === selectedDate.trim();
    
    const homeName = m.homeTeam || "";
    const awayName = m.awayTeam || "";
    const searchOk = searchQuery.trim() === "" || 
      homeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      awayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.group?.toLowerCase().includes(searchQuery.toLowerCase());

    return dateOk && searchOk;
  });

  // Calculate dynamic dashboard stats based on loaded matches
  const stats: DashboardStats = {
    totalMatches: matches.length,
    successfulPredictions: Math.round(matches.length * 0.77), // realistic success prediction mock
    accuracyRate: 78,
    averageGoals: 2.8,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950" id="app-root">
      
      {/* Visual background atmospheric shapes */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-950/20 via-purple-950/10 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <Header
        vipCode={vipCode}
        setVipCode={setVipCode}
        isUnlocked={isUnlocked}
        onActivate={handleActivateCode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigateAdmin={() => navigateToAdmin(!isAdminMode)}
        isAdminMode={isAdminMode}
        onSetAdminMode={navigateToAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-10 relative z-10 space-y-8 md:space-y-12">
        
        {isAdminMode ? (
          /* SECRET ADMIN PANEL */
          <div className="animate-fadeIn">
            <AdminPanel onNotifyUpdate={fetchMatchesData} />
          </div>
        ) : (
          /* CUSTOMER HOME / VIEWER PAGES */
          <div className="space-y-8 md:space-y-12 animate-fadeIn">
            
            {/* 1. Hero Welcome & Title Section */}
            {activeTab === "home" && (
              <div className="text-center max-w-2xl mx-auto space-y-4 py-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>بطولة كأس النخبة والمباريات الدولية 2026</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  التحليل الدقيق والمتقدم وتوقعات <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">VIP</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                  توقعات احترافية مع أدق الاحتمالات، الركنيات، الكروت والتحليل الشامل التكتيكي لكل مباراة. استخدم كود VIP لفك قفل اللقاءات الممتازة.
                </p>
              </div>
            )}

            {/* 2. Stats KPI Tiles */}
            {activeTab === "home" && (
              <StatsCards stats={stats} />
            )}

            {/* 3. Main Matches and Analysis Grid view */}
            {(activeTab === "home" || activeTab === "matches") && (
              <div className="space-y-6">
                
                {/* Search & Date Filters Row */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-900">
                  
                  {/* Dates Row selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    {availableDates.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedDate === d
                            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/10"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/40"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full lg:w-80">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="ابحث عن منتخب أو بطولة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      dir="rtl"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-850 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-semibold text-white placeholder-slate-500 transition-colors"
                    />
                  </div>

                </div>

                {/* Grid of Matches */}
                {filteredMatches.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/20 border border-slate-900 rounded-3xl space-y-3">
                    <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-300">لا توجد مباريات مطابقة للبحث حالياً</h4>
                    <p className="text-xs text-slate-500">يرجى تغيير تصنيف اليوم أو كتابة اسم منتخب آخر.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="matches-grid">
                    {filteredMatches.map((m) => (
                      <div key={m.id}>
                        <MatchCard
                          match={m}
                          isUnlocked={isUnlocked}
                          onActivateCode={handleActivateCode}
                        />
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* 4. About Us Page Tab */}
            {activeTab === "about" && (
              <AboutUs />
            )}

          </div>
        )}

      </main>

      {/* Footer Contact Telegram Banner */}
      <footer className="mt-auto border-t border-slate-900/60 bg-slate-950" id="main-footer">
        
        {/* Telegram Invitation card */}
        {!isAdminMode && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-slate-900/60 rounded-3xl border border-blue-900/30 text-center space-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-12 h-12 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">انضم لقناتنا الرسمية على تليجرام ✈️</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  احصل على توصيات مباشرة مجانية يومياً، أكواد تفعيل VIP مجانية، وتنبيهات اللقاءات الكبرى قبل ركلة البداية!
                </p>
              </div>

              <a
                href="https://t.me/your_telegram_channel"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs tracking-wide shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <span>انضم الآن مجاناً ✈️</span>
              </a>
            </div>
          </div>
        )}

        {/* Bottom copyright details */}
        <div className="bg-slate-950/80 border-t border-slate-900/60 py-6 text-center text-[10px] text-slate-500 font-medium">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} سوبرتاك PREDICTIONS. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4">
              <span className="cursor-pointer hover:text-slate-300" onClick={() => navigateToAdmin(!isAdminMode)}>
                لوحة تحكم الإدارة السرية 👑
              </span>
              <span className="text-slate-800">|</span>
              <a href="mailto:mimi081117@gmail.com" className="hover:text-slate-300">
                mimi081117-png.github.io
              </a>
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}
