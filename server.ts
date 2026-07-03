import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Helper to ensure database is loaded and seeded if empty
function initializeDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultCodes = [
    { code: "VIP-2026", isActive: true, createdAt: new Date().toISOString(), note: "كود تفعيل VIP تجريبي" },
    { code: "GOLD-777", isActive: true, createdAt: new Date().toISOString(), note: "اشتراك ذهبي كامل" },
    { code: "FREE-TRIAL", isActive: true, createdAt: new Date().toISOString(), note: "فترة تجريبية مجانية" },
    { code: "EXPIRED-99", isActive: false, createdAt: new Date().toISOString(), note: "كود منتهي الصلاحية" }
  ];

  const defaultMatches = [
    {
      id: "m1",
      homeTeam: "أستراليا",
      homeLogo: "🇦🇺",
      awayTeam: "مصر",
      awayLogo: "🇪🇬",
      group: "بطولة النخبة الدولية",
      time: "21:00",
      date: "3 يوليو",
      isVIP: false,
      odds1X2: { home: "2.10", draw: "3.20", away: "3.40" },
      oddsOverUnder: { over: "2.10", under: "1.70" },
      probability: { home: 44, draw: 30, away: 26 },
      cornersOdds: "أكثر من 8.5 ركنية",
      cardsOdds: "أقل من 4.5 بطاقة",
      goalsOdds: "أقل من 2.5 هدف",
      primaryPrediction: "فوز أستراليا أو تعادل (1X) + أقل من 3.5 هدف إجمالي",
      secondaryPrediction: "أستراليا تفوز بفارق هدف واحد أو ينتهي اللقاء بالتعادل",
      primaryOdds: "1.65",
      secondaryOdds: "1.85",
      correctScore: "1 - 0 أو 1 - 1",
      analysis: "يتوقع خبراء سوبرتاك مواجهة بدنية عنيفة للغاية وصعبة تكتيكياً على كلا المنتخبين؛ حيث يعتمد المنتخب الأسترالي على الكرات العرضية الطويلة والاندفاع البدني الهائل والكرات الثابتة التي تشكل مصدر خطورة دائم. في المقابل، سيسعى الفراعنة للتنظيم الدفاعي المحكم في منتصف الملعب، ومحاولة شن هجمات مرتدة فائقة السرعة معتمدين على الأجنحة الهجومية الفعالة والتحولات الخاطفة من الخلف للأمام لضرب التكتل الأسترالي. المباراة ستكون معركة كسر عظام في خط الوسط والمنتخب الذي سيتحكم بالكرات الثانية سيكون الأقرب للتفوق.",
      h2hData: "التقيا في مواجهتين وديتين سابقاً، انتصار لأستراليا وتعادل واحد.",
      homeForm: ["W", "D", "W", "L", "W"],
      awayForm: ["D", "W", "D", "W", "L"]
    },
    {
      id: "m2",
      homeTeam: "الأرجنتين",
      homeLogo: "🇦🇷",
      awayTeam: "الرأس الأخضر",
      awayLogo: "🇨🇻",
      group: "بطولة النخبة الدولية",
      time: "01:00 (السبت)",
      date: "3 يوليو",
      isVIP: true,
      odds1X2: { home: "1.20", draw: "6.00", away: "13.00" },
      oddsOverUnder: { over: "1.65", under: "2.20" },
      probability: { home: 80, draw: 14, away: 6 },
      cornersOdds: "أكثر من 9.5 ركنية",
      cardsOdds: "أقل من 3.5 بطاقة",
      goalsOdds: "أكثر من 2.5 هدف",
      primaryPrediction: "فوز الأرجنتين هنديكاب (-1.5) - تفوق تام للتانغو",
      secondaryPrediction: "الأرجنتين تسجل في الشوطين + إجمالي الأهداف أكثر من 2.5",
      primaryOdds: "1.60",
      secondaryOdds: "1.95",
      correctScore: "3 - 0 أو 4 - 0 للأرجنتين",
      analysis: "يدخل منتخب التانغو الأرجنتيني اللقاء بتركيز تكتيكي كامل وبخيارات هجومية لا حصر لها، معتمدين على تدوير الكرة السريع والمثلثات الهجومية في أنصاف المساحات لخلخلة التكتل الدفاعي المتوقع للرأس الأخضر. في حين أن الرأس الأخضر يدرك تماماً فارق الإمكانيات الفردية، وسيلجأ إلى خطة دفاعية منخفضة للغاية (Low-Block) لغلق المنافذ مع الاعتماد على الكرات الطويلة العشوائية والتمركز البدني الصارم. نتوقع سيطرة أرجنتينية مطلقة وهجمات متتالية من الدقيقة الأولى مع ضغط مستمر لحسم النتيجة مبكراً.",
      h2hData: "مواجهة تاريخية أولى بين المنتخبين.",
      homeForm: ["W", "W", "W", "D", "W"],
      awayForm: ["W", "L", "D", "W", "L"]
    },
    {
      id: "m3",
      homeTeam: "كولومبيا",
      homeLogo: "🇨🇴",
      awayTeam: "غانا",
      awayLogo: "🇬🇭",
      group: "بطولة النخبة الدولية",
      time: "04:30 (السبت)",
      date: "3 يوليو",
      isVIP: true,
      odds1X2: { home: "1.80", draw: "3.50", away: "4.30" },
      oddsOverUnder: { over: "1.85", under: "1.95" },
      probability: { home: 53, draw: 27, away: 20 },
      cornersOdds: "أكثر من 9 ركنيات",
      cardsOdds: "أكثر من 4.5 بطاقة",
      goalsOdds: "أكثر من 1.5 هدف",
      primaryPrediction: "فوز كولومبيا (1) + كلا الفريقين يسجلان (نعم)",
      secondaryPrediction: "إجمالي الأهداف أكثر من 2.5 في مباراة هجومية مفتوحة",
      primaryOdds: "3.60",
      secondaryOdds: "1.90",
      correctScore: "2 - 1 أو 3 - 1 لصالح كولومبيا",
      analysis: "مباراة تعد بالكثير من الإثارة والأهداف نظراً للنزعة الهجومية الجريئة لمنتخب كولومبيا الذي يمتلك سرعات ومهارات لافتة على الأطراف، غير أن اندفاعهم للأمام يترك أحياناً مساحات شاغرة في الخلف. المنتخب الغاني يتميز ببنية جسدية جبارة وقدرة عالية على التحول السريع عبر الأجنحة والعمق، وسيحاول بكل قوة استغلال الثغرات الدفاعية لكولومبيا. نتوقع صراعاً هجومياً مفتوحاً ومتبادلاً بين الطرفين، حيث ستلعب الفعالية أمام المرمى والتركيز الذهني في الارتداد الدفاعي الدور الحاسم لإنهاء المباراة لصالح اللاتينيين.",
      h2hData: "آخر مواجهة ودية انتهت بفوز كولومبيا بهدف نظيف.",
      homeForm: ["W", "W", "D", "W", "D"],
      awayForm: ["L", "W", "D", "L", "W"]
    },
    {
      id: "m4",
      homeTeam: "كندا",
      homeLogo: "🇨🇦",
      awayTeam: "المغرب",
      awayLogo: "🇲🇦",
      group: "دور الـ 16",
      time: "20:00",
      date: "السبت 4 يوليو",
      isVIP: true,
      odds1X2: { home: "3.80", draw: "3.30", away: "1.95" },
      oddsOverUnder: { over: "1.95", under: "1.80" },
      probability: { home: 24, draw: 29, away: 47 },
      cornersOdds: "أكثر من 8.5 ركنية",
      cardsOdds: "أكثر من 3.5 بطاقة",
      goalsOdds: "أكثر من 1.5 هدف",
      primaryPrediction: "فوز المغرب (2) أو تعادل + أقل من 3.5 هدف",
      secondaryPrediction: "تأهل المغرب للدور القادم (مباشر أو تمديد)",
      primaryOdds: "1.65",
      secondaryOdds: "1.45",
      correctScore: "0 - 1 أو 1 - 2 لأسود الأطلس",
      analysis: "يخوض أسود الأطلس هذه المواجهة الإقصائية الحاسمة بأفضلية واضحة على مستوى الخبرة والتنظيم التكتيكي الصارم الذي قادهم لإنجازات مونديالية تاريخية. المنتخب المغربي يعتمد على غلق المساحات تماماً بوسط الملعب، واللعب الجماعي المترابط مع مهارات فردية هجومية حاسمة تصنع الفارق من أنصاف الفرص وضرب دفاع كندا الهش بالمرتدات. كندا منتخب شاب وطموح يتميز بريتم سريع واندفاع بدني، لكن قلة الخبرة في مواجهات خروج المغلوب ستمثل عقبة كبرى أمام الصلابة المغربية والتحضير الذهني العالي لرفاق حكيمي.",
      h2hData: "تواجه الفريقان في كأس العالم الأخيرة وانتهت بفوز المغرب 2-1.",
      homeForm: ["W", "L", "W", "D", "L"],
      awayForm: ["W", "W", "D", "W", "W"]
    },
    {
      id: "m5",
      homeTeam: "باراجواي",
      homeLogo: "🇵🇾",
      awayTeam: "فرنسا",
      awayLogo: "🇫🇷",
      group: "دور الـ 16",
      time: "00:00 منتصف الليل",
      date: "الأحد 5 يوليو",
      isVIP: true,
      odds1X2: { home: "6.50", draw: "4.20", away: "1.45" },
      oddsOverUnder: { over: "1.80", under: "2.00" },
      probability: { home: 14, draw: 22, away: 64 },
      cornersOdds: "أكثر من 9 ركنيات",
      cardsOdds: "أكثر من 4.5 بطاقة",
      goalsOdds: "أكثر من 2.5 هدف",
      primaryPrediction: "فوز فرنسا (2) + إجمالي الأهداف أكثر من 1.5 في اللقاء",
      secondaryPrediction: "فرنسا تسجل أكثر من 1.5 هدف فردي في شباك باراجواي",
      primaryOdds: "1.70",
      secondaryOdds: "1.62",
      correctScore: "0 - 2 أو 1 - 3 لصالح فرنسا",
      analysis: "تمثل هذه المباراة صراعاً كلاسيكياً بين القوة الهجومية الضاربة والخبرة العميقة للمنتخب الفرنسي المدجج بنجوم الصف الأول، وبين الدفاع المستميت والعنيف لمنتخب باراجواي اللاتيني. فرنسا تمتلك حلولاً فردية وتكتيكية خارقة في الثلث الهجومي تجعلها قادرة على تفكيك أي تكتل دفاعي مع تدوير هادئ للكرة. من جانبها، ستلعب باراجواي بروح قتالية عالية ودفاع حديدي متكامل في محاولة واضحة لعرقلة المفاتيح الفرنسية وجر اللقاء للأشواط الإضافية، لكن تفوق الديوك التكتيكي سينتصر بالصبر.",
      h2hData: "التقيا في ثمن نهائي مونديال 1998 وانتهت بفوز فرنسا بالصعوبة عبر الهدف الذهبي للوران بلان.",
      homeForm: ["D", "W", "L", "D", "W"],
      awayForm: ["W", "D", "W", "W", "L"]
    },
    {
      id: "m6",
      homeTeam: "البرازيل",
      homeLogo: "🇧🇷",
      awayTeam: "النرويج",
      awayLogo: "🇳🇴",
      group: "دور الـ 16",
      time: "23:00",
      date: "الأحد 5 يوليو",
      isVIP: false,
      odds1X2: { home: "1.60", draw: "3.90", away: "5.20" },
      oddsOverUnder: { over: "1.75", under: "2.10" },
      probability: { home: 60, draw: 24, away: 16 },
      cornersOdds: "أكثر من 9.5 ركنية",
      cardsOdds: "أقل من 3.5 بطاقة",
      goalsOdds: "أكثر من 2.5 هدف",
      primaryPrediction: "فوز البرازيل (1) + كلا الفريقين يسجلان (نعم)",
      secondaryPrediction: "تسجيل النجم إيرلينغ هالاند أو فينيسيوس جونيور في أي وقت",
      primaryOdds: "3.20",
      secondaryOdds: "1.80",
      correctScore: "2 - 1 أو 3 - 1 للسامبا البرازيلية",
      analysis: "تعد هذه المواجهة قمة حقيقية تجمع بين سحر ومهارة السامبا البرازيلية والقوة الهجومية الكاسحة للنرويج بقيادة الهداف التاريخي إيرلينغ هالاند. البرازيل ستعتمد على الاستحواذ الإيجابي وتمريرات البينيات السريعة والمهارات الخارقة للمهاجمين في المواجهات الفردية لتفكيك عمق الدفاع النرويجي الهادئ. في المقابل، النرويج ستلعب على استغلال الهجمات المعاكسة والكرات العرضية والاندفاع البدني الشرس لإزعاج دفاع السامبا. اللقاء سيكون مفتوحاً والمنتخب الأكثر توازناً في الدفاع سينتزع بطاقة العبور.",
      h2hData: "المواجهة الشهيرة في مونديال 1998 انتهت بفوز النرويج التاريخي بنتيجة 2-1.",
      homeForm: ["W", "W", "D", "W", "W"],
      awayForm: ["D", "W", "W", "L", "D"]
    },
    {
      id: "m7",
      homeTeam: "المكسيك",
      homeLogo: "🇲🇽",
      awayTeam: "إنجلترا",
      awayLogo: "🏴",
      group: "دور الـ 16",
      time: "03:00 صباحاً",
      date: "الإثنين 6 يوليو",
      isVIP: true,
      odds1X2: { home: "4.80", draw: "3.50", away: "1.72" },
      oddsOverUnder: { over: "1.90", under: "1.90" },
      probability: { home: 19, draw: 28, away: 53 },
      cornersOdds: "أكثر من 8.5 ركنية",
      cardsOdds: "أكثر من 3.5 بطاقة",
      goalsOdds: "أكثر من 1.5 هدف",
      primaryPrediction: "فوز إنجلترا (2) + أقل من 3.5 هدف إجمالي",
      secondaryPrediction: "تأهل إنجلترا مباشرة في الوقت الأصلي للمباراة",
      primaryOdds: "2.10",
      secondaryOdds: "1.35",
      correctScore: "0 - 1 أو 0 - 2 للأسود الثلاثة",
      analysis: "المنتخب الإنجليزي يدخل اللقاء كمرشح قوي بفضل كتيبة مدججة بالنجوم وتوازن تكتيكي رائع يجمع بين الصلابة الدفاعية والتحكم في ريتم المباريات عبر وسط ملعبه القوي والمستقر. المكسيك ستعول على الحماس الجماهيري والسرعة الفائقة في الأطراف والضغط العالي لمحاولة إرباك الدفاع الإنجليزي وإجباره على التراجع. ومع ذلك، الانضباط والهدوء الذي يتميز به الأسود الثلاثة كفيل بامتصاص الحماس المكسيكي تدريجياً، وحسم المواجهة بفضل الفعالية العالية للخط الهجومي والخبرة الكبيرة في تسيير اللقاءات.",
      h2hData: "آخر لقاء رسمي ودي جمع المنتخبين فازت به إنجلترا بثلاثية نظيفة.",
      homeForm: ["L", "W", "W", "D", "L"],
      awayForm: ["W", "W", "D", "W", "W"]
    },
    {
      id: "m8",
      homeTeam: "البرتغال",
      homeLogo: "🇵🇹",
      awayTeam: "إسبانيا",
      awayLogo: "🇪🇸",
      group: "دور الـ 16",
      time: "22:00",
      date: "الإثنين 6 يوليو",
      isVIP: true,
      odds1X2: { home: "2.90", draw: "3.10", away: "2.50" },
      oddsOverUnder: { over: "2.05", under: "1.75" },
      probability: { home: 33, draw: 31, away: 36 },
      cornersOdds: "أكثر من 9 ركنيات",
      cardsOdds: "أكثر من 5.5 بطاقة",
      goalsOdds: "أقل من 2.5 هدف",
      primaryPrediction: "التعادل أو فوز إسبانيا (X2) + أقل من 3.5 هدف",
      secondaryPrediction: "الذهاب لأشواط إضافية أو ركلات الترجيح (صراع تكتيكي مغلق)",
      primaryOdds: "1.75",
      secondaryOdds: "3.10",
      correctScore: "1 - 1 أو 0 - 1 لصالح إسبانيا",
      analysis: "ديربي ناري مشتعل في ثمن النهائي يجمع بين مدرستين كرويتين عريقتين بجاهزية قصوى. إسبانيا ستفرض أسلوبها المعتاد بالاستحواذ الطويل على الكرة (Tiki-Taka) وتضييق الخناق على البرتغال بالضغط العكسي الفوري عند فقدان الكرة لاستعادة السيطرة سريعاً. البرتغال بتركيبتها الفتاكة من النجوم ستعتمد على التماسك الدفاعي والضرب بالمرتدات السريعة التي تمتاز بالدقة المتناهية لضرب الدفاع الإسباني المتقدم. صراع تكتيكي حذر ومغلق للغاية من الطراز الرفيع سيحسم بتفاصيل متناهية الصغر.",
      h2hData: "تاريخ حافل بالتعادلات، وآخر لقاء رسمي انتهى بالتعادل الإيجابي 1-1 في دوري الأمم الأوروبية.",
      homeForm: ["W", "D", "W", "W", "L"],
      awayForm: ["W", "W", "D", "W", "W"]
    },
    {
      id: "m9",
      homeTeam: "بلجيكا",
      homeLogo: "🇧🇪",
      awayTeam: "أمريكا",
      awayLogo: "🇺🇸",
      group: "دور الـ 16",
      time: "03:00 صباحاً",
      date: "الثلاثاء 7 يوليو",
      isVIP: false,
      odds1X2: { home: "1.90", draw: "3.40", away: "4.00" },
      oddsOverUnder: { over: "1.85", under: "1.95" },
      probability: { home: 50, draw: 27, away: 23 },
      cornersOdds: "أكثر من 9 ركنيات",
      cardsOdds: "أقل من 4.5 بطاقة",
      goalsOdds: "أكثر من 2.5 هدف",
      primaryPrediction: "فوز بلجيكا أو تعادل (1X) + أكثر من 1.5 هدف",
      secondaryPrediction: "كلا الفريقين يسجلان (نعم) - لقاء غني بالإثارة",
      primaryOdds: "1.65",
      secondaryOdds: "1.80",
      correctScore: "2 - 1 لصالح بلجيكا",
      analysis: "تجمع المباراة بين جيل بلجيكي يتمتع بخبرة كبيرة في المواعيد الكبرى وقدرة متميزة على الاستحواذ والتمرير في المساحات الضيقة، وبين منتخب أمريكي طموح ومندفع يمتاز بالسرعة الخارقة في التحولات والروح الجماعية العالية والضغط الميداني المستمر. بلجيكا ستحاول امتصاص حماس وعنفوان الفريق الأمريكي عبر فرض نسق هادئ ومدروس بوسط الملعب، بينما ستسعى الولايات المتحدة لفرض ريتم بدني سريع ومربك. نتوقع لقاءً مشوقاً للغاية يغلب عليه السجال الهجومي طوال الـ 90 دقيقة.",
      h2hData: "المواجهة الشهيرة في مونديال 2014 انتهت بفوز بلجيكا 2-1 بعد التمديد والأشواط الإضافية.",
      homeForm: ["D", "W", "W", "L", "W"],
      awayForm: ["W", "L", "D", "W", "D"]
    }
  ];

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ matches: defaultMatches, codes: defaultCodes }, null, 2), "utf-8");
    console.log("Database seeded successfully!");
  } else {
    try {
      const existing = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      const isOldSeed = existing.matches?.some((m: any) => m.awayTeam === "النمسا" || m.awayTeam === "تونس" || m.awayTeam === "الإكوادور");
      const hasShortAnalysis = existing.matches?.some((m: any) => !m.analysis || m.analysis.length < 240);
      if (isOldSeed || hasShortAnalysis) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ matches: defaultMatches, codes: defaultCodes }, null, 2), "utf-8");
        console.log("Database updated to new highly-detailed seed data!");
      }
    } catch (e) {
      console.error("Failed to migrate database seed:", e);
    }
  }
}

