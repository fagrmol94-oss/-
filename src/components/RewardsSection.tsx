import React, { useState } from "react";
import { Coins, Flame, Award, ShieldAlert, Sparkles, Trophy, Palette, Printer, Check, Heart, Lock, HelpCircle, Copy, Smartphone, Upload } from "lucide-react";
import { UserProfile, RewardItem } from "../types";
import { THEME_PRESETS, AVAILABLE_BADGES } from "../utils";
import { motion, AnimatePresence } from "motion/react";

export interface ChargePackage {
  id: string;
  name: string;
  coins: number;
  priceEGP: number;
  icon: string;
  badge?: string;
  color: string;
}

export const CHARGE_PACKAGES: ChargePackage[] = [
  { id: "pack-1", name: "باقة النور الأساسية", coins: 1000, priceEGP: 25, icon: "🪙", color: "text-amber-500", badge: "بداية المسار" },
  { id: "pack-2", name: "باقة الهدايا والبركات", coins: 3000, priceEGP: 75, icon: "📿", color: "text-emerald-400", badge: "طالب العلم" },
  { id: "pack-3", name: "حزمة التفوق الفضية", coins: 6050, priceEGP: 150, icon: "🌟", color: "text-cyan-400", badge: "المثابر النشيط" },
  { id: "pack-4", name: "باقة البركة الفائقة الكبرى", coins: 12000, priceEGP: 300, icon: "👑", color: "text-yellow-400", badge: "الخيار الذهبي المقترح 🔥" },
  { id: "pack-5", name: "حزمة العطاء الإيمانية العظمى", coins: 25000, priceEGP: 600, icon: "🕌", color: "text-purple-400", badge: "كبار الداعمين" },
  { id: "pack-svip", name: "باقة الـ SVIP الملكية الأسطورية", coins: 1000000, priceEGP: 5000, icon: "💎👑", color: "text-fuchsia-450 font-extrabold animate-pulse", badge: "عضوية الـ SVIP الملكية وصورة شخصية متحركة مذهلة وإطارات خاصة لمدة 30 يوماً 🌟" }
];

