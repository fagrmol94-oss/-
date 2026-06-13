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
  Headphones
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
  onAddPoints: (points: number, reason: string) => void;
}

export default function SupportSection({ profile, onAddPoints }: SupportSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "support-welcome",
      sender: "support_bot",
      text: `أهلاً ومرحباً بك يا ${profile.name} في مركز خدمة العملاء والدعم الفني لمنصة "إسلام بالعربي"! 🌹

أنا موظف الدعم الذكي والمساعد الفني "إسلام بالعربي بوت". يسعدني جداً وبكل صدر رحب أن أساعدك في حل أي مشكلة أو استفسار يخص تفاصيل حسابك (الأكونت ميديا)، طريقة الشحن، شراء العملات، أو تفعيل عضوية الـ SVIP الأسطورية.

تفضل بكتابة سؤالك بالتفصيل، أو يمكنك استخدام الأزرار السريعة بالأعلى لطرح مشكلتك فوراً! 👇`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
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
      onAddPoints(10, "التواصل البنّاء مع الدعم الفني الذكي للمنصة");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "عذراً، فشلت عملية الاتصال بخادم خدمة العملاء. يرجى التحقق من اتصالك بالإنترنت والملف الشخصي.");
    } finally {
      setIsLoading(false);
    }
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

    </div>
  );
}
