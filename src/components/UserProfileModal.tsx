import { useState } from "react";
import { X, Sparkles, User, Image, Crown, Shield, Activity, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

// 4 gorgeous Islamic/scholarly Unsplash presets for fast selection
const PRESET_AVATARS = [
  {
    name: "مسجد قباء وسكينة الهداية",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "كتاب السيرة والقرآن الكريم",
    url: "https://images.unsplash.com/photo-1609599006353-e629f1d29718?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "مئذنة مذهبة وضوء الصباح",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    name: "فانوس رمضاني ونور دافئ",
    url: "https://images.unsplash.com/photo-1581078426775-65717f91761e?auto=format&fit=crop&w=150&h=150&q=80"
  }
];

export default function UserProfileModal({ isOpen, onClose, profile, onUpdateProfile }: UserProfileModalProps) {
  const [editedName, setEditedName] = useState(profile.name);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(profile.customAvatarUrl || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate VIP levels based on current points or allow mock level overriding
  // Level 1: 0, Level 2: 1000, Level 3: 3000, Level 4: 7000, Level 5: 15000+
  const getVipLevel = (pts: number) => {
    if (pts >= 15000) return { lvl: 5, label: "بطل العلم والمؤاخاة 💎", next: "مكتمل", progress: 100 };
    if (pts >= 7000) return { lvl: 4, label: "حافظ ذهبي متقدّم ✨", next: "15,000 نقطة", progress: Math.min(100, ((pts - 7000) / 8000) * 100) };
    if (pts >= 3000) return { lvl: 3, label: "متدارس مشارك فضي 🥈", next: "7,000 نقطة", progress: Math.min(100, ((pts - 3000) / 4000) * 100) };
    if (pts >= 1000) return { lvl: 2, label: "طالب علم ومثابر برونزي 🥉", next: "3,000 نقطة", progress: Math.min(100, ((pts - 1000) / 2000) * 100) };
    return { lvl: 1, label: "منتسب جديد للمجلس 🌱", next: "1,000 نقطة", progress: Math.min(100, (pts / 1000) * 100) };
  };

  const vipInfo = getVipLevel(profile.points);

  // Calculate SVIP levels
  // SVIP relies on triggers or huge point counts (SVIP Levels 1-5 starting at 20,000 points if isSvip)
  const getSvipLevel = (pts: number, isSvip: boolean) => {
    if (!isSvip) return { lvl: 0, label: "مغلق (يتطلب رتبة SVIP)", next: "تحويل / تفعيل الرتبة", progress: 0 };
    if (pts >= 100000) return { lvl: 5, label: "متبرع ملكي أسطوري 💎👑", next: "الحد الأقصى", progress: 100 };
    if (pts >= 50000) return { lvl: 4, label: "مستشار شرفي ملكي 🌟", next: "100,000 نقطة", progress: ((pts - 50000) / 50000) * 100 };
    if (pts >= 25000) return { lvl: 3, label: "داعم أول للمجلس 🕌", next: "50,000 نقطة", progress: ((pts - 25000) / 25000) * 100 };
    if (pts >= 10000) return { lvl: 2, label: "محب سخي للمنصة 💖", next: "25,000  نقطة", progress: ((pts - 10000) / 15000) * 100 };
    return { lvl: 1, label: "عضو SVIP ملكي طازج 👑", next: "10,000 نقطة", progress: Math.min(100, (pts / 10000) * 100) };
  };

  const svipInfo = getSvipLevel(profile.points, !!profile.isSvip);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name: editedName.trim() || profile.name,
      customAvatarUrl: customAvatarUrl.trim() || undefined
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const toggleSvipDemonstration = () => {
    const isNowSvip = !profile.isSvip;
    onUpdateProfile({
      ...profile,
      isSvip: isNowSvip,
      // Give gold sparkle frame instantly on SVIP turing active
      activeFrame: isNowSvip ? "gold-sparkle" : "none",
      hasAnimatedAvatar30Days: isNowSvip ? true : false,
      animatedAvatarExpiry: isNowSvip ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    });
  };

  const toggleVipDemonstration = () => {
    const isNowVip = !profile.isVip;
    onUpdateProfile({
      ...profile,
      isVip: isNowVip,
      // Give ruby frame for VIP testing
      activeFrame: isNowVip ? "royal-ruby" : "none"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 p-6 md:p-8"
      >
        {/* Gradient header line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-amber-500 via-emerald-600 to-indigo-600"></div>

        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-neutral-900 pb-4 mb-6">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-550 rounded-xl text-white">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-serif">ملف القارئ والتحكم بالعضويات</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-none">تخصيص الهوية الشخصية، رفع صورة فريدة، وعرض مستويات VIP و SVIP.</p>
          </div>
        </div>

        {/* Success toast inside modal */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center justify-between"
            >
              <span>تم حفظ تعديلات البروفايل والصور بنجاح! جزاكم الله خيراً 🕌</span>
              <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Right Column: Custom name and Custom picture inputs */}
          <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 space-y-5">
            <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              تعديل الهوية والتقاط صورة البروفايل
            </h3>

            {/* Input Name */}
            <div>
              <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">الاسم الكريم بالمنصة:</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="مثال: الباحث مصطفى"
                className="w-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Custom URL Input for adding custom image */}
            <div>
              <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">تحديد صورتك الخاصة (ضع رابط الصورة هنا):</label>
              <div className="relative">
                <Image className="absolute right-3 top-3 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="مثال: https://images.unsplash.com/photo-..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 pr-9 pl-3 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[9px] text-neutral-500 mt-1 leading-relaxed">
                يمكنك نسخ ولصق روابط الصور من Google أو أي موقع خارجي لعرض صورتك الفريدة فوراً لقراء المجالس!
              </p>
            </div>

            {/* Preset selectors */}
            <div>
              <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-2">أو اختر من المعرض الإيماني السريع:</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => setCustomAvatarUrl(av.url)}
                    className={`p-1.5 rounded-xl border text-right transition-all flex items-center gap-2 text-[10px] cursor-pointer ${
                      customAvatarUrl === av.url
                        ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                        : "bg-neutral-950 border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-8 h-8 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate font-semibold">{av.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-550 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ بيانات هويتي 🕌</span>
            </button>

          </div>

          {/* Left Column: VIP & SVIP Sections with levels */}
          <div className="space-y-4">
            
            {/* VIP Tiers Panel */}
            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-indigo-400" />
                  رتبة الـ VIP الإيمانية (مستويات 1-5)
                </h3>
                
                {/* Manual toggle check for testing */}
                <button
                  onClick={toggleVipDemonstration}
                  className={`text-[8px] font-black px-2 py-1 rounded transition-colors cursor-pointer ${
                    profile.isVip 
                      ? "bg-indigo-500 text-white" 
                      : "bg-neutral-950 text-indigo-400 border border-neutral-850"
                  }`}
                >
                  {profile.isVip ? "VIP مفعّل ✓" : "تفعيل VIP تجريبي"}
                </button>
              </div>

              {/* Levels Meter */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-850">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-neutral-300">مستوى VIP الحالي: {vipInfo.lvl} من 5</span>
                  <span className="font-bold text-neutral-400 font-mono">النقاط: {profile.points}</span>
                </div>
                
                <p className="text-[10px] text-indigo-300 font-bold mb-2.5">
                  لقب الترويض: <span className="text-white bg-indigo-505/10 px-1.5 py-0.5 rounded mr-1 inline-block">{vipInfo.label}</span>
                </p>

                {/* Progress bar */}
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${vipInfo.progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-[8px] text-neutral-500">
                  <span>المستوى التالي يتطلب: {vipInfo.next}</span>
                  <span>الامتياز: تلوين لقبك بلون مميز</span>
                </div>
              </div>

              {/* VIP Benefits list */}
              <div className="mt-3.5 space-y-2">
                <p className="text-[9px] text-neutral-400 font-bold">مزايا مستويات الـ VIP :</p>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-neutral-500 leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 font-serif">●</span>
                    <span>مستوى 1: لقب "طالب علم" 🌱</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-450 font-serif">●</span>
                    <span>مستوى 2: إطار ياقوتي للبروفايل</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-450 font-serif">●</span>
                    <span>مستوى 3: دخلة ترحيبية خاصة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-450 font-serif">●</span>
                    <span>مستوى 4 & 5: هدايا صوتية فريدة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVIP Royal Tiers Panel */}
            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-extrabold text-white text-xs md:text-sm flex items-center gap-2">
                  <Crown className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  عضوية الـ SVIP الملكية (مستويات 1-5)
                </h3>
                
                {/* SVIP instant unlock switch for testing */}
                <button
                  onClick={toggleSvipDemonstration}
                  className={`text-[8px] font-black px-2 py-1 rounded transition-colors cursor-pointer ${
                    profile.isSvip 
                      ? "bg-amber-500 text-neutral-950 font-extrabold animate-pulse" 
                      : "bg-neutral-950 text-amber-400 border border-neutral-850"
                  }`}
                >
                  {profile.isSvip ? "SVIP مفعّل✓" : "تفعيل SVIP مجاناً للتيست 👑"}
                </button>
              </div>

              {/* Levels Meter */}
              <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-850">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-amber-400">مستوى SVIP الملكي: {svipInfo.lvl} من 5</span>
                  <span className="font-black text-white">{profile.isSvip ? "نشط" : "مغلق 🔒"}</span>
                </div>
                
                <p className="text-[10px] text-amber-500/95 font-bold mb-2.5">
                  رتبة المجد: <span className="text-neutral-950 bg-gradient-to-l from-amber-500 to-yellow-400 px-1.5 py-0.5 rounded font-black mr-1 inline-block">{svipInfo.label}</span>
                </p>

                {/* Progress bar */}
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-l from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${profile.isSvip ? svipInfo.progress : 0}%` }}
                  />
                </div>

                <div className="flex justify-between text-[8px] text-neutral-500">
                  <span>المستوى الملكي التالي: {svipInfo.next}</span>
                  <span>الامتياز: هالة ذهبية دوّارة</span>
                </div>
              </div>

              {/* Alert detail about SVIP donation numbers */}
              <div className="mt-3 bg-neutral-950/40 p-2 border border-neutral-850 rounded-lg flex items-start gap-1.5 text-[9px] text-neutral-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  طريقة الشحن المعتمدة هي تحويل فودافون كاش مباشرة لمؤسس ومدير الموقع الأستاذ القدير <strong className="text-white mb-0.5">"أحمد علاء"</strong> على رقم: <strong className="text-amber-400">01507251444</strong> لتنشيط حسابك فورياً!
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="mt-6 border-t border-neutral-900 pt-4 text-center">
          <p className="text-[10px] text-neutral-500 font-semibold flex items-center justify-center gap-1">
            <span>جميع بياناتكم ومستوياتكم تخضع لنظام الحفظ الآمن في المتصفح والاتصال المشفر 🔓</span>
          </p>
        </div>

      </motion.div>
    </div>
  );
}
