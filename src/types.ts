export interface Match {
  id: string;
  homeTeam: string;
  homeLogo?: string; // Team flag emoji or name
  awayTeam: string;
  awayLogo?: string;
  group: string; // e.g., "المجموعة 5"
  time: string; // e.g., "19:00"
  date: string; // e.g., "25 يونيو"
  isVIP: boolean;
  
  // Custom headers/odds
  odds1X2?: {
    home: string; // e.g., "1.70"
    draw: string; // e.g., "3.80"
    away: string; // e.g., "4.50"
  };
  oddsOverUnder?: {
    over: string; // e.g., "1.80"
    under: string; // e.g., "2.00"
  };
  probability?: {
    home: number; // e.g., 54
    draw: number; // e.g., 26
    away: number; // e.g., 20
  };

  // Badges / stats (stickers/icons next to stats)
  cornersOdds?: string; // e.g., "أكثر من 8.5 ركنية"
  cardsOdds?: string; // e.g., "أقل من 3.5 بطاقات"
  goalsOdds?: string; // e.g., "أكثر من 1.5 هدف"

  // Main predictions (Only available if unlocked/non-VIP)
  primaryPrediction?: string; // e.g., "فوز المضيف (1) + كلا الفريقين يسجلان (نعم)"
  secondaryPrediction?: string; // e.g., "فوز أو تعادل الضيف (X2) + أكثر من 1.5 هدف"
  primaryOdds?: string; // e.g., "1.75"
  secondaryOdds?: string; // e.g., "1.90"
  
  correctScore?: string; // e.g., "3 - 0 أو 4 - 0 للتانغو"
  analysis?: string; // e.g., "ألمانيا بامتلاكها الهجومية القوية مقابل الإكوادور فارق واضح في المستوى."
  h2hData?: string; // e.g., "ألمانيا متفوقة في معظم المواجهات"
  homeForm?: string[]; // e.g., ["W", "W", "W", "W", "W"]
  awayForm?: string[]; // e.g., ["W", "D", "L", "W", "D"]
}

export interface ActivationCode {
  code: string;
  isActive: boolean;
  createdAt: string;
  note?: string;
}

export interface DashboardStats {
  totalMatches: number;
  successfulPredictions: number;
  accuracyRate: number; // e.g., 78
  averageGoals: number; // e.g., 2.8
}
