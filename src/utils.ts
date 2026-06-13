import { UserProfile, UserLevel } from "./types";

export function b64toBlob(b64Data: string, contentType = 'audio/mp3', sliceSize = 512): Blob {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteSlice = new Uint8Array(byteNumbers);
    byteArrays.push(byteSlice);
  }

  return new Blob(byteArrays, { type: contentType });
}

export const INITIAL_PROFILE: UserProfile = {
  name: "طالب العلم",
  points: 500,
  level: UserLevel.BEGINNER,
  xp: 50,
  completedQuizzes: [],
  unlockedThemes: ["theme-emerald"],
  unlockedBadges: ["badge-1"],
  dailyLoginStreak: 1,
  lastLoginDate: new Date().toISOString(),
  isBanned: false,
  banReason: "",
  siteRole: "regular",
  adminGrantedBadges: []
};

export const AVAILABLE_BADGES = [
  { id: "badge-1", title: "مستكشف النور", description: "البدء بالانضمام لمنصة إسلام بالعربي والتعلم", icon: "✨", pointsRequired: 0 },
  { id: "badge-quran", title: "صديق القرآن", description: "استمعت إلى سورة قرآنية مع التفسير", icon: "📖", pointsRequired: 150 },
  { id: "badge-hadith", title: "محيي السُنّة", description: "درست الأحاديث النبوية وطلبت الشرح", icon: "💎", pointsRequired: 250 },
  { id: "badge-seerah-master", title: "منهج النبوة", description: "أتممت جميع اختبارات السيرة النبوية بنجاح", icon: "🕌", pointsRequired: 500 },
  // شارات الإدارة الممنوحة من صاحب الموقع
  { id: "badge-admin-owner", title: "تاج المالك والمؤسس 👑", description: "شارة القيادة العليا لمؤسس ومالك الموقع الأستاذ أحمد علاء", icon: "👑", pointsRequired: 9999 },
  { id: "badge-admin-moderator", title: "درع المشرف العام 🛡️", description: "شارة الرقابة والإشراف العام على شؤون الأعضاء والمجالس الصوتية", icon: "🛡️", pointsRequired: 9999 },
  { id: "badge-admin-support", title: "الدعم الفني المعتمد 🎧", description: "طاقم فريق خدمة العملاء والمساعدين التقنيين لمنصة إسلام بالعربي", icon: "🎧", pointsRequired: 9999 }
];

export const THEME_PRESETS = [
  { id: "theme-emerald", name: "الروضة الخضراء", primary: "from-emerald-800 to-indigo-900", accent: "bg-emerald-600", border: "border-emerald-600", text: "text-emerald-400" },
  { id: "theme-gold", name: "محراب الكعبة", primary: "from-amber-900 to-neutral-900", accent: "bg-amber-600", border: "border-amber-500", text: "text-amber-400" },
  { id: "theme-dusk", name: "شفق الأقصى", primary: "from-teal-900 to-slate-900", accent: "bg-teal-600", border: "border-teal-500", text: "text-teal-400" },
  { id: "theme-desert", name: "رمال الحجاز", primary: "from-orange-950 to-stone-900", accent: "bg-orange-700", border: "border-orange-600", text: "text-orange-400" }
];

export function calculateLevelAndXP(xp: number): { level: UserLevel; nextLevelXp: number } {
  if (xp >= 1000) return { level: UserLevel.DISTINGUISHED, nextLevelXp: 1500 };
  if (xp >= 600) return { level: UserLevel.JURIST, nextLevelXp: 1000 };
  if (xp >= 300) return { level: UserLevel.MEMORIZER, nextLevelXp: 600 };
  if (xp >= 150) return { level: UserLevel.SEEKER, nextLevelXp: 300 };
  return { level: UserLevel.BEGINNER, nextLevelXp: 150 };
}