interface RewardsSectionProps {
  profile: UserProfile;
  onModifyPoints: (amount: number, reason: string, extraProfileFields?: Partial<UserProfile>) => void;
  onUnlockTheme: (themeId: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  onSelectTheme: (themeId: string, primaryColor: string) => void;
  activeThemeId: string;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function RewardsSection({
  profile,
  onModifyPoints,
  onUnlockTheme,
  onUnlockBadge,
  onSelectTheme,
  activeThemeId,
  onUpdateProfile
}: RewardsSectionProps) {
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [chargedNotification, setChargedNotification] = useState<string>("");
  const [purchasedCertification, setPurchasedCertification] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);

  // States for Money Transfer to Mr. Ahmed Alaa
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [transferSenderName, setTransferSenderName] = useState<string>("");
  const [transferSenderPhone, setTransferSenderPhone] = useState<string>("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [selectedChargePack, setSelectedChargePack] = useState<ChargePackage>(CHARGE_PACKAGES[3]);

  // Recruitment Form state
  const [jobName, setJobName] = useState<string>("");
  const [jobPhone, setJobPhone] = useState<string>("");
  const [jobPosition, setJobPosition] = useState<string>("moderator");
  const [jobCoverLetter, setJobCoverLetter] = useState<string>("");
  const [recruitmentSuccess, setRecruitmentSuccess] = useState<boolean>(false);

  // Lists of Custom Frames
  const framesList = [
    { id: "gold-sparkle", name: "إطار الهالة الذهبية المتلألئة", desc: "هالة ذهبية تدور حول البروفايل بنبضات ملكية", cost: 1500, emoji: "✨" },
    { id: "blue-lightning", name: "إطار العاصفة البرقية الخاطفة", desc: "نبض بلوري برقي يشع هيبة ونقاء", cost: 2000, emoji: "⚡" },
    { id: "royal-ruby", name: "إطار الياقوت الملكي الهادئ", desc: "تدرج نيون من اللون الوردي والأرجواني اللطيف", cost: 2500, emoji: "🔮" },
    { id: "emerald-sparkle", name: "إطار الزمرد السعيد المبارك", desc: "تدرج أخضر مع نقاط إيمانية براقة تدور بسلام", cost: 1200, emoji: "🌿" }
  ];

  // Lists of Custom Entrances
  const entrancesList = [
    { id: "lightning-strike", name: "دخلة البرق والصواعق الرعدية", desc: "فلاش صاعق يعلن دخولك الفخم للمجالس", cost: 3500, emoji: "⚡" },
    { id: "royal-banner", name: "دخلة الموكب الملكي المبارك", desc: "ستار ذهبي ينسدل مهللاً بقدوم مسارك العلمي", cost: 5000, emoji: "👑" },
    { id: "angel-wings", name: "دخلة أجنحة السكينة والوقار", desc: "هبوط أجنحة نورانية تدور في جنبات الشاشة حباً وسلاماً", cost: 4000, emoji: "🕊️" }
  ];

  // Helper functions for custom assets
  const handleSelectFrame = (frameId: string) => {
    onUpdateProfile({
      ...profile,
      activeFrame: frameId
    });
  };

  const handleSelectEntrance = (entranceId: string) => {
    onUpdateProfile({
      ...profile,
      activeEntrance: entranceId
    });
  };

  const handleWeeklyClaim = () => {
    const now = new Date();
    if (profile.lastWeeklyClaim) {
      const lastClaimDate = new Date(profile.lastWeeklyClaim);
      const diffTime = Math.abs(now.getTime() - lastClaimDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        alert(`لقد قمت بمطالبة بمكافأتك الأسبوعية مؤخراً. يرجى الانتظار ${7 - diffDays + 1} أيام للمطالبة التالية.`);
        return;
      }
    }

    const claimReward = profile.isSvip ? 15000 : 2500;
    const desc = profile.isSvip 
      ? "المطالبة بمكافأة الشحن الأسبوعية الشرفية الـ SVIP لخدمتكم" 
      : "المطالبة بمكافأة الشحن الأسبوعية العامة";
      
    onModifyPoints(claimReward, desc, {
      lastWeeklyClaim: now.toISOString()
    });
    alert(`الحمد لله! تم استلام مكافأتك الأسبوعية بقيمة ${claimReward.toLocaleString()} عملة بنجاح! 🎉`);
  };

  const handleRecruitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim() || !jobPhone.trim()) {
      alert("الرجاء إدخال الاسم الرباعي ورقم الهاتف/الواتساب للمتابعة.");
      return;
    }
    
    setRecruitmentSuccess(true);
    onUpdateProfile({
      ...profile,
      employeeAppSubmitted: true
    });
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("01507251444");
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readAndSetFile(file);
    }
  };

  const readAndSetFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setProofImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSenderName.trim() || !transferSenderPhone.trim()) {
      alert("الرجاء إدخال اسم المحوّل ورقم الهاتف للتحقق من عملية التحويل.");
      return;
    }
    
    setIsSubmittingTransfer(true);
    
    // Simulate real bank/merchant checking loop
    setTimeout(() => {
      setIsSubmittingTransfer(false);
      setTransferSuccess(true);
      
      // Award coins and configure flags dynamically based on selected package
      if (selectedChargePack.coins === 1000000) {
        onModifyPoints(1000000, `مبارك! تفعيل العضوية الملكية الـ SVIP وصور متحركة للبروفايل لمدة 30 يوماً بنجاح من المدير أحمد علاء`, {
          isSvip: true,
          hasAnimatedAvatar30Days: true,
          activeFrame: "gold-sparkle",
          activeEntrance: "royal-banner",
          animatedAvatarExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        onModifyPoints(selectedChargePack.coins, `شحن ${selectedChargePack.name} (${selectedChargePack.coins.toLocaleString()} عملة) بتحويل معتمد للأستاذ أحمد علاء`);
      }
    }, 2850);
  };

  // Rewards catalog items
  const initialRewards: RewardItem[] = [
    { id: "theme-gold", title: "مظهر الكعبة الذهبى", description: "شراء وتفعيل مظهر الكعبة المشرفة واللون الأسود والذهبي المهيب.", cost: 300, icon: "🕌", type: "theme", value: "theme-gold" },
    { id: "theme-dusk", title: "مظهر الأقصى الشفق", description: "شراء وتفعيل مظهر المسجد الأقصى بالألوان التركوازية الهادئة.", cost: 400, icon: "🌙", type: "theme", value: "theme-dusk" },
    { id: "theme-desert", title: "مظهر رمال الحجاز", description: "شراء وتفعيل مظهر الوهج الصحراوي والألوان الترابية الدافئة.", cost: 600, icon: "🐪", type: "theme", value: "theme-desert" },
    { id: "cert-seerah", title: "شهادة دراسة السيرة النبوية", description: "شهادة معتمدة وجذابة باسمك لإتمام كامل دروس واختبارات السيرة العطرة.", cost: 500, icon: "📜", type: "certificate", value: "cert-seerah" }
  ];

  // Daily Checkin claim
  const handleDailyClaim = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    onModifyPoints(100, "تسجيل الدخول اليومي المبارك");
  };

  // Charging mock action
  const handleChargeSimulation = (pointsAmount: number, packName: string) => {
    onModifyPoints(pointsAmount, `شحن باقة: ${packName}`);
    setChargedNotification(`تم شحن حسابك بنجاح بـ ${pointsAmount} نقطة! جزاك الله خيراً.`);
    setTimeout(() => setChargedNotification(""), 4500);
  };

  // Buy item action
  const handlePurchaseReward = (item: RewardItem) => {
    if (profile.unlockedThemes.includes(item.id) || item.id === "cert-seerah" && purchasedCertification) {
      if (item.type === "theme") {
        const theme = THEME_PRESETS.find(t => t.id === item.id);
        if (theme) onSelectTheme(theme.id, theme.primary);
      } else if (item.id === "cert-seerah") {
        setIsCertificateModalOpen(true);
      }
      return;
    }

    if (profile.points < item.cost) {
      alert("نقاطك الحالية غير كافية لإتمام الشراء. كافئ نفسك واشحن نقاطاً أو أتمم دروس السيرة والقرآن الكريم أولاً!");
      return;
    }

    // Deduct points & unlock theme atomically
    if (item.type === "theme") {
      onModifyPoints(-item.cost, `شراء مكافأة: ${item.title}`, {
        unlockedThemes: profile.unlockedThemes.includes(item.id) 
          ? profile.unlockedThemes 
          : [...profile.unlockedThemes, item.id]
      });
      const theme = THEME_PRESETS.find(t => t.id === item.id);
      if (theme) onSelectTheme(theme.id, theme.primary);
    } else if (item.type === "certificate") {
      onModifyPoints(-item.cost, `شراء مكافأة: ${item.title}`);
      setPurchasedCertification(true);
      setIsCertificateModalOpen(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right animate-fade-in" dir="rtl">
      {/* Simulation points charging sidebar */}
      <div className="lg:col-span-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-neutral-800 pb-2">
          <Coins className="w-5 h-5 text-amber-500" />
          شحن الرصيد والاشتراكات
        </h3>
        
        <p className="text-xs text-neutral-400 -mt-1 leading-relaxed">
          نظام شحن تفاعلي يُمكّنك من زيادة نقاطك فورياً لتفعيل أنماط التصاميم الفريدة والحصول على شهادات ممتازة.
        </p>

        {chargedNotification && (
          <div className="bg-emerald-950/20 text-emerald-400 p-3 border border-emerald-500/10 text-xs rounded-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{chargedNotification}</span>
          </div>
        )}

        {/* List of pricing / mock charging packs */}
        <div className="flex flex-col gap-3 my-2">
          <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl hover:border-amber-400/20 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-neutral-200">شحن باقة النور الأساسية</p>
                <p className="text-[10px] text-neutral-500">1,000 عملة إيمانية</p>
              </div>
              <button
                id="charge-pack-basic"
                onClick={() => {
                  setSelectedChargePack(CHARGE_PACKAGES[0]);
                  setIsTransferModalOpen(true);
                  setTransferSuccess(false);
                  setTransferSenderName("");
                  setTransferSenderPhone("");
                  setProofImage(null);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                شحن (25 ج.م)
              </button>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-l from-emerald-950/10 to-neutral-950 border border-emerald-500/10 rounded-xl hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-emerald-400">باقة الهدايا والبركات</p>
                <p className="text-[10px] text-neutral-500">3,000 عملة إيمانية</p>
              </div>
              <button
                id="charge-pack-silver"
                onClick={() => {
                  setSelectedChargePack(CHARGE_PACKAGES[1]);
                  setIsTransferModalOpen(true);
                  setTransferSuccess(false);
                  setTransferSenderName("");
                  setTransferSenderPhone("");
                  setProofImage(null);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                شحن (75 ج.م)
              </button>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-l from-amber-950/10 to-neutral-950 border border-amber-500/10 rounded-xl hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-amber-400">حزمة التفوق الفضية</p>
                <p className="text-[10px] text-neutral-500 font-bold">6,050 عملة إيمانية</p>
              </div>
              <button
                id="charge-pack-gold"
                onClick={() => {
                  setSelectedChargePack(CHARGE_PACKAGES[2]);
                  setIsTransferModalOpen(true);
                  setTransferSuccess(false);
                  setTransferSenderName("");
                  setTransferSenderPhone("");
                  setProofImage(null);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-350 text-neutral-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                شحن (150 ج.م)
              </button>
            </div>
          </div>

          {/* Special Custom Premium Package requested by the user */}
          <div className="p-3 bg-gradient-to-l from-yellow-500/15 via-amber-950/10 to-neutral-950 border-2 border-yellow-500/40 rounded-xl hover:border-yellow-500/60 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-neutral-950 text-[8px] font-black px-2 py-[2px] rounded-bl">العرض الذهبي الرائد 👑</div>
            <div className="flex justify-between items-center mt-3">
              <div>
                <p className="text-xs font-black text-yellow-300">باقة البركة الفائقة</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-0.5 font-mono">12,000 عملة</p>
                <p className="text-[9px] text-neutral-400">تحويل 300 ج.م للأستاذ أحمد علاء</p>
              </div>
              <button
                id="charge-pack-special-ahmed-alaa"
                onClick={() => {
                  setIsTransferModalOpen(true);
                  setTransferSuccess(false);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:brightness-110 text-neutral-950 font-black text-xs rounded-lg transition-all cursor-pointer shadow-lg active:scale-95"
              >
                شحن (300 ج.م)
              </button>
            </div>
          </div>
        </div>

        {/* Daily quests list */}
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 mt-1">
          <h4 className="font-bold text-xs text-neutral-300 flex items-center gap-1.5 mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            المهام الاستباقية لليوم
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <div>
                <p className="text-xs font-bold text-neutral-300">تسجيل الدخول اليومي</p>
                <p className="text-[10px] text-neutral-500">احصل على بركتك اليومية من النقاط</p>
              </div>
              <button
                id="claim-daily-reward-btn"
                onClick={handleDailyClaim}
                disabled={dailyClaimed}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dailyClaimed 
                    ? "bg-neutral-900 text-neutral-600 border border-neutral-850 cursor-not-allowed" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                }`}
              >
                {dailyClaimed ? "تم الاستلام" : "استلام +100"}
              </button>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div>
                <p className="text-xs font-bold text-neutral-300">تأمل آية مع الشرح</p>
                <p className="text-[10px] text-emerald-500/80">متاحة دوماً في قسم القرآن الكريم</p>
              </div>
              <span className="text-[10px] text-neutral-500">+100 نقطة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Store & Unlocked Badges section */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Weekly Recharge Reward Panel */}
        <div className="bg-gradient-to-tr from-indigo-950/25 via-neutral-900 to-neutral-900 p-5 rounded-2xl border border-yellow-500/10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-3">
            <div>
              <h4 className="font-extrabold text-white text-sm md:text-base flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-yellow-500 animate-pulse" />
                المكافأة الأسبوعية وبوابة التخصيص الاستثنائية 👑🎁
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                تمنحك هذه البوابة مكافأة شرفية أسبوعية من العملات! يحصل حاملو العضوية الـ <strong className="text-amber-400 font-black">SVIP</strong> على <span className="text-yellow-450 font-extrabold">15,000 عملة مجانية</span> والجميع يحصل على <span className="text-emerald-450 font-bold">2,500 عملة</span> يوم 7 من كل أسبوع.
              </p>
            </div>
            
            <button
              id="weekly-claim-big-btn"
              onClick={handleWeeklyClaim}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-xs rounded-xl shadow-lg transition-all self-start sm:self-auto cursor-pointer"
            >
              طالب بالهدية الأسبوعية 🎁
            </button>
          </div>

          {/* Customize Section - Frames Shop & Entrance Selector */}
          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Frames Shop */}
            <div className="bg-neutral-950/50 border border-neutral-850 p-4 rounded-xl">
              <h5 className="font-bold text-xs text-white flex items-center gap-1.5 mb-2.5 pb-2 border-b border-neutral-900/60">
                <span className="text-amber-400 text-xs">🛡️</span>
                إطارات الملف الشخصي المتحركة
              </h5>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleSelectFrame("none")}
                  className={`w-full text-right p-2.5 rounded-lg border text-[11px] flex justify-between items-center transition-all ${
                    !profile.activeFrame || profile.activeFrame === "none"
                      ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-450 font-bold"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-850 text-neutral-400"
                  }`}
                >
                  <span>بدون إطار (افتراضي)</span>
                  <span className="font-mono text-[9px] text-neutral-500">نشط</span>
                </button>

                {framesList.map((frame) => {
                  const isActive = profile.activeFrame === frame.id;

                  return (
                    <div 
                      key={frame.id}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                        isActive
                          ? "border-yellow-500 bg-yellow-500/5"
                          : "border-neutral-900 bg-neutral-950"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                            <span className="text-base leading-none">{frame.emoji}</span>
                            <span>{frame.name}</span>
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{frame.desc}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-right flex justify-between items-center border-t border-neutral-900 pt-2">
                        <span className="text-[10px] text-amber-550 font-bold leading-none">
                          {profile.isSvip ? "متاح مجاناً للـ SVIP ✨" : `القيمة: ${frame.cost} عملة`}
                        </span>
                        
                        <button
                          onClick={() => {
                            if (profile.isSvip) {
                              handleSelectFrame(frame.id);
                              alert(`تم تفعيل وتثبيت ${frame.name} الخاص بك بنجاح! 🌟`);
                            } else {
                              // Regular users can purchase using coins!
                              if (profile.points < frame.cost) {
                                alert(`عملاتك غير كافية لفتح الإطار. يتطلب ${frame.cost} عملة ولديك ${profile.points} فقط.`);
                              } else {
                                onModifyPoints(-frame.cost, `فتح وتفعيل إطار البروفايل: ${frame.name}`, {
                                  activeFrame: frame.id
                                });
                                alert(`مبارك! تم فتح وتفعيل ${frame.name} مقابل خصم ${frame.cost} عملة بنجاح! 🎉`);
                              }
                            }
                          }}
                          className={`px-2 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                            isActive
                              ? "bg-yellow-500 text-neutral-950"
                              : "bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-900"
                          }`}
                        >
                          {isActive ? "مفعّل" : "تفعيل"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Special Entrances */}
            <div className="bg-neutral-950/50 border border-neutral-850 p-4 rounded-xl">
              <h5 className="font-bold text-xs text-white flex items-center gap-1.5 mb-2.5 pb-2 border-b border-neutral-900/60">
                <span className="text-amber-400 text-xs">🚪👑</span>
                دخلات ومواكب الـ SVIP الترحيبية
              </h5>

              <div className="space-y-2">
                <button
                  onClick={() => handleSelectEntrance("none")}
                  className={`w-full text-right p-2.5 rounded-lg border text-[11px] flex justify-between items-center transition-all ${
                    !profile.activeEntrance || profile.activeEntrance === "none"
                      ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-450 font-bold"
                      : "border-neutral-900 bg-neutral-950 hover:border-neutral-850 text-neutral-400"
                  }`}
                >
                  <span>بدون دخلة ترحيبية</span>
                  <span className="font-mono text-[9px] text-neutral-500">نشط</span>
                </button>

                {entrancesList.map((ent) => {
                  const isActive = profile.activeEntrance === ent.id;

                  return (
                    <div 
                      key={ent.id}
                      className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                        isActive
                          ? "border-yellow-500 bg-yellow-500/5"
                          : "border-neutral-900 bg-neutral-950"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                            <span className="text-base leading-none">{ent.emoji}</span>
                            <span>{ent.name}</span>
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{ent.desc}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-right flex justify-between items-center border-t border-neutral-900 pt-2">
                        <span className="text-[10px] text-amber-550 font-bold leading-none">
                          {profile.isSvip ? "متاح مجاناً للـ SVIP ✨" : `القيمة: ${ent.cost} عملة`}
                        </span>

                        <button
                          onClick={() => {
                            if (profile.isSvip) {
                              handleSelectEntrance(ent.id);
                              alert(`تم تفعيل وتثبيت دخلة ${ent.name} الخاصة بك بنجاح! جرب التنقل عبر التبويبات لتشاهد الدخلة الأسطورية! 🌟`);
                            } else {
                              if (profile.points < ent.cost) {
                                alert(`عملاتك غير كافية لفتح هذه الدخلة الممتازة. تتطلب ${ent.cost} عملة لديك ${profile.points} فقط.`);
                              } else {
                                onModifyPoints(-ent.cost, `فتح وتفعيل دخلة الدوران الخاصة والموكب: ${ent.name}`, {
                                  activeEntrance: ent.id
                                });
                                alert(`مبارك! تم فتح وتفعيل وتجربة ${ent.name} مقابل خصم ${ent.cost} عملة بنجاح! 🎉 جرب الانتقال بين صفحات الموقع لتراها تدور!`);
                              }
                            }
                          }}
                          className={`px-2 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                            isActive
                              ? "bg-yellow-500 text-neutral-950"
                              : "bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-900"
                          }`}
                        >
                          {isActive ? "مفعّل" : "تفعيل"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Rewards grid items */}
        <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4 border-t-0 rounded-t-none">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Palette className="w-5 h-5 text-emerald-500" />
            متجر الهدايا الحصرية والمظاهر المتكاملة
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {initialRewards.map((item) => {
              const themePreset = THEME_PRESETS.find(tp => tp.id === item.id);
              const isUnlockedTheme = profile.unlockedThemes.includes(item.id);
              const isCertificateOwned = item.id === "cert-seerah" && purchasedCertification;
              
              const isOwned = isUnlockedTheme || isCertificateOwned;
              const isCurrentlyActiveTheme = activeThemeId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrentlyActiveTheme
                      ? "bg-gradient-to-tr from-emerald-950/20 to-neutral-950 border-emerald-500"
                      : "bg-neutral-950 border-neutral-850 hover:border-neutral-800"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg shadow-inner">
                        {item.icon}
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                        {isOwned ? "تمتلكها" : `${item.cost} نقطة`}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs md:text-sm text-neutral-200 mt-3">{item.title}</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500">نوع المكافأة: {item.type === "theme" ? "تصميم مظهر" : "وثيقة رسمية"}</span>
                    <button
                      id={`buy-reward-item-${item.id}`}
                      onClick={() => handlePurchaseReward(item)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        isCurrentlyActiveTheme
                          ? "bg-emerald-500 text-neutral-950"
                          : isOwned
                            ? "bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border border-neutral-800"
                            : "bg-amber-400 hover:bg-amber-300 text-neutral-900"
                      }`}
                    >
                      {isCurrentlyActiveTheme ? "فعال الآن" : isOwned ? (item.type === "theme" ? "تفعيل المظهر" : "عرض واستخراج") : "شراء وتفعيل"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coin Recharge Rates & Pricing Table Section */}
        <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-950 p-5 rounded-2xl border border-yellow-500/20 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base md:text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400 animate-pulse" />
                جدول أسعار شحن العملات الإيمانية 💳
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                التحويل المباشر مع صاحب الموقع أستاذ <strong className="text-neutral-200">أحمد علاء</strong> على رقم فودافون كاش <strong className="text-yellow-300">01507251444</strong>
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full text-center self-start md:self-auto">
              تحديث فوري وآمن بنسبة 100% 🛡️
            </div>
          </div>

          {/* Pricing Table Grid */}
          <div className="overflow-x-auto rounded-xl border border-neutral-850 bg-neutral-950/40">
            <table className="w-full text-right border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-850">
                  <th className="p-3.5 font-bold text-center w-12">الرمز</th>
                  <th className="p-3.5 font-bold">اسم الحزمة</th>
                  <th className="p-3.5 font-bold text-center">العملات الشرفية</th>
                  <th className="p-3.5 font-bold text-center">سعر الباقة</th>
                  <th className="p-3.5 font-bold text-center">الحالة / الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {CHARGE_PACKAGES.map((pack) => {
                  const isFlagship = pack.id === "pack-4";
                  return (
                    <tr 
                      key={pack.id} 
                      className={`transition-colors duration-150 ${
                        isFlagship 
                          ? "bg-yellow-500/5 hover:bg-yellow-500/10" 
                          : "hover:bg-neutral-900/50"
                      }`}
                    >
                      <td className="p-3.5 text-center text-xl font-sans">{pack.icon}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col md:flex-row md:items-center gap-1.5">
                          <span className="font-bold text-neutral-100">{pack.name}</span>
                          {pack.badge && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isFlagship 
                                ? "bg-yellow-500 text-neutral-950" 
                                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                            }`}>
                              {pack.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                        {pack.coins.toLocaleString()} عملة
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-white">
                        {pack.priceEGP} ج.م
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          id={`buy-charge-table-${pack.id}`}
                          onClick={() => {
                            setSelectedChargePack(pack);
                            setIsTransferModalOpen(true);
                            setTransferSuccess(false);
                            setTransferSenderName("");
                            setTransferSenderPhone("");
                            setProofImage(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer active:scale-95 ${
                            isFlagship
                              ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-neutral-950 shadow-lg shadow-yellow-500/10 hover:brightness-110"
                              : "bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800"
                          }`}
                        >
                          شحن الباقة 💳
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <p className="text-[10px] md:text-xs text-neutral-400 leading-relaxed">
              طريقة الشحن سهلة للغاية: بمجرد اختيار الحزمة المناسبة، انقر فوق <strong>شحن الباقة</strong> وقم بنسخ رقم فودافون كاش للأستاذ أحمد علاء، ثم قم بتحويل المبلغ المطابق للباقة وأدخل بياناتك لتقوم المنصة بإضافة النقاط فورياً لحسابك.
            </p>
          </div>
        </div>

        {/* Unlocked / Earned Medals & Badges */}
        <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Award className="w-5 h-5 text-amber-500" />
            رتب الأوسمة الشرفية والمؤهلات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 my-1">
            {AVAILABLE_BADGES.map((badge) => {
              const isUnlocked = profile.unlockedBadges.includes(badge.id);

              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                    isUnlocked
                      ? "bg-neutral-950 border-amber-500/25 shadow-lg grayscale-0"
                      : "bg-neutral-950/45 border-neutral-900 opacity-40 grayscale select-none"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-2xl mb-2 shadow-inner border border-neutral-800">
                    {badge.icon}
                  </div>
                  <h4 className="font-bold text-xs text-neutral-200 leading-none">{badge.title}</h4>
                  <p className="text-[9px] text-neutral-500 mt-1 pb-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recruitment Form Panel */}
        <div className="bg-gradient-to-tr from-neutral-950/20 via-neutral-900 to-neutral-900 p-5 rounded-2xl border border-neutral-850 flex flex-col gap-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-neutral-850 pb-2">
            <span className="text-emerald-400">💼</span>
            فرص التوظيف والعمل في منصة إسلام بالعربي
          </h3>

          {!recruitmentSuccess && !profile.employeeAppSubmitted ? (
            <form onSubmit={handleRecruitmentSubmit} className="space-y-4 text-right">
              <p className="text-xs text-neutral-400 leading-relaxed">
                هل ترغب في المساهمة في نشر الخير والعلوم الإيجابية والعمل معنا كموظف معتمد تحت قيادة <span className="text-white font-bold">الأستاذ أحمد علاء</span>؟ قم بتعبئة بياناتك وسيتواصل معك الأستاذ أحمد لتحديد المقابلة والراتب.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">الاسم الرباعي الكامل</label>
                  <input
                    type="text"
                    required
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="ضع اسمك الكريم هنا"
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">رقم الهاتف أو الواتساب</label>
                  <input
                    type="tel"
                    required
                    value={jobPhone}
                    onChange={(e) => setJobPhone(e.target.value)}
                    placeholder="مثال: 01xxxxxxxxx"
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-right font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">التخصص المطلوب للعمل فيه</label>
                <select
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-850 rounded-xl focus:border-emerald-500/50 outline-none text-neutral-350 text-right cursor-pointer"
                >
                  <option value="moderator">مشرف ومراقب للمجالس العلمية الصوتية</option>
                  <option value="researcher">باحث ومراجع شرعي للسيرة والأحاديث</option>
                  <option value="developer">مطور ويب ومصمم أنظمة المنصة</option>
                  <option value="support">دعم فني وتواصل ومسؤول علاقات عامة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">لماذا ترغب بالعمل معنا والخبرات السابقة؟</label>
                <textarea
                  value={jobCoverLetter}
                  onChange={(e) => setJobCoverLetter(e.target.value)}
                  placeholder="تحدث بإيجاز عن مؤهلاتك وحرصك على الانضمام لخدمة العلم..."
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500/50 outline-none text-white text-right resize-none"
                />
              </div>

              <button
                id="submit-job-recruitment-btn"
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-1"
              >
                💼 إرسال طلب التوظيف للتحقق والدراسة
              </button>
            </form>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl text-center flex flex-col items-center gap-2">
              <span className="text-2xl animate-pulse">🎉💼</span>
              <h4 className="text-sm font-black text-emerald-400">لقد تم إرسال طلب التوظيف الخاص بك بنجاح!</h4>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-sm mx-auto">
                نشكرك على اهتمامك الكريم بالعمل في الفريق! تم إخطار <strong className="text-white">الأستاذ أحمد علاء</strong> وصحيفتنا ببيانات واتساب الخاصة بك وسنلتقي بك قريباً للتنسيق. جزاك الله خيراً ونفع بك الأمة والموقع.
              </p>
              <div className="bg-neutral-950/80 px-3 py-1.5 border border-dashed border-emerald-500/10 rounded font-mono text-[10px] text-emerald-400 mt-1">
                حالة الطلب الحالية: قيد النظر والمطابقة الفنية الـ HR ⏳
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic certification modal popup (Standard safe canvas fallback) */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-yellow-500/30 rounded-2xl p-5 md:p-8 max-w-lg w-full text-right relative shadow-2xl my-8"
              dir="rtl"
            >
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 font-bold transition text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                  <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-black text-white">شحن {selectedChargePack.name} ({selectedChargePack.coins.toLocaleString()} عملة)</h2>
                    <p className="text-xs text-neutral-400">إجراءات التحويل المباشر مع صاحب الموقع أستاذ أحمد علاء</p>
                  </div>
                </div>

                {!transferSuccess ? (
                  <form onSubmit={handleTransferSubmit} className="space-y-4">
                    <div className="bg-gradient-to-l from-amber-500/5 to-neutral-950 p-3.5 rounded-xl border border-amber-500/10">
                      <p className="text-xs text-white leading-relaxed mb-3">
                        لإتمام الشحن، يرجى تحويل مبلغ <strong className="text-yellow-400 text-sm font-bold">{selectedChargePack.priceEGP} جنيه مصري</strong> بالتفاصيل التالية:
                      </p>
                      
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-neutral-900">
                          <span className="text-neutral-400">اسم صاحب الحساب:</span>
                          <span className="text-neutral-200 font-bold">أستاذ أحمد علاء</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-neutral-400">رقم المحفظة (فودافون كاش):</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-300 font-black tracking-wider text-sm select-all">01507251444</span>
                            <button
                              type="button"
                              onClick={handleCopyNumber}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px]"
                              title="نسخ الرقم"
                            >
                              {copiedNumber ? "تم النسخ ✓" : (
                                <>
                                  <Copy className="w-3 h-3 text-yellow-500" />
                                  <span>نسخ</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5" htmlFor="sender-name-input">
                          اسم المحوّل بالكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sender-name-input"
                          type="text"
                          required
                          value={transferSenderName}
                          onChange={(e) => setTransferSenderName(e.target.value)}
                          placeholder="مثال: محمد أحمد علي"
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-yellow-500/50 outline-none text-white transition-all text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5" htmlFor="sender-phone-input">
                          الرقم الذي تم التحويل منه <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="sender-phone-input"
                          type="tel"
                          required
                          value={transferSenderPhone}
                          onChange={(e) => setTransferSenderPhone(e.target.value)}
                          placeholder="مثال: 01xxxxxxxxx"
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-yellow-500/50 outline-none text-white transition-all text-right font-mono"
                        />
                      </div>

                      {/* Drag-and-drop / manual screenshot upload component */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                          إرفاق لقطة شاشة لإثبات المعاملة <span className="text-neutral-500 font-normal">(اختياري)</span>
                        </label>
                        
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center min-h-[110px] cursor-pointer ${
                            isDragging
                              ? "border-yellow-500 bg-yellow-550/5"
                              : proofImage
                              ? "border-emerald-500/45 bg-emerald-950/5"
                              : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="screenshot-file-upload"
                          />
                          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            {proofImage ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">تم إرفاق إثبات التحويل ✓</span>
                                <img src={proofImage} alt="Receipt proof" className="max-h-16 rounded border border-neutral-850 mt-1 shadow-sm object-contain" />
                                <span className="text-[10px] text-neutral-500">انقر أو اسحب لتغيير الصورة</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className={`w-6 h-6 mb-2 ${isDragging ? "text-yellow-400 animate-bounce" : "text-neutral-500"}`} />
                                <p className="text-xs font-bold text-neutral-300">اسحب صورة الإيصال هنا أو تصفّح</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">يدعم JPG, PNG (للرفع والتحقق الفوري)</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      id="submit-transfer-payment-btn"
                      type="submit"
                      disabled={isSubmittingTransfer}
                      className="w-full py-3 mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-yellow-500/5 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingTransfer ? (
                        <>
                          <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>يتم التحقق البرمجي ومعالجة طلبك...</span>
                        </>
                      ) : (
                        <span>تأكيد إرسال التحويل وشحن الـ {selectedChargePack.coins.toLocaleString()} عملة فورياً</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-emerald-400">مبارك! تم شحن العملات بنجاح</h3>
                      <p className="text-xs text-neutral-300 leading-relaxed mt-2 max-w-sm mx-auto">
                        لقد تلقينا طلب التحويل الخاص بك وتمت مطابقته فورياً! تمت إضافة 
                        <strong className="text-yellow-400 font-bold mx-1">{selectedChargePack.coins.toLocaleString()} عملة</strong> 
                        إلى رصيدك الإيماني التراكمي بنجاح. جزاكم الله كُلّ خير لدعمكم منصة إسلام بالعربي.
                      </p>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 w-full text-right space-y-1.5 text-xs text-neutral-400 font-mono">
                      <p className="text-[11px] text-neutral-500 mb-1 border-b border-neutral-900 pb-1 font-bold">ملخص الإيصال المشحون:</p>
                      <p>• المرسل: <span className="text-neutral-200">{transferSenderName}</span></p>
                      <p>• رقم التحويل: <span className="text-neutral-200">{transferSenderPhone}</span></p>
                      <p>• المستلم: <span className="text-neutral-200">الأستاذ أحمد علاء (01507251444)</span></p>
                      <p>• القيمة المضافة: <span className="text-emerald-400 font-bold font-sans">{selectedChargePack.coins.toLocaleString()} عملة</span></p>
                    </div>

                    <button
                      id="close-success-recharge-btn"
                      onClick={() => setIsTransferModalOpen(false)}
                      className="px-6 py-2.5 bg-neutral-800 text-white hover:bg-neutral-750 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      حسناً، الانتقال للمتجر ممتناً
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isCertificateModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-550 border-2 border-amber-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950 to-neutral-950 rounded-2xl p-6 md:p-10 max-w-2xl w-full text-right relative shadow-2xl overflow-hidden"
              dir="rtl"
            >
              {/* Gold borders */}
              <div className="absolute inset-4 border-2 border-amber-500/15 pointer-events-none rounded-xl"></div>
              
              <div className="flex flex-col items-center">
                <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
                <h2 className="text-xl md:text-2xl font-black text-amber-300">وثيقة براءة واجتياز السيرة النبوية الكريمة</h2>
                <p className="text-xs text-neutral-400 mt-1 select-none">منصة إسلام بالعربي للعلوم التربوية</p>

                <div className="w-20 h-0.5 bg-amber-500/30 my-5"></div>

                <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-serif text-center max-w-lg mb-6">
                  نشهد بأن المستخدم الفاضل الكريم والباحث الدؤوب:
                  <br />
                  <span className="text-white text-lg md:text-2xl font-black block my-3 py-1 px-4 border-y border-amber-500/20 bg-neutral-900/60 rounded max-w-sm mx-auto font-mono">
                    {profile.name}
                  </span>
                  قد أتم دراسة سيرة نبينا محمد صلى الله عليه وسلم واجتياز كافة الاختبارات الشاملة وحصد الدرجات العلمية التامة والتقدم في منصتنا بكل جدارة واستحقاق، والتوكل على الله.
                </p>

                <div className="flex justify-between items-center w-full max-w-md bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs text-neutral-500 text-right font-mono">
                  <div>
                    <p>المشرف العام: المفسر الآلي م. هادي</p>
                    <p className="mt-1">الرتبة: {profile.level}</p>
                  </div>
                  <div>
                    <p>التوقيع: إسلام بالعربي</p>
                    <p className="mt-1">التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    id="close-cert-modal-btn"
                    onClick={() => setIsCertificateModalOpen(false)}
                    className="px-5 py-2 bg-neutral-800 text-neutral-300 text-xs rounded-xl font-bold hover:bg-neutral-700 transition"
                  >
                    إغلاق الوثيقة
                  </button>
                  <button
                    id="print-cert-btn"
                    onClick={() => {
                      window.print();
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs rounded-xl font-bold flex items-center gap-1.5 shadow"
                  >
                    <Printer className="w-4 h-4" />
                    استخراج وطباعة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