initializeDB();

// Helper to read database
function readDB(): { matches: any[]; codes: any[] } {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB", error);
    return { matches: [], codes: [] };
  }
}

// Helper to write database
function writeDB(data: { matches: any[]; codes: any[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing DB", error);
  }
}

// Check if a code is valid and active
function isValidActivationCode(code: string): boolean {
  if (!code) return false;
  const db = readDB();
  const found = db.codes.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  return found ? found.isActive : false;
}

// 1. API: Get all matches (Secure)
app.get("/api/matches", (req, res) => {
  const code = (req.query.code as string) || (req.headers["x-activation-code"] as string) || "";
  const isUnlocked = isValidActivationCode(code);
  
  const db = readDB();
  
  // Transform matches: if VIP and NOT unlocked, strip predictions & sensitive stats!
  const sanitizedMatches = db.matches.map(m => {
    if (m.isVIP && !isUnlocked) {
      return {
        id: m.id,
        homeTeam: m.homeTeam,
        homeLogo: m.homeLogo,
        awayTeam: m.awayTeam,
        awayLogo: m.awayLogo,
        group: m.group,
        time: m.time,
        date: m.date,
        isVIP: true,
        // Public stats
        odds1X2: m.odds1X2,
        oddsOverUnder: m.oddsOverUnder,
        probability: m.probability,
        cornersOdds: m.cornersOdds,
        cardsOdds: m.cardsOdds,
        goalsOdds: m.goalsOdds,
        // Hidden/Redacted fields for VIP
        primaryPrediction: null,
        secondaryPrediction: null,
        primaryOdds: null,
        secondaryOdds: null,
        correctScore: null,
        analysis: null,
        h2hData: null,
        homeForm: m.homeForm,
        awayForm: m.awayForm
      };
    }
    return m; // Unlocked or free matches return full data
  });
  
  res.json({
    matches: sanitizedMatches,
    isUnlocked
  });
});

// 2. API: Validate Activation Code
app.post("/api/activate", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "يرجى إدخال الكود" });
  }
  
  const valid = isValidActivationCode(code);
  if (valid) {
    res.json({ success: true, message: "تم تفعيل كود الـ VIP بنجاح! تم فتح جميع المباريات المشفرة. 🎉" });
  } else {
    res.status(400).json({ success: false, message: "كود تفعيل خاطئ أو منتهي الصلاحية! يرجى المحاولة مرة أخرى أو التواصل مع الدعم." });
  }
});

