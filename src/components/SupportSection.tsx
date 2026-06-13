import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Trash2, 
  HeartHandshake, 
  Coins, 
  UserCheck, 
  HelpCircle, 
  CheckCircle2, 
  MessageSquare,
  Smartphone,
  ShieldCheck,
  Headphones,
  Crown,
  Shield,
  Settings,
  ShieldAlert,
  UserX,
  UserCheck2,
  Lock,
  Unlock,
  Wrench
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "support_bot";
  text: string;
  time: string;
}

interface SupportSectionProps {
  profile: UserProfile;
  onAddPoints: (points: number, reason: string, extraFields?: Partial<UserProfile>) => void;
}

export default function SupportSection({ profile, onAddPoints }: SupportSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "support-welcome",
      sender: "support_bot",
      text: `أهلاً ومرحباً بك يا ${profile.name} في مركز خدمة العملاء والدعم الفني لمنصة "إسلام بالعربي"! 🌹

أنا موظف الدعم الذكي والمساعد الفني "إسلام بالعربي بوت". يسعدني جداً وبكل صدر رحب أن أساعدك في حل أي مشكلة أو استفسار يخص تفاصيل حسابك (الأكونت ميديا), طريقة الشحن، شراء العملات، أو تفعيل عضوية الـ SVIP الأسطورية.

تفضل بكتابة سؤالك بالتفصيل، أو يمكنك استخدام الأزرار السريعة بالأعلى لطرح مشكلتك فوراً! 👇`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [adminStatusMessage, setAdminStatusMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick Action Buttons list
  const quickActions = [
    {
      label: "كيف أشحن حسابي بالعملات والذهب؟ 🪙",
      text: "كيف يمكنني شحن حسابي بالعملات والنقاط الذهبية في المتجر؟"
    },
    {
      label: "رقم وطريقة فودافون كاش المعتمدة؟ 📱",
      text: "أريد معرفة رقم فودافون كاش المعتمد لتحويل الأموال وطريقة تأكيد الشحن مع الإدارة."
    },
    {
      label: "مشكلة عدم حفظ مستوى ونقاط الأكونت 🔑",
      text: "لدي مشكلة في عدم حفظ مستوى حسابي ونقاطي بعد مسح الكاش أو كزائر، كيف أحميه؟"
    },
    {
      label: "شحن عضوية الـ SVIP الملكية الأسطورية 👑",
      text: "ما هي ميزات وطريقة الاشتراك في عضوية الـ SVIP الأسطورية بقيمة 5000 ج.م؟"
    },
    {
      label: "كيف أتواصل مع الإدارة مباشرة؟ 📞",
      text: "أريد التواصل مع الأستاذ أحمد علاء مدير الموقع مباشرة لحل مشكلة يدوية."
    }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean chat log
  const clearChat = () => {
    setMessages([
      {
        id: "support-reset",
        sender: "support_bot",
        text: `أهلاً بك مجدداً يا ${profile.name}! لقد تم تهيئة نافذة الدعم الفني. كيف يمكن لبوت الدعم الفني "إسلام بالعربي بوت" مساعدتك الآن في قضايا الشحن أو حسابك؟`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorMessage("");
  };

  // Submit chat message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Map message history to server format
      const historyLog = messages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyLog
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "حدث خطأ أثناء التواصل مع خادم الدعم الفني");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "support_bot",
        text: data.reply,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

      // Check if user account needs to be banned based on server response
      if (data.isAbuseTriggered) {
        onAddPoints(0, "تم حظر الحساب تلقائياً بسبب الإساءة في الدعم الفني", {
          isBanned: true,
          banReason: data.banReason || "مخالفة الآداب العامة وإرسال كلمات بذيئة لبوت الدعم الفني."
        });
      } else {
        onAddPoints(10, "التواصل البنّاء مع الدعم الفني الذكي للمنصة");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "عذراً، فشلت عملية الاتصال بخادم خدمة العملاء. يرجى التحقق من اتصالك بالإنترنت والملف الشخصي.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle administrative badges (Crown, Shield, Headset) granted by owner/system
  const toggleAdminBadge = (badgeId: string) => {
    const currentAdminBadges = profile.adminGrantedBadges || [];
    const currentUnlockedBadges = profile.unlockedBadges || [];
    const hasBadge = currentAdminBadges.includes(badgeId);

    let updatedAdminBadges = [...currentAdminBadges];
    let updatedUnlockedBadges = [...currentUnlockedBadges];

    if (hasBadge) {
      updatedAdminBadges = updatedAdminBadges.filter(id => id !== badgeId);
      updatedUnlockedBadges = updatedUnlockedBadges.filter(id => id !== badgeId);
      setAdminStatusMessage(`تم سحب شارة الحساب إدارياً: ${badgeId === 'badge-admin-owner' ? 'تاج المالك' : badgeId === 'badge-admin-moderator' ? 'درع المشرف' : 'الدعم الفني'}`);
    } else {
      updatedAdminBadges.push(badgeId);
      if (!updatedUnlockedBadges.includes(badgeId)) {
        updatedUnlockedBadges.push(badgeId);
      }
      setAdminStatusMessage(`تم منح شارة الإدارة المعتمدة بنجاح للأكونت الحالي! 🎉`);
    }

    onAddPoints(0, "تعديل الشارات الإدارية للموقع", {
      adminGrantedBadges: updatedAdminBadges,
      unlockedBadges: updatedUnlockedBadges
    });

    setTimeout(() => setAdminStatusMessage(""), 4000);
  };

  // Set designated administrative site rules role
  const updateSiteRole = (role: "regular" | "moderator" | "admin" | "owner") => {
    let reason = "ترقية رتبة العضوية الحالية";
    let alertMsg = "";
    if (role === "owner") {
      alertMsg = "مرحباً بك يا مديرنا العام الأستاذ أحمد علاء! تم توثيق هويتك كمالك للمنصة 👑";
      // Auto unlock owner badges if they become owner
      const nextBadges = [...(profile.adminGrantedBadges || [])];
      const nextUnlocked = [...(profile.unlockedBadges || [])];
      if (!nextBadges.includes("badge-admin-owner")) nextBadges.push("badge-admin-owner");
      if (!nextUnlocked.includes("badge-admin-owner")) nextUnlocked.push("badge-admin-owner");

      onAddPoints(2000, "صلاحية مالك الموقع أحمد علاء", {
        siteRole: "owner",
        adminGrantedBadges: nextBadges,
        unlockedBadges: nextUnlocked
      });
    } else if (role === "admin") {
      alertMsg = "تم تسجيلك كمنسق ومدير للدعم الفني للمنصة 🛡️";
      const nextBadges = [...(profile.adminGrantedBadges || [])];
      const nextUnlocked = [...(profile.unlockedBadges || [])];
      if (!nextBadges.includes("badge-admin-support")) nextBadges.push("badge-admin-support");
      if (!nextUnlocked.includes("badge-admin-support")) nextUnlocked.push("badge-admin-support");

      onAddPoints(1000, "ترقية رتبة منسق دعم فني", {
        siteRole: "admin",
        adminGrantedBadges: nextBadges,
        unlockedBadges: nextUnlocked
      });
    } else if (role === "moderator") {
      alertMsg = "أهلاً بك مشرفاً عاماً على مجالسنا وغرفنا العطرة ⚖️";
      const nextBadges = [...(profile.adminGrantedBadges || [])];
      const nextUnlocked = [...(profile.unlockedBadges || [])];
      if (!nextBadges.includes("badge-admin-moderator")) nextBadges.push("badge-admin-moderator");
      if (!nextUnlocked.includes("badge-admin-moderator")) nextUnlocked.push("badge-admin-moderator");

      onAddPoints(500, "ترقية رتبة مشرف عام", {
        siteRole: "moderator",
        adminGrantedBadges: nextBadges,
        unlockedBadges: nextUnlocked
      });
    } else {
      alertMsg = "تم تصفير الرتب الإدارية للأكونت لعضوية عادية 🌱";
      onAddPoints(0, "إرجاع الحساب لعضو عادي", {
        siteRole: "regular",
        adminGrantedBadges: [],
        unlockedBadges: profile.unlockedBadges.filter(id => !id.startsWith("badge-admin-"))
      });
    }

    setAdminStatusMessage(alertMsg);
    setTimeout(() => setAdminStatusMessage(""), 5500);
  };

  // Quick cash credits developer injection cheat
  const grantMillionPoints = () => {
    onAddPoints(1000000, "شحن مليون عملة ذهبية معتمد من سيستم الإدارة والمالك كاش");
  };

  return (
    <div id="support-section-wrapper" className="space-y-6" dir="rtl">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-l from-amber-500/20 to-neutral-900 border border-neutral-800 p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-lg shadow-amber-500/5">
            <HeartHandshake className="w-7 h-7 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h2 className="font-extrabold text-white text-base md:text-xl flex items-center gap-2">
              خدمة العملاء والدعم الفني المعتمد 📞
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              نحن هنا لخدمتك على مدار الساعة في منصة إسلام بالعربي. يمكنك الاستشارات بخصوص شحن عملات المتجر الذهب، حماية الأكونت، وتخطي عقبات تصفير تتابعات حسابك!
            </p>
          </div>
        </div>
        <div className="bg-neutral-950/80 border border-neutral-850 px-4 py-2.5 rounded-2xl shrink-0 w-full md:w-auto text-center md:text-right flex justify-between md:block z-10">
          <span className="text-[10px] text-neutral-500 block">حالة الاتصال بالدعم</span>
          <span className="text-xs font-black text-emerald-400 mt-1 flex items-center justify-center md:justify-end gap-1.5 leading-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            نشط متصل الآن 🟢
          </span>
        </div>
      </div>

      {/* 2. Grid Chat Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Quick Panel: Cards (Desktop: 4-cols, Mobile/Tab: hidden/responsive) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Quick FAQ Quick-Links Box */}
          <div className="bg-neutral-900/60 p-5 rounded-3xl border border-neutral-800 space-y-4">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-500" />
              أقسام الدعم وملاحظات هامة:
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-2xl flex items-start gap-3">
                <Coins className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-right">
                  <p className="font-bold text-xs text-neutral-200">الشحن الذاتي وفودافون كاش 🪙</p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    يتم تحويل الشحن مباشرة إلى صاحب الموقع الأستاذ **أحمد علاء** على الرقم **01507251444**. يرجى تصوير إيصالك لتقديمه فوراً.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-2xl flex items-start gap-3">
                <UserCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-right">
                  <p className="font-bold text-xs text-neutral-200">ربط وحفظ الأكونت 🔐</p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    تجنب البقاء كزائر مجهول لتفادي فقدان نقاطك وتعبك بالموقع! اضغط على زر الدخول لربطه بجوجل أو فيسبوك بنقرة واحدة.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-850 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-right">
                  <p className="font-bold text-xs text-neutral-200">أمان وحماية تامة 🛡️</p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    من خلال خوارزميات الذكاء الاصطناعي الآمنة، تشفير الاتصالات يحفظ خصوصية تحويلاتك المادية وبيانات تصفحك في أمان تام.
                  </p>
                </div>
              </div>
            </div>

            <button
              id="clear-support-log-btn"
              onClick={clearChat}
              className="w-full mt-2 py-3 border border-red-950/40 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-extrabold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              تنظيف أرشيف محادثة الدعم
            </button>
          </div>

          {/* Quick Contacts Info Block */}
          <div className="bg-neutral-950/60 p-5 rounded-3xl border border-neutral-850 space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              التواصل اليدوي المباشر مع الإدارة:
            </h4>
            <div className="text-right space-y-1.5 text-xs text-neutral-300 leading-relaxed bg-neutral-950/80 p-3 rounded-2xl border border-neutral-850 font-mono">
              <p>📱 رقم الواتساب: <span className="text-amber-400 select-all font-bold">01507251444</span></p>
              <p>👤 المسؤول: الأستاذ أحمد علاء</p>
              <p>🕒 الاستجابة: فوري - خلال دقائق معدودة</p>
            </div>
            <p className="text-[10px] text-neutral-500 text-center">
              * الدعم الفني عبر البوت الذكي تفاعلي ويعمل بالكامل مع Gemini Flash!
            </p>
          </div>

        </div>

        {/* Right Side Support Bot Chat Station: 8-cols */}
        <div className="lg:col-span-8 flex flex-col h-[580px] bg-neutral-900/40 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
          
          {/* Chat station header */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex justify-between items-center px-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 relative shadow font-serif font-black font-semibold text-lg border border-amber-300/20">
                إب
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-sm text-neutral-100">إسلام بالعربي بوت</p>
                  <span className="text-[8px] bg-amber-500/15 text-amber-350 px-2 py-0.5 rounded-full font-black border border-amber-500/20">الموظف الذكي للدعم الفني</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">مستشار واستشاري حساباتك وحل مشاكل الشحن 💻</p>
              </div>
            </div>
            
            <button
              id="clear-chat-log-mobile-support-btn"
              onClick={clearChat}
              className="lg:hidden text-neutral-500 hover:text-neutral-300 p-2"
              title="تفريغ الأرشيف"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Quick FAQ Interactive Prompts strip */}
          <div className="p-3 border-b border-neutral-850/60 bg-neutral-950/20 flex gap-2 overflow-x-auto scrollbar-none sticky top-0 z-10 px-4">
            {quickActions.map((action, idx) => (
              <button
                id={`support-quick-action-btn-${idx}`}
                key={idx}
                type="button"
                onClick={() => {
                  handleSendMessage(action.text);
                }}
                disabled={isLoading}
                className="text-right whitespace-nowrap px-3.5 py-2 rounded-2xl bg-neutral-950/90 border border-neutral-800 hover:border-amber-400 text-[10px] text-neutral-350 hover:text-white font-extrabold transition-all cursor-pointer inline-block shrink-0 whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages Area logs container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800/80 bg-neutral-950/10">
            {messages.map((m, idx) => (
              <div 
                key={`${m.id}-${idx}`}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === "user" ? "mr-auto text-left items-start" : "ml-auto text-right items-end"
                }`}
              >
                {/* Message Box */}
                <div 
                  className={`p-3.5 md:p-4 rounded-3xl text-xs md:text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-amber-500 text-neutral-950 rounded-tl-none font-bold shadow-md shadow-amber-500/5"
                      : "bg-neutral-950 border border-neutral-850 text-neutral-250 rounded-tr-none"
                  }`}
                >
                  {m.text}
                </div>
                {/* Message Timestamp */}
                <span className="text-[9px] text-neutral-500 mt-1 font-mono pr-2 pl-2 block">
                  {m.sender === "user" ? "أنت" : "إسلام بالعربي بوت"} • {m.time}
                </span>
              </div>
            ))}

            {/* Is Loader Loading */}
            {isLoading && (
              <div className="flex flex-col items-end max-w-[85%] ml-auto">
                <div className="bg-neutral-950/90 border border-neutral-850 p-4 rounded-3xl rounded-tr-none flex items-center gap-3 text-xs text-neutral-400">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>يقوم "إسلام بالعربي بوت" بمراجعة معطيات الشحن وخوارزمية حسابك...</span>
                </div>
              </div>
            )}

            {/* Error alerts prompt */}
            {errorMessage && (
              <div className="bg-red-950/20 text-red-400 p-4 rounded-2xl border border-red-900/30 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form input messaging box */}
          <form 
            id="support-message-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center gap-2 px-4"
          >
            <input
              id="support-chat-input-field"
              type="text"
              placeholder="اكتب تفاصيل مشكلة شحن العملات أو الحساب لحلها فوراً..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-neutral-950 border border-neutral-800 text-xs md:text-sm text-neutral-200 placeholder-neutral-500 py-3.5 px-4 rounded-2xl outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <button
              id="support-chat-submit-btn"
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-amber-450 hover:bg-amber-400 disabled:bg-neutral-850 disabled:text-neutral-600 text-neutral-950 flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 shadow-md shadow-amber-500/10"
            >
              <Send className="w-4.5 h-4.5 rotate-180" />
            </button>
          </form>

        </div>

      </div>

      {/* 3. SITE ADMINISTRATION SYSTEM & BADGE DISPENSARY PANEL */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-5 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Admin System Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-450 shadow-inner">
              <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm md:text-base flex items-center gap-2">
                سيستم إدارة وبث شارات الإدارة والمسؤولين ⚙️
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                نظام تحكم المالك والمؤسس (الأستاذ أحمد علاء) لمنح شارات القيادة ومتابعة الموظفين يدوياً وتجربتها.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-neutral-500 font-bold bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-850">
              رتبتك الإدارية الحالية: 
              <span className="text-white font-bold ml-1">
                {profile.siteRole === "owner" ? "👑 مالك الموقع" : 
                 profile.siteRole === "admin" ? "🛡️ مدير الدعم" : 
                 profile.siteRole === "moderator" ? "⚖️ مشرف عام" : "🌱 عضو عادي"}
              </span>
            </span>
          </div>
        </div>

        {/* Administration Status Toast inside support segment */}
        <AnimatePresence>
          {adminStatusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-500 text-neutral-950 px-4 py-3 rounded-2xl text-xs font-black shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>{adminStatusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Grid Panel 1: Simulation Role Selector (Left column - 5 cols) */}
          <div className="md:col-span-5 bg-neutral-950/60 p-5 rounded-2xl border border-neutral-850 space-y-4">
            <h4 className="text-xs font-black text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-850 pb-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              تفعيل ومحاكاة صلاحية مالك الموقع:
            </h4>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              وفقاً لقواعد وضوابط إدارة الموقع، يُسمح للأستاذ أحمد علاء بتعيين وتغيير رتب أي حساب ومنح الشارات مباشرة. يمكنك محاكاة الأدوار الإدارية لتجربتها بنفسك:
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <button
                id="admin-role-owner-btn"
                onClick={() => updateSiteRole("owner")}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  profile.siteRole === "owner"
                    ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10 font-black"
                    : "bg-neutral-900 border border-neutral-800 text-amber-400 hover:border-amber-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-4.5 h-4.5" />
                  الأستاذ أحمد علاء (المالك والمؤسس)
                </span>
                <span className="text-[9px] opacity-75">نشط 👑</span>
              </button>

              <button
                id="admin-role-admin-btn"
                onClick={() => updateSiteRole("admin")}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  profile.siteRole === "admin"
                    ? "bg-red-650 text-white shadow-md shadow-red-500/10 font-black"
                    : "bg-neutral-900 border border-neutral-800 text-red-400 hover:border-red-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5" />
                  مدير الدعم الفني العام
                </span>
                <span className="text-[9px] opacity-75">نشط 🛡️</span>
              </button>

              <button
                id="admin-role-moderator-btn"
                onClick={() => updateSiteRole("moderator")}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  profile.siteRole === "moderator"
                    ? "bg-indigo-650 text-white shadow-md shadow-indigo-500/10 font-black"
                    : "bg-neutral-900 border border-neutral-800 text-indigo-400 hover:border-indigo-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5" />
                  المشرف العام للغرف الإرشادية
                </span>
                <span className="text-[9px] opacity-75">نشط ⚖️</span>
              </button>

              <button
                id="admin-role-regular-btn"
                onClick={() => updateSiteRole("regular")}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  profile.siteRole === "regular" || !profile.siteRole
                    ? "bg-neutral-800 text-white font-black"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5" />
                  حساب زائر عادي (طالب العلم)
                </span>
                <span className="text-[9px] opacity-75">نشط ✓</span>
              </button>

            </div>
          </div>

          {/* Grid Panel 2: Badge Dispensary Section (Right column - 7 cols) */}
          <div className="md:col-span-7 bg-neutral-950/60 p-5 rounded-2xl border border-neutral-850 flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <h4 className="text-xs font-black text-neutral-350 tracking-wider flex items-center gap-1.5 border-b border-neutral-850 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                صندوق توزيع وتثبيت شارات الإدارة الرسمية:
              </h4>

              <p className="text-[11px] text-neutral-400 leading-relaxed mb-2">
                انقر لمنح وتفعيل الشارات الإدارية الساطعة على هذا الأكونت. تمنح الشارات إطارات بروفايل مذهلة وقدرات تسييرية معلنة لتفادي انتحال الهويات بالموقع:
              </p>

              {/* Badges Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Badge 1: Owner badge toggle button */}
                <button
                  id="dispensary-toggle-badge-owner"
                  onClick={() => toggleAdminBadge("badge-admin-owner")}
                  disabled={profile.siteRole !== "owner"}
                  className={`p-3 rounded-2xl border text-right flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    profile.adminGrantedBadges?.includes("badge-admin-owner")
                      ? "bg-amber-500/10 border-amber-450 text-amber-350"
                      : "bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-400"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">👑</span>
                  <p className="font-extrabold text-[10px] text-center mt-1">تاج المالك والمؤسس</p>
                  <p className="text-[8px] text-neutral-500 text-center">شارة للمطور</p>
                </button>

                {/* Badge 2: Moderator badge toggle button */}
                <button
                  id="dispensary-toggle-badge-moderator"
                  onClick={() => toggleAdminBadge("badge-admin-moderator")}
                  disabled={profile.siteRole !== "owner"}
                  className={`p-3 rounded-2xl border text-right flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    profile.adminGrantedBadges?.includes("badge-admin-moderator")
                      ? "bg-indigo-550/15 border-indigo-450 text-indigo-350"
                      : "bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-400"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">🛡️</span>
                  <p className="font-extrabold text-[10px] text-center mt-1">درع المشرف العام</p>
                  <p className="text-[8px] text-neutral-500 text-center">صلاحية الضبط</p>
                </button>

                {/* Badge 3: Support badge toggle button */}
                <button
                  id="dispensary-toggle-badge-support"
                  onClick={() => toggleAdminBadge("badge-admin-support")}
                  disabled={profile.siteRole !== "owner"}
                  className={`p-3 rounded-2xl border text-right flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    profile.adminGrantedBadges?.includes("badge-admin-support")
                      ? "bg-red-500/15 border-red-500 text-red-350"
                      : "bg-neutral-900 border-neutral-850 hover:border-neutral-800 text-neutral-400"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">🎧</span>
                  <p className="font-extrabold text-[10px] text-center mt-1">الدعم الفني المعتمد</p>
                  <p className="text-[8px] text-neutral-500 text-center">أخصائي الدعم</p>
                </button>

              </div>
              
              {profile.siteRole !== "owner" && (
                <p className="text-[9px] text-red-400/90 text-right mt-1.5 font-bold">
                  * يرجى تفعيل دور مالك الموقع (الأستاذ أحمد علاء) أولاً لتتمكن من تشغيل لوحة منح شارات الإدارة!
                </p>
              )}
            </div>

            {/* Quick cash credits developer injection cheat */}
            <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-right">
                <p className="font-extrabold text-xs text-neutral-200">الشحن المعملي الملكي لقنوات البث 🪙</p>
                <p className="text-[9px] text-neutral-500">يتيح لك منح 1,000,000 عملة لأكونتك الشخصي لمحاكاة شراء كافة عروض SVIP وهدايا المجالس الصوتية!</p>
              </div>
              <button
                id="grant-royal-points-btn"
                onClick={grantMillionPoints}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-neutral-950 font-black text-[10px] rounded-xl cursor-pointer active:scale-95 transition-all shadow"
              >
                شحن +1,000,000 عملة مجاناً 🪙
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
