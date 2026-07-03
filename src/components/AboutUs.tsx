import { ShieldCheck, Zap, Mail, Award, Key, Compass } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4" id="about-us-container">
      
      {/* Editorial Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">من نحن</span>
        <h2 className="text-2xl font-black text-white">منصة سوبرتاك المتكاملة لتوقعات كرة القدم</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          نحن نوفر لقرائنا ومحبي المراهنات الرياضية تحليلات رياضية فائقة الدقة مبنية على الذكاء الاصطناعي والإحصائيات التراكمية.
        </p>
      </div>

      {/* Grid of Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-white">توقعات دقيقة</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            نعتمد على خوارزميات إحصائية ومحاكاة المباريات لمئات المرات لتقديم أدق توقعات الأهداف، الركنيات، والبطاقات.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white">حماية وتشفير VIP</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            محتوى متميز لبعض المباريات متاح فقط لأصحاب الأكواد الذهبية. يتم تأمين التحليلات بالكامل من الخادم لمنع تسريبها.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Compass className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">شامل تكتيكياً</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            لا نكتفي بذكر النتيجة المتوقعة بل نمنحك تحليلاً كاملاً لكيفية سير اللقاء والتشكيلة المتوقعة والخطط التكتيكية.
          </p>
        </div>

      </div>

      {/* Help Section */}
      <div className="p-6 bg-gradient-to-r from-blue-950/40 to-slate-900/40 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right md:text-right">
          <div className="flex items-center gap-2 justify-start">
            <Award className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">كيف يمكنني الحصول على كود تفعيل VIP؟</h4>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            يمكنك الحصول على كود تفعيل VIP تجريبي أو ذهبي مجاناً بالانضمام لقناتنا الرسمية على تلجرام، أو عبر مراسلة فريق المبيعات للحصول على باقة اشتراك مخصصة ومباريات بنسب نجاح تفوق 90%.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href="https://t.me/your_telegram_channel"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs text-center transition-colors"
          >
            انضم لقناة تلجرام ✈️
          </a>
          <button
            onClick={() => alert("يرجى التواصل عبر البريد الإلكتروني للحصول على الأكواد: mimi081117@gmail.com")}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs text-center transition-colors"
          >
            طلب كود تفعيل ✉️
          </button>
        </div>
      </div>

    </div>
  );
}
