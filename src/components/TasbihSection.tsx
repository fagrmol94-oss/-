import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Volume2, VolumeX, Award, Flame, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TasbihSectionProps {
  onAddPoints: (points: number, reason: string) => void;
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
}

interface DhikrPreset {
  id: string;
  arabic: string;
  english: string;
  target: number;
}

const DHIKR_PRESETS: DhikrPreset[] = [
  { id: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", english: "Glory be to Allah", target: 33 },
  { id: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", english: "Praise be to Allah", target: 33 },
  { id: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", english: "Allah is Greatest", target: 33 },
  { id: "istighfar", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ", english: "I seek forgiveness from Allah", target: 33 },
  { id: "salawat", arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", english: "O Allah, send blessings upon Prophet Muhammad", target: 100 },
  { id: "tawhid", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", english: "There is no deity except Allah alone", target: 100 },
  { id: "hawqala", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", english: "There is no power nor strength except by Allah", target: 33 },
];

export default function TasbihSection({
  onAddPoints,
  unlockedBadges,
  onUnlockBadge
}: TasbihSectionProps) {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrPreset>(DHIKR_PRESETS[0]);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [totalTodayCount, setTotalTodayCount] = useState<number>(() => {
    const saved = localStorage.getItem("islam_belaraby_tasbih_today_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(() => {
    return localStorage.getItem("islam_belaraby_tasbih_claimed_today") === "true";
  });
  const [justTapped, setJustTapped] = useState<boolean>(false);

  // Sync total count with localStorage
  useEffect(() => {
    localStorage.setItem("islam_belaraby_tasbih_today_count", totalTodayCount.toString());
  }, [totalTodayCount]);

  // Sythnetic high-fidelity physical clicking sound (Works completely offline, zero load time)
  const triggerClickSound = (freq = 850, duration = 0.05) => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Mimic physical click (high transient frequency with fast exponential ramp-down)
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext blocked or uninitialized: ", e);
    }
  };

  // Sound specifically on completing a preset cycle
  const triggerCompleteSound = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Quick nice high-low chord
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Handle counter click
  const handleTap = () => {
    triggerClickSound();
    
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 120);

    const nextSession = sessionCount + 1;
    const nextTotal = totalTodayCount + 1;

    setSessionCount(nextSession);
    setTotalTodayCount(nextTotal);

    // Check if preset target reached
    if (nextSession >= selectedDhikr.target) {
      triggerCompleteSound();
      
      // Instantly grant 10 minor points for repeating a complete full round!
      onAddPoints(10, `إكمال دورة كاملة من ذكر (${selectedDhikr.arabic})`);
      setSessionCount(0); // auto reset session for next round

      // If user reaches a big threshold of unlocked badges
      if (nextTotal >= 333 && !unlockedBadges.includes("badge-dhikr-master")) {
        onUnlockBadge("badge-dhikr-master");
      }
    }
  };

  // Reset current dhikr session manually
  const handleResetSession = () => {
    triggerClickSound(400, 0.1);
    setSessionCount(0);
  };

  // Claim Daily tasbih reward
  const handleClaimDailyPoints = () => {
    if (totalTodayCount < 100) return;
    setIsCompletedToday(true);
    localStorage.setItem("islam_belaraby_claimed_today_tasbih", "true");
    onAddPoints(100, "إكمال ورد الأذكار اليومي (أكثر من 100 تسبيحة!)");
  };

  // Reset entire day counter
  const handleResetDay = () => {
    setTotalTodayCount(0);
    setIsCompletedToday(false);
    localStorage.removeItem("islam_belaraby_claimed_today_tasbih");
  };

  // Progress relative to selected preset target
  const sessionPercent = Math.min((sessionCount / selectedDhikr.target) * 100, 100);
  
  // Progress relative to daily 100 tasbih goals
  const dailyPercent = Math.min((totalTodayCount / 100) * 100, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right animate-fade-in" dir="rtl">
      
      {/* List of Dhikr Presets sidebar */}
      <div className="lg:col-span-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            صحيفة أذكار اليوم
          </h3>
          <p className="text-[11px] text-neutral-400 mt-1 lines-relaxed">
            تخير من هذه الصيغ الشريفة والأذكار المأثورة الممهدة بنصاب تكرار معين لترطيب لسانك بذكر الله.
          </p>
        </div>

        {/* Dynamic Preset Cards list */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] scrollbar-thin scrollbar-thumb-neutral-850 pr-1">
          {DHIKR_PRESETS.map((p) => {
            const isSelected = selectedDhikr.id === p.id;
            return (
              <button
                id={`dhikr-preset-btn-${p.id}`}
                key={p.id}
                onClick={() => {
                  setSelectedDhikr(p);
                  setSessionCount(0);
                  triggerClickSound(700, 0.08);
                }}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-l from-emerald-950 to-neutral-950 text-white border-emerald-500/30"
                    : "bg-neutral-950 text-neutral-400 border-neutral-900/80 hover:border-neutral-800"
                }`}
              >
                <div>
                  <p className={`font-bold text-xs md:text-sm ${isSelected ? "text-amber-400" : "text-neutral-300"}`}>
                    {p.arabic}
                  </p>
                  <p className="text-[9px] text-neutral-500 mt-1">{p.english}</p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[10px] bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-850 font-bold font-mono">
                    {p.target}x
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Offline notice info */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            <strong className="text-emerald-400 font-bold">يعمل بالكامل دون إنترنت:</strong> الأذكار والسبحة مدمجة محلياً لحماية بياناتك والعمل أينما كنت دون انقطاع.
          </p>
        </div>
      </div>

      {/* Main Electronic Rosary Tactile Screen */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* The tactile circle and progress */}
        <div className="bg-neutral-900/60 p-6 md:p-8 rounded-2xl border border-neutral-800 flex flex-col items-center justify-between relative overflow-hidden">
          
          {/* Top toggles & titles */}
          <div className="w-full flex justify-between items-center border-b border-neutral-800 pb-4 mb-4 flex-wrap gap-2">
            <div>
              <p className="text-[11px] text-amber-500 font-bold">السبحة الإلكترونية المطوّرة</p>
              <h3 className="text-base md:text-lg font-black text-white mt-1">
                {selectedDhikr.arabic}
              </h3>
            </div>

            {/* Sound toggle */}
            <button
              id="toggle-tasbih-audio-btn"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSoundEnabled
                  ? "bg-neutral-950 border-emerald-500/30 text-emerald-400 hover:bg-neutral-900"
                  : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:bg-neutral-900"
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSoundEnabled ? "مؤثرات الصوت نشطة" : "مكتوم"}</span>
            </button>
          </div>

          {/* Core circular tactile clicking bead body! */}
          <div className="relative my-6 flex flex-col items-center justify-center">
            
            {/* Visual background ripple effects */}
            <div className="absolute inset-0 bg-emerald-500/5 rounded-full scale-125 blur-xl pointer-events-none"></div>

            {/* Tap Button Dome */}
            <motion.button
              id="tasbih-clicking-bead"
              onClick={handleTap}
              animate={{ scale: justTapped ? 0.94 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-4 border-amber-500/20 active:border-emerald-500/50 shadow-2xl flex flex-col items-center justify-center cursor-pointer select-none relative group"
            >
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1 group-hover:text-amber-500/40 transition-colors select-none">
                اضغط للتسبيح
              </span>
              <span className="text-4xl md:text-5xl font-black font-mono text-amber-400 select-none tracking-tight">
                {sessionCount}
              </span>
              <span className="text-[10px] text-neutral-400 mt-2 font-semibold select-none">
                الهدف: {selectedDhikr.target}
              </span>

              {/* Progress visual circular ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.05)" 
                  strokeWidth="3"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3.2"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - sessionPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
              </svg>
            </motion.button>
            
            {/* Manual reset trigger */}
            <button
              id="reset-tasbih-session-btn"
              onClick={handleResetSession}
              disabled={sessionCount === 0}
              className="absolute -bottom-4 bg-neutral-950 hover:bg-neutral-850 p-2 rounded-full border border-neutral-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all hover:border-red-500/30 text-neutral-400 hover:text-red-400"
              title="إعادة تصفير الدورة الحالية"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Target details indicators */}
          <div className="w-full mt-6 bg-neutral-950/80 p-4 rounded-xl border border-neutral-850 flex flex-col gap-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-neutral-400">الجهد الكلي المبذول اليوم:</span>
              <span className="text-amber-400 font-mono font-bold">{totalTodayCount} تسبيحة</span>
            </div>

            {/* Daily tracker progress */}
            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-800 flex">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${dailyPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-1 flex-wrap gap-2">
              <p className="text-[10px] text-neutral-500">مطلوب إنجاز 100 حبة يومياً لكسب مكافأة الأوراد اليومية الممتازة.</p>
              
              {totalTodayCount >= 100 ? (
                !isCompletedToday ? (
                  <button
                    id="claim-tasbih-points-btn"
                    onClick={handleClaimDailyPoints}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-bold text-xs rounded-lg shadow-all transition-all shrink-0 cursor-pointer active:scale-95 animate-pulse"
                  >
                    استلام +100 نقطة اليوم
                  </button>
                ) : (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    ✓ تم استلام الجائزة اليومية
                  </span>
                )
              ) : (
                <span className="text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-850 px-2 py-1 rounded">
                  متبقي {100 - totalTodayCount} حبة للجائزة
                </span>
              )}
            </div>
          </div>

          {/* Quick diagnostic/stats clear */}
          {totalTodayCount > 0 && (
            <button
              id="clear-tasbih-day-btn"
              onClick={handleResetDay}
              className="text-[9px] text-neutral-600 hover:text-neutral-450 mt-4 underline self-end select-none"
            >
              إعادة تهيئة عداد اليوم بالكامل
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