// Admin API Group (Exposed but simplified for the internal panel)

// Admin: Get matches (All data)
app.get("/api/admin/matches", (req, res) => {
  const db = readDB();
  res.json(db.matches);
});

// Admin: Add/Create match
app.post("/api/admin/matches", (req, res) => {
  const matchData = req.body;
  if (!matchData.homeTeam || !matchData.awayTeam) {
    return res.status(400).json({ error: "Home and Away teams are required." });
  }
  
  const db = readDB();
  const newMatch = {
    id: "m_" + Date.now(),
    homeTeam: matchData.homeTeam,
    homeLogo: matchData.homeLogo || "⚽",
    awayTeam: matchData.awayTeam,
    awayLogo: matchData.awayLogo || "⚽",
    group: matchData.group || "المجموعة العامة",
    time: matchData.time || "18:00",
    date: matchData.date || "25 يونيو",
    isVIP: !!matchData.isVIP,
    odds1X2: matchData.odds1X2 || { home: "2.10", draw: "3.20", away: "3.10" },
    oddsOverUnder: matchData.oddsOverUnder || { over: "1.85", under: "1.95" },
    probability: matchData.probability || { home: 45, draw: 30, away: 25 },
    cornersOdds: matchData.cornersOdds || "أكثر من 8.5 ركنية",
    cardsOdds: matchData.cardsOdds || "أقل من 3.5 بطاقة",
    goalsOdds: matchData.goalsOdds || "أكثر من 1.5 هدف",
    primaryPrediction: matchData.primaryPrediction || "فوز الفريق المضيف",
    secondaryPrediction: matchData.secondaryPrediction || "كلا الفريقين يسجلان (نعم)",
    primaryOdds: matchData.primaryOdds || "1.80",
    secondaryOdds: matchData.secondaryOdds || "1.90",
    correctScore: matchData.correctScore || "2 - 1",
    analysis: matchData.analysis || "تحليل مبدئي للمباراة بناءً على المعطيات.",
    h2hData: matchData.h2hData || "مواجهات متكافئة تاريخياً.",
    homeForm: matchData.homeForm || ["W", "D", "W", "L", "W"],
    awayForm: matchData.awayForm || ["W", "L", "D", "W", "L"]
  };
  
  db.matches.push(newMatch);
  writeDB(db);
  res.json({ success: true, match: newMatch });
});

