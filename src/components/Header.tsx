import React, { useState, useEffect } from "react";
import { Award, Shield, Key, Sparkles, Clock, LogOut } from "lucide-react";

interface HeaderProps {
  vipCode: string;
  setVipCode: (code: string) => void;
  isUnlocked: boolean;
  onActivate: (code: string) => Promise<boolean>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateAdmin: () => void;
  isAdminMode: boolean;
  onSetAdminMode: (enable: boolean) => void;
}

export default function Header({
  vipCode,
  setVipCode,
  isUnlocked,
  onActivate,
  activeTab,
  setActiveTab,
  onNavigateAdmin,
  isAdminMode,
  onSetAdminMode,
}: HeaderProps) {
  const [inputCode, setInputCode] = useState(vipCode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [utcTime, setUtcTime] = useState("");

  // Secret Click States
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sync internal state with prop
  useEffect(() => {
    setInputCode(vipCode);
  }, [vipCode]);

  // Real-time UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toUTCString().replace("GMT", "UTC");
      setUtcTime(utcString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const success = await onActivate(inputCode);
      if (success) {
        setMessage({ text: "تم تفعيل كود الـ VIP بنجاح! تم فتح التحليلات المشفرة. 🎉", isError: false });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ text: "كود التفعيل خاطئ أو غير فعال. يرجى التأكد من الكود.", isError: true });
      }
    } catch (err) {
      setMessage({ text: "فشل التحقق من الكود. حاول مرة أخرى.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setVipCode("");
    localStorage.removeItem("vip_activation_code");
    window.location.reload();
  };

  // Click handler on Logo/Title
  const handleLogoClick = () => {
    setActiveTab("home");
    
    const now = Date.now();
    if (now - lastClickTime < 1500) {
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      if (nextCount >= 3) {
        setIsPasswordModalOpen(true);
        setClickCount(0);
        setPasswordError("");
        setAdminPasswordInput("");
        setPasswordSuccess(false);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === "Blhrous14") {
      setPasswordSuccess(true);
      setPasswordError("");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        onSetAdminMode(true);
      }, 1000);
    } else {
      setPasswordError("كلمة المرور خاطئة! يرجى المحاولة مرة أخرى.");
    }
  };

  const handleCancelPassword = () => {
    setIsPasswordModalOpen(false);
    setAdminPasswordInput("");
    setPasswordError("");
  };

  return (
    <header className="relative overflow-hidden bg-slate-950 border-b border-slate-900/50" id="main-header">
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand (Clicking 3 times opens Admin login modal) */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-md font-mono tracking-wider shadow">
                  VIP SYSTEM
                </span>
                <h1 className="text-xl font-black text-white tracking-wide font-sans">
                  سوبرتاك <span className="text-amber-400">PREDICTIONS</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">التحليل الدقيق والمتقدم وتوقعات النخبة</p>
            </div>
          </div>

          {/* Time & Quick Links */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>مكة المكرمة: {new Date(new Date().getTime() + 3 * 3600 * 1000).toISOString().substr(11, 8)}</span>
              <span className="text-slate-600">|</span>
              <span>{utcTime || "تحميل الوقت..."}</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs and Activation Section */}
        <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900">
          
          {/* Navigation Menus */}
          <nav className="flex items-center gap-1.5 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/40 w-full lg:w-auto overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("home");
                if (isAdminMode) onNavigateAdmin(); // exit admin mode if any
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                activeTab === "home" && !isAdminMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveTab("matches");
                if (isAdminMode) onNavigateAdmin();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                activeTab === "matches" && !isAdminMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              جدول المباريات
            </button>
            <button
              onClick={() => {
                setActiveTab("about");
                if (isAdminMode) onNavigateAdmin();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                activeTab === "about" && !isAdminMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              عن الموقع
            </button>
            
            {/* Direct Admin Link indicator - ONLY visible when admin mode is active */}
            {isAdminMode && (
              <button
                onClick={onNavigateAdmin}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-shrink-0 flex items-center gap-1.5 border border-amber-500 bg-amber-500/10 text-amber-400 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>لوحة التحكم (نشطة)</span>
              </button>
            )}
          </nav>

          {/* Activation Code Block */}
          <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-3">
            {isUnlocked ? (
              <div className="flex items-center justify-between w-full md:w-auto gap-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-amber-400" />
                    تم تفعيل اشتراك VIP النخبة
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج وإغلاق الـ VIP"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleActivateSubmit} className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-60">
                  <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="ضع كود تفعيل VIP هنا..."
                    dir="rtl"
                    className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-semibold text-white placeholder-slate-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl text-xs hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/10 transition-all duration-300 disabled:opacity-50 flex-shrink-0 cursor-pointer"
                >
                  {loading ? "جاري التفعيل..." : "تفعيل الـ VIP"}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Floating System Messages */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fadeIn transition-all duration-300 ${
              message.isError
                ? "bg-red-950/40 border-red-900/50 text-red-400"
                : "bg-emerald-950/40 border-emerald-900/50 text-emerald-400"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${message.isError ? "bg-red-400" : "bg-emerald-400"}`} />
            <p className="flex-1">{message.text}</p>
          </div>
        )}

      </div>

      {/* Hidden Admin Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
            {/* Visual glow decoration inside modal */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">دخول لوحة التحكم</h3>
                <p className="text-xs text-slate-400 mt-1">يرجى إدخال كلمة المرور الخاصة بالإدارة لفتح النظام</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 relative z-10 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">كلمة المرور للإدارة</label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  autoFocus
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl text-sm text-center text-white tracking-widest placeholder-slate-600 transition-colors"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <p className="flex-1">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="flex-1">تم التحقق بنجاح! جاري الانتقال للوحة الإدارة...</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordSuccess}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl text-xs hover:from-amber-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  تأكيد الدخول
                </button>
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  disabled={passwordSuccess}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
