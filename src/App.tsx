import { useState, useEffect } from "react";
import { 
  Book, 
  BookOpen, 
  Award, 
  Coins, 
  MessageSquare, 
  Flame, 
  User, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  Music,
  Heart,
  Palette,
  Search,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UserProfile, UserLevel } from "./types";
import { INITIAL_PROFILE, THEME_PRESETS, calculateLevelAndXP } from "./utils";
import QuranSection from "./components/QuranSection";
import HadithSection from "./components/HadithSection";
import SeerahSection from "./components/SeerahSection";
import RewardsSection from "./components/RewardsSection";
import AIAssistant from "./components/AIAssistant";
import TasbihSection from "./components/TasbihSection";
import SearchSection from "./components/SearchSection";
import VoiceRoomSection from "./components/VoiceRoomSection";
import ProfileAvatar from "./components/ProfileAvatar";
import LoginModal from "./components/LoginModal";
import UserProfileModal from "./components/UserProfileModal";

export default function App() {
  // Load profile from local storage or fallback to initial config
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("islam_belaraby_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved profile, resetting to default.", e);
      }
    }
    return INITIAL_PROFILE;
  });

  // Active view tab state (quran, hadith, seerah, rewards, ai-chat, tasbih, search)
  const [activeTab, setActiveTab] = useState<string>("quran");

  // Global Audio Playback state
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string>("اختر تلاوة أو محتوى لتشغيله");
  const [audioSubtitle, setAudioSubtitle] = useState<string>("استمع وتأمل مع منصة إسلام بالعربي");
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  // Jump targets for unified search teleportation
  const [initialSurahId, setInitialSurahId] = useState<number | undefined>(undefined);
  const [initialHadithId, setInitialHadithId] = useState<number | undefined>(undefined);
  const [initialLessonId, setInitialLessonId] = useState<string | undefined>(undefined);

  const handleNavigateToQuran = (surahId: number) => {
    setInitialSurahId(surahId);
    setInitialHadithId(undefined);
    setInitialLessonId(undefined);
    setActiveTab("quran");
  };

  const handleNavigateToHadith = (hadithId: number) => {
    setInitialHadithId(hadithId);
    setInitialSurahId(undefined);
    setInitialLessonId(undefined);
    setActiveTab("hadith");
  };

  const handleNavigateToSeerah = (lessonId: string) => {
    setInitialLessonId(lessonId);
    setInitialSurahId(undefined);
    setInitialHadithId(undefined);
    setActiveTab("seerah");
  };

  // Dynamic Theme state (linked to what's active)
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem("islam_belaraby_theme") || "theme-emerald";
  });

  // Active Entrance visual rendering animation trigger state
  const [activeEntrance, setActiveEntrance] = useState<string | null>(null);

  // Social log-in & authentication states and hooks
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleLoginSuccess = (name: string, email: string, provider: "google" | "facebook", avatarUrl: string) => {
    const updated: UserProfile = {
      ...profile,
      name,
      email,
      isLoggedIn: true,
      loginProvider: provider,
      avatarUrl: avatarUrl,
      points: profile.points + 200 // Bonus points gift reward on social sign-in streak!
    };
    saveProfile(updated);
    
    setEarningAlert({
      amount: 200,
      reason: `مرحباً بك يا ${name}! تم تسجيل الدخول بنجاح عبر حساب ${provider === "google" ? "جوجل" : "فيسبوك"}، وحصلت على +200 نقطة.`
    });
    setTimeout(() => {
      setEarningAlert(null);
    }, 5000);
  };

  const handleLogout = () => {
    const updated: UserProfile = {
      ...profile,
      name: "طالب العلم",
      email: undefined,
      isLoggedIn: false,
      loginProvider: null,
      avatarUrl: undefined
    };
    saveProfile(updated);
    setEarningAlert({
      amount: 0,
      reason: "تم تسجيل خروجك بنجاح. سنشتاق إلى حضورك ودروسك الكريمة!"
    });
    setTimeout(() => {
      setEarningAlert(null);
    }, 4000);
  };

  // Trigger custom entrance on switching tabs!
  useEffect(() => {
    if (profile.activeEntrance && profile.activeEntrance !== "none" && profile.activeEntrance !== "") {
      setActiveEntrance(profile.activeEntrance);
      const timer = setTimeout(() => {
        setActiveEntrance(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Recent earning rewards logs (alerts toast)
  const [earningAlert, setEarningAlert] = useState<{ amount: number; reason: string } | null>(null);

  // Sync profile edits with state + local storage
  const saveProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem("islam_belaraby_profile", JSON.stringify(updated));
  };

  // Sync theme edits with state + local storage
  useEffect(() => {
    localStorage.setItem("islam_belaraby_theme", activeThemeId);
  }, [activeThemeId]);

  // Points administration helper
  const handleModifyPoints = (amount: number, reason: string, extraProfileFields?: Partial<UserProfile>) => {
    const nextPoints = Math.max(0, profile.points + amount);
    const xpReward = amount > 0 ? Math.floor(amount / 2) : 0; // Earn XP relative to positive points earned!
    const nextXp = profile.xp + xpReward;

    // Recalculate levels relative to new XP
    const { level } = calculateLevelAndXP(nextXp);

    const updated: UserProfile = {
      ...profile,
      points: nextPoints,
      xp: nextXp,
      level: level,
      ...extraProfileFields
    };

    saveProfile(updated);

    if (amount > 0) {
      setEarningAlert({ amount, reason });
      setTimeout(() => {
        setEarningAlert(null);
      }, 4000);
    }
  };

  // Unlock bought item or earned credentials theme
  const handleUnlockTheme = (themeId: string) => {
    if (!profile.unlockedThemes.includes(themeId)) {
      const updated = {
        ...profile,
        unlockedThemes: [...profile.unlockedThemes, themeId]
      };
      saveProfile(updated);
    }
  };

  // Unlock earned badges helper
  const handleUnlockBadge = (badgeId: string) => {
    if (!profile.unlockedBadges.includes(badgeId)) {
      const updated = {
        ...profile,
        unlockedBadges: [...profile.unlockedBadges, badgeId]
      };
      saveProfile(updated);
      handleModifyPoints(150, "الحصول على وسام شرفي جديد!");
    }
  };

  // Completed quizzes list checklist
  const handleCompleteQuiz = (lessonId: string) => {
    if (!profile.completedQuizzes.includes(lessonId)) {
      const updated = {
        ...profile,
        completedQuizzes: [...profile.completedQuizzes, lessonId],
        xp: profile.xp + 150 // award xp
      };
      saveProfile(updated);
    }
  };

  // Select profile theme
  const handleSelectTheme = (themeId: string) => {
    setActiveThemeId(themeId);
  };

  // Trigger playing an audio
  const handlePlayAudio = (url: string, title: string, subtitle: string) => {
    setActiveAudioUrl(url);
    setAudioTitle(title);
    setAudioSubtitle(subtitle);
  };

  // Helper check about what theme styling classes to attach
  const currentTheme = THEME_PRESETS.find(t => t.id === activeThemeId) || THEME_PRESETS[0];

  return (
    <div 
      id="app-root-shell"
      className={`min-h-screen bg-slate-950 bg-gradient-to-b ${currentTheme.primary} text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-900`}
    >
      {/* Decorative starry or pattern overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900/10 via-neutral-950/20 to-neutral-950 pointer-events-none"></div>

      {/* 1. APP TOP NAVIGATION & STATUS STRIP (responsive) */}
      <header className="border-b border-white/5 backdrop-blur-md bg-neutral-950/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand with elegant Arabic font pair */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-lg relative`}>
              <Book className="w-5 h-5 animate-pulse" />
              <div className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center font-mono text-[9px] text-neutral-950 font-black">
                ★
              </div>
            </div>
            <div className="text-right">
              <h1 id="app-logo-text" className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-serif">
                إسلام <span className="text-amber-400">بالعربي</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold leading-none mt-1">تعلّم، عِش، واستمع للسيرة والقرآن</p>
            </div>
          </div>

          {/* User state dashboard counters */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-wrap justify-center border-t border-neutral-900 sm:border-transparent pt-3 sm:pt-0 w-full sm:w-auto">
            {/* User Avatar with Frame and SVIP/Social indicator */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 bg-neutral-950/45 hover:bg-neutral-900/60 transition-all border border-white/5 pl-3 pr-2.5 py-1 rounded-xl shrink-0 cursor-pointer"
              title="اضغط لتعديل ملفك الشخصي وعرض مستويات VIP/SVIP"
            >
              <ProfileAvatar profile={profile} size="sm" />
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="font-extrabold text-[11px] text-white leading-none block">{profile.name}</span>
                  {profile.isLoggedIn && (
                    <span 
                      title={profile.loginProvider === "google" ? "مسجل عبر حساب جوجل الآمن" : "مسجل عبر فيسبوك"}
                      className={`text-[8px] px-1.5 py-0.2 rounded font-black ${
                        profile.loginProvider === "google" ? "bg-red-500/20 text-red-400" : "bg-[#1877F2]/20 text-[#1877F2]"
                      }`}
                    >
                      {profile.loginProvider === "google" ? "Google" : "Facebook"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {profile.isSvip ? (
                    <span className="text-[8px] font-black text-amber-450 block leading-none">👑 عضوية SVIP</span>
                  ) : (
                    <span className="text-[8px] text-neutral-500 block leading-none">الحساب الشخصي</span>
                  )}
                  {profile.isLoggedIn && (
                    <button
                      id="oauth-header-logout-btn"
                      onClick={handleLogout}
                      className="text-[8px] font-bold text-red-400 hover:text-red-300 leading-none transition-colors underline cursor-pointer"
                    >
                      (خروج)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick login trigger if anonymous visitor */}
            {!profile.isLoggedIn && (
              <button
                id="oauth-header-login-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-500 text-neutral-950 font-black rounded-lg text-[10px] sm:text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 active:scale-98"
              >
                <span>دخول جوجل / فيسبوك 🔐</span>
              </button>
            )}

            {/* Daily Login Streak info */}
            <div className="flex items-center gap-1.5 text-xs bg-neutral-900/80 px-2.5 py-1.5 rounded-xl border border-neutral-800">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block leading-none">تتابع يومي</span>
                <span className="font-bold text-neutral-200 mt-0.5 block">{profile.dailyLoginStreak} أيام</span>
              </div>
            </div>

            {/* User XP Rank */}
            <div className="flex items-center gap-1.5 text-xs bg-neutral-900/80 px-2.5 py-1.5 rounded-xl border border-neutral-800">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block leading-none">الرتبة العلمية</span>
                <span className="font-bold text-amber-300 mt-0.5 block">{profile.level}</span>
              </div>
            </div>

            {/* Point Balance */}
            <div className="flex items-center gap-1.5 text-xs bg-gradient-to-l from-amber-500/10 to-neutral-900 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Coins className="w-4.5 h-4.5 text-amber-400" />
              <div className="text-right">
                <span className="text-[10px] text-amber-500/80 block leading-none font-bold">نقاطك الحالية</span>
                <span className="font-mono font-black text-amber-400 mt-0.5 block">{profile.points} نقطة</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN HUB INTERFACE TABS (responsive row) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col gap-6 pb-12">
        
        {/* Responsive, horizontally scrollable tabs row */}
        <div className="flex items-center border-b border-white/5 pb-0.5 overflow-x-auto scrollbar-none gap-2 pr-1">
          <button
            id="tab-btn-quran"
            onClick={() => setActiveTab("quran")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "quran"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            القرآن الكريم
          </button>

          <button
            id="tab-btn-hadith"
            onClick={() => setActiveTab("hadith")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "hadith"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            الأحاديث النبوية
          </button>

          <button
            id="tab-btn-seerah"
            onClick={() => setActiveTab("seerah")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "seerah"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            السيرة النبوية التفاعلية
          </button>

          <button
            id="tab-btn-tasbih"
            onClick={() => setActiveTab("tasbih")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "tasbih"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-amber-450 animate-pulse" />
            السبحة الإلكترونية
          </button>

          <button
            id="tab-btn-search"
            onClick={() => setActiveTab("search")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "search"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            البحث الموحد
          </button>

          <button
            id="tab-btn-voice-room"
            onClick={() => setActiveTab("voice-room")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "voice-room"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Headphones className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            المجالس الصوتية للجدد
          </button>

          <button
            id="tab-btn-rewards"
            onClick={() => setActiveTab("rewards")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "rewards"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            شحن ومكافآت المتجر
          </button>

          <button
            id="tab-btn-coordinator"
            onClick={() => setActiveTab("ai-chat")}
            className={`px-4 py-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "ai-chat"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
            مجلس المعلم هادي (AI)
          </button>
        </div>

        {/* 3. ACTIVE SUBSECTION RENDERER */}
        <div id="active-tab-content-container" className="flex-1 mt-2">
          {activeTab === "quran" && (
            <QuranSection 
              onPlayAudio={handlePlayAudio}
              onAddPoints={handleModifyPoints}
              unlockedBadges={profile.unlockedBadges}
              onUnlockBadge={handleUnlockBadge}
              initialSurahId={initialSurahId}
            />
          )}

          {activeTab === "hadith" && (
            <HadithSection 
              onPlayAudio={handlePlayAudio}
              onAddPoints={handleModifyPoints}
              unlockedBadges={profile.unlockedBadges}
              onUnlockBadge={handleUnlockBadge}
              initialHadithId={initialHadithId}
            />
          )}

          {activeTab === "seerah" && (
            <SeerahSection 
              onPlayAudio={handlePlayAudio}
              onAddPoints={handleModifyPoints}
              onCompleteQuiz={handleCompleteQuiz}
              completedQuizzes={profile.completedQuizzes}
              unlockedBadges={profile.unlockedBadges}
              onUnlockBadge={handleUnlockBadge}
              initialLessonId={initialLessonId}
            />
          )}

          {activeTab === "tasbih" && (
            <TasbihSection 
              onAddPoints={handleModifyPoints}
              unlockedBadges={profile.unlockedBadges}
              onUnlockBadge={handleUnlockBadge}
            />
          )}

          {activeTab === "search" && (
            <SearchSection 
              onAddPoints={handleModifyPoints}
              onNavigateToQuran={handleNavigateToQuran}
              onNavigateToHadith={handleNavigateToHadith}
              onNavigateToSeerah={handleNavigateToSeerah}
            />
          )}

          {activeTab === "voice-room" && (
            <VoiceRoomSection 
              onAddPoints={handleModifyPoints}
              unlockedBadges={profile.unlockedBadges}
              onUnlockBadge={handleUnlockBadge}
              userProfile={{
                name: profile.name,
                points: profile.points,
                level: profile.level
              }}
            />
          )}

          {activeTab === "rewards" && (
            <RewardsSection 
              profile={profile}
              onModifyPoints={handleModifyPoints}
              onUnlockTheme={handleUnlockTheme}
              onUnlockBadge={handleUnlockBadge}
              onSelectTheme={handleSelectTheme}
              activeThemeId={activeThemeId}
              onUpdateProfile={saveProfile}
            />
          )}

          {activeTab === "ai-chat" && (
            <AIAssistant 
              profile={profile}
              onAddPoints={handleModifyPoints}
            />
          )}
        </div>

      </main>

      {/* 4. FLOATING POINTS ALERT NOTIFICATION */}
      <AnimatePresence>
        {earningAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 border border-emerald-400/30 rounded-2xl shadow-2xl flex items-center gap-3 text-right z-50 text-white max-w-sm sm:w-80"
            dir="rtl"
          >
            <div className="w-9 h-9 rounded-full bg-amber-400 text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 animate-bounce">
              +{earningAlert.amount}
            </div>
            <div>
              <p className="font-bold text-xs text-white">تم كسب نقاط ومكافأة!</p>
              <p className="text-[10px] text-white/90 leading-relaxed mt-0.5">{earningAlert.reason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Entrance Animation Overlay */}
      <AnimatePresence>
        {activeEntrance && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            {activeEntrance === "lightning-strike" && (
              <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center">
                <div className="absolute inset-0 flash-overlay pointer-events-none"></div>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="bg-neutral-950/90 border-2 border-cyan-400 p-5 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(34,211,238,0.6)] text-center max-w-sm px-6"
                >
                  <span className="text-3xl animate-bounce">⚡⚡</span>
                  <h3 className="text-cyan-300 text-sm font-black mt-2">حضور الصاعقة البرقية الخاطف!</h3>
                  <p className="text-white text-xs font-bold mt-1">هلّ النور بقدوم العضو الـ SVIP {profile.name}</p>
                  <p className="text-cyan-400/80 text-[9px] mt-1.5 font-mono">⚡ SVIP Lightning Presence Active ⚡</p>
                </motion.div>
              </div>
            )}

            {activeEntrance === "royal-banner" && (
              <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
                <div className="entrance-banner bg-gradient-to-b from-amber-500 via-yellow-600 to-amber-700 border-x-4 border-b-4 border-yellow-300 max-w-xs w-full p-4 rounded-b-3xl shadow-[0_12px_30px_rgba(245,158,11,0.5)] text-center text-neutral-950 flex flex-col items-center">
                  <span className="text-xl">👑👑👑</span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-yellow-105 mt-0.5">يرفع الستار للموكب الإيماني</p>
                  <h4 className="text-xs font-extrabold text-white mt-1">وصل العضو الملكي SVIP {profile.name}</h4>
                  <p className="text-[9px] font-bold text-neutral-900 mt-1">ح حضور مهيب يليق بكم ✨</p>
                </div>
              </div>
            )}

            {activeEntrance === "angel-wings" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/5">
                <div className="absolute entrance-wings flex items-center justify-center gap-20 pointer-events-none opacity-60">
                  <div className="w-32 h-32 bg-gradient-to-r from-teal-400/0 to-white rounded-full filter blur-lg animate-pulse"></div>
                  <div className="w-32 h-32 bg-gradient-to-l from-teal-400/0 to-white rounded-full filter blur-lg animate-pulse"></div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="bg-neutral-950/85 border border-emerald-500/30 p-5 rounded-2xl text-center shadow-[0_0_30px_rgba(16,185,129,0.3)] max-w-xs"
                >
                  <span className="text-2xl animate-pulse">🕊️</span>
                  <h3 className="text-emerald-300 font-bold text-xs mt-2">حفتكم السكينة والوقار المبارك</h3>
                  <p className="text-white text-[11px] font-semibold mt-1">مجلس طيب بحضور العضو الفاضل {profile.name}</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Social Login popup modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      {/* Interactive User Profile & VIP/SVIP Levels modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            profile={profile}
            onUpdateProfile={(updated) => saveProfile(updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