// Admin: Edit match
app.put("/api/admin/matches/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const db = readDB();
  const index = db.matches.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Match not found" });
  }
  
  db.matches[index] = {
    ...db.matches[index],
    ...updateData,
    id // keep same ID
  };
  
  writeDB(db);
  res.json({ success: true, match: db.matches[index] });
});

// Admin: Delete match
app.delete("/api/admin/matches/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.matches.filter(m => m.id !== id);
  
  if (filtered.length === db.matches.length) {
    return res.status(404).json({ error: "Match not found" });
  }
  
  db.matches = filtered;
  writeDB(db);
  res.json({ success: true, message: "Match deleted" });
});

// Admin: Get all codes
app.get("/api/admin/codes", (req, res) => {
  const db = readDB();
  res.json(db.codes);
});

// Admin: Add new code
app.post("/api/admin/codes", (req, res) => {
  const { code, note } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  const db = readDB();
  const uppercaseCode = code.trim().toUpperCase();
  if (db.codes.some(c => c.code === uppercaseCode)) {
    return res.status(400).json({ error: "هذا الكود موجود بالفعل" });
  }
  
  const newCode = {
    code: uppercaseCode,
    isActive: true,
    createdAt: new Date().toISOString(),
    note: note || ""
  };
  
  db.codes.push(newCode);
  writeDB(db);
  res.json({ success: true, code: newCode });
});

