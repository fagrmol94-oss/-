export enum UserLevel {
  BEGINNER = "مبتدئ",
  SEEKER = "طالب علم",
  MEMORIZER = "حافظ",
  JURIST = "فقيه",
  DISTINGUISHED = "متميز"
}

export interface UserProfile {
  name: string;
  points: number;
  level: UserLevel;
  xp: number; // Experience points
  completedQuizzes: string[]; // List of completed Seerah lesson IDs
  unlockedThemes: string[]; // List of unlocked app themes
  unlockedBadges: string[]; // List of badge IDs
  dailyLoginStreak: number;
  lastLoginDate: string; // ISO string
  isSvip?: boolean; // SVIP membership status
  isVip?: boolean; // VIP membership status
  vipLevel?: number; // VIP Level 1-5
  svipLevel?: number; // SVIP Level 1-5
  activeFrame?: string; // "star-spin" | "fire-glow" | "gold-sparkle" | "rainbow-flow" | "none"
  activeEntrance?: string; // "lightning-strike" | "royal-banner" | "angel-wings" | "none"
  hasAnimatedAvatar30Days?: boolean;
  animatedAvatarExpiry?: string; // Date string
  lastWeeklyClaim?: string; // Date string
  employeeAppSubmitted?: boolean;
  isLoggedIn?: boolean;
  loginProvider?: "google" | "facebook" | null;
  avatarUrl?: string;
  customAvatarUrl?: string;
  isBanned?: boolean;
  banReason?: string;
  siteRole?: "regular" | "admin" | "moderator" | "owner";
  adminGrantedBadges?: string[]; // Badges granted specifically by the owner/admin system
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  type: "Meccan" | "Medinan" | "مكية" | "مدنية";
  versesCount: number;
  verses: {
    number: number;
    text: string;
    translation: string;
  }[];
}

export interface Hadith {
  id: number;
  category: string;
  title: string;
  text: string;
  narrator: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  xpReward: number;
}

export interface SeerahLesson {
  id: string;
  title: string;
  period: string; // Timeframe
  summary: string;
  details: string; // Detailed educational text
  audioDuration: string;
  quiz: QuizQuestion[];
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  type: "theme" | "badge" | "certificate";
  value: string; // Theme styling classes or specific logic
  isPurchased?: boolean;
}

export interface VoiceRoomUser {
  id: string;
  name: string;
  avatar: string;
  isNewUser: boolean;
  points: number;
  isMuted: boolean;
  isSpeaking: boolean;
}

export interface VoiceRoomSeat {
  id: number; // 0 to 9 representing the 10 seats
  user: VoiceRoomUser | null;
}

export interface VoiceGift {
  id: string;
  name: string;
  arabicName: string;
  price: number;
  icon: string;
  description: string;
  pointsReward: number; // spiritual points granted
}