// Admin: Toggle code active state
app.put("/api/admin/codes/:code/toggle", (req, res) => {
  const { code } = req.params;
  const db = readDB();
  const index = db.codes.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: "Code not found" });
  }
  
  db.codes[index].isActive = !db.codes[index].isActive;
  writeDB(db);
  res.json({ success: true, code: db.codes[index] });
});

// Admin: Delete code
app.delete("/api/admin/codes/:code", (req, res) => {
  const { code } = req.params;
  const db = readDB();
  const filtered = db.codes.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  
  if (filtered.length === db.codes.length) {
    return res.status(404).json({ error: "Code not found" });
  }
  
  db.codes = filtered;
  writeDB(db);
  res.json({ success: true, message: "Code deleted" });
});

// Lazy initialize Gemini client inside the API endpoint itself so it doesn't crash on startup if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 3. API: Generate Match Analysis with Gemini AI (Awesome feature for the CMS)
app.post("/api/admin/generate-analysis", async (req, res) => {
  const { homeTeam, awayTeam, group, date, time } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "Home and Away teams are required." });
  }

  const ai = getAiClient();
  if (!ai) {
    // Elegant template generator if API key is not configured yet!
    const randomFloat = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);
    const probHome = Math.floor(Math.random() * 30) + 40; // 40-70
    const probDraw = Math.floor(Math.random() * 20) + 15; // 15-35
    const probAway = 100 - probHome - probDraw;
    
    return res.json({
      group: group || "المجموعة العامة",
      time: time || "20:00",
      date: date || "25 يونيو",
      odds1X2: { home: randomFloat(1.3, 2.8), draw: randomFloat(3.0, 4.5), away: randomFloat(2.5, 8.0) },
      oddsOverUnder: { over: randomFloat(1.6, 2.2), under: randomFloat(1.8, 2.4) },
      probability: { home: probHome, draw: probDraw, away: probAway },
      cornersOdds: `أكثر من ${Math.random() > 0.5 ? "8.5" : "9.5"} ركنية`,
      cardsOdds: `أقل من ${Math.random() > 0.5 ? "3.5" : "4.5"} بطاقات`,
      goalsOdds: `أكثر من ${Math.random() > 0.5 ? "1.5" : "2.5"} هدف`,
      primaryPrediction: `فوز ${homeTeam} أو تعادل + أكثر من 1.5 هدف`,
      secondaryPrediction: `كلا الفريقين يسجلان (نعم)`,
      primaryOdds: randomFloat(1.65, 1.95),
      secondaryOdds: randomFloat(1.80, 2.20),
      correctScore: `${Math.floor(Math.random() * 3) + 1} - ${Math.floor(Math.random() * 2)}`,
      analysis: `هذا تحليل مولد تلقائياً لعدم وجود مفتاح GEMINI_API_KEY: يعتمد منتخب ${homeTeam} على قوة الأطراف والتحول الهجومي السريع مستفيداً من تراجع دفاع ${awayTeam}. المواجهة ستكون تكتيكية للغاية وصعبة للطرفين مع أفضلية نسبية للمضيف.`,
      h2hData: `يتفوق منتخب ${homeTeam} في آخر 3 لقاءات بنسبة فوز 60%.`,
      homeForm: Array.from({ length: 5 }, () => ["W", "D", "L"][Math.floor(Math.random() * 3)]),
      awayForm: Array.from({ length: 5 }, () => ["W", "D", "L"][Math.floor(Math.random() * 3)])
    });
  }

  try {
    const prompt = `أنت محلل رياضي محترف وخبير في توقعات مباريات كرة القدم لشبكة سوبرتاك. 
قم بتحليل وتوقع مباراة قادمة بين: 
المستضيف: "${homeTeam}" 
الضيف: "${awayTeam}" 
تاريخ المباراة: "${date || '25 يونيو'}"
توقيت المباراة: "${time || '20:00'}"
المجموعة أو البطولة: "${group || 'المجموعة العامة'}"

أرجع الإجابة ككائن JSON تماماً وبدون أي أكواد إضافية خارج الـ JSON. يجب أن يحتوي الـ JSON على المفاتيح التالية باللغة العربية:
- "group": اسم المجموعة/البطولة بالعربية
- "time": التوقيت (مثل "20:00")
- "date": التاريخ (مثل "25 يونيو")
- "odds1X2": كائن يحتوي على odds لـ "home", "draw", "away" (أرقام عشرية كفلوت في شكل نصوص، مثل "1.75")
- "oddsOverUnder": كائن يحتوي على "over", "under" لـ 2.5 أهداف (مثل "1.80", "2.00")
- "probability": كائن يحتوي على نسب فوز المضيف، التعادل، والضيف كأرقام صحيحة مجموعها 100، مفاتيحها "home", "draw", "away"
- "cornersOdds": توقع ركنيات دقيق ومكتوب بالعربية مثل "أكثر من 9.5 ركنية"
- "cardsOdds": توقع بطاقات دقيق ومكتوب بالعربية مثل "أقل من 3.5 بطاقات"
- "goalsOdds": توقع أهداف دقيق ومكتوب بالعربية مثل "أكثر من 1.5 هدف"
- "primaryPrediction": التوقع الأساسي للمباراة مكتوب باحترافية بالعربية
- "secondaryPrediction": التوقع الثانوي للمباراة مكتوب باحترافية بالعربية
- "primaryOdds": معامل الرهان (Odds) للتوقع الأساسي مثل "1.85"
- "secondaryOdds": معامل الرهان للتوقع الثانوي مثل "1.95"
- "correctScore": توقع النتيجة الدقيقة المستهدفة (مثلاً "2 - 1 أو 3 - 1 لصالح ...")
- "analysis": تحليل فني وتكتيكي عميق ومفصل باللغة العربية يتحدث عن نقاط القوة والضعف للمنتخبين والسبب وراء هذا التوقع (حوالي 3-4 جمل طويلة)
- "h2hData": ملخص تاريخ المواجهات المباشرة والافضلية بالعربية في جملة قصيرة
- "homeForm": مصفوفة من 5 عناصر تمثل نتائج آخر 5 مباريات للمستضيف (كل عنصر حرف واحد: "W" للفوز، "D" للتعادل، "L" للخسارة)
- "awayForm": مصفوفة من 5 عناصر لنتائج الضيف بنفس التنسيق

تأكد أن النص بالكامل باللغة العربية الفصحى الأنيقة والمناسبة لموقع رياضي فخم.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text.trim();
    const resultJson = JSON.parse(text);
    res.json(resultJson);

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: "فشل توليد التحليل عبر الذكاء الاصطناعي. يرجى ملء البيانات يدوياً." });
  }
});

// Integration with Vite dev server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
