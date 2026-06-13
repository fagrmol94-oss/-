import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles, RefreshCw, AlertCircle, Trash2, ShieldAlert } from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "hadi";
  text: string;
  time: string;
}

interface AIAssistantProps {
  profile: UserProfile;
  onAddPoints: (points: number, reason: string) => void;
}

export default function AIAssistant({ profile, onAddPoints }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "hadi",
      text: `أهلاً ومرحباً بك يا ${profile.name} في مجلس العلم الذكي! ✨
أنا مرشدك ومساعدك الإسلامي "هادي". يسعدني جداً أن أجيبك عن أي استفسارات تخص القرآن الكريم، مبادئ الفقه الميسر، شرح الأحاديث، أو دروس وعقبات السيرة النبوية المباركة. 

ما الذي يشغلك أو يود قلبك معرفته اليوم؟`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested pre-filled queries
  const quickPrompts = [
    "كيف أزيد من خشوعي في الصلاة؟",
    "حدثني عن مظهر وخُلُق النبي ورحمته بالناس.",
    "ما هي أهمية هجرة النبي من مكة إلى المدينة؟",
    "ما معنى تفسير سورة الفاتحة عموماً؟"
  ];

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean chat log
  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "hadi",
        text: "مرحباً مجدداً في مجلس العلم! تفضل بطرح أسئلتك عن الإسلام تلاوةً وفهماً.",
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

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyLog
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "خطأ مجهول في خادم المحادثة");
      }

      const hadiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "hadi",
        text: data.reply,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, hadiMessage]);
      onAddPoints(15, "الاستفادة من مرشد العلم الذكي هادي");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشلت عملية إرسال الرسالة إلى المرشد هادي.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 rounded-2xl border border-neutral-800 text-right grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[540px]" dir="rtl">
      
      {/* Suggestions and info side banner (desktop only) */}
      <div className="md:col-span-4 bg-neutral-950 p-4 border-l border-neutral-800 flex flex-col justify-between hidden md:flex">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            مجلس الاسترشاد والوعظ
          </h3>
          <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
            مساحة تواصل تعليمية مدعومة بالذكاء الاصطناعي للإجابة على الأسئلة الدينية والتاريخية وتعليم الأخلاق السليمة الميسّرة.
          </p>

          <div className="mt-5 space-y-2">
            <p className="text-[10px] text-neutral-500 font-bold mb-1">الأسئلة الشائعة المقترحة للاستشارة:</p>
            {quickPrompts.map((prompt, idx) => (
              <button
                id={`quick-prompt-btn-${idx}`}
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="w-full text-right p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-[11px] text-neutral-300 border border-neutral-800/80 hover:border-amber-500/20 transition-all block cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <button
          id="clear-chat-log-btn"
          onClick={clearChat}
          className="w-full py-2 border border-red-950/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          تنظيف أرشيف المحادثة
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="md:col-span-8 flex flex-col justify-between h-full bg-neutral-900/10 relative">
        {/* Chat top header */}
        <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 flex justify-between items-center px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white relative shadow">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-xs md:text-sm text-neutral-100">المعلم هادي - المرشد الذكي</p>
              <p className="text-[10px] text-emerald-400 font-medium">نشط وعون لك دائماً</p>
            </div>
          </div>
          <button
            id="clear-chat-log-mobile-btn"
            onClick={clearChat}
            className="md:hidden text-neutral-500 hover:text-neutral-300 p-2"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Message logs area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.map((m, idx) => (
            <div 
              key={`${m.id}-${idx}`}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "user" ? "mr-auto text-left items-start" : "ml-auto text-right items-end"
              }`}
            >
              <div 
                className={`p-3 md:p-3.5 rounded-2xl text-xs md:text-sm whitespace-pre-line leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tl-none font-medium shadow-md"
                    : "bg-neutral-950 border border-neutral-850 text-neutral-200 rounded-tr-none shadow-sm"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 font-mono">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-end max-w-[85%] ml-auto">
              <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl rounded-tr-none flex items-center gap-2.5 text-xs text-neutral-400">
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>يقوم المرشد هادي بالبحث في المصادر لاستنباط الإجابة...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-950/20 text-red-400 p-3.5 rounded-xl border border-red-900/30 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested queries for smartphone/tablet (collapsible rows) */}
        <div className="p-2 border-t border-neutral-800/40 bg-neutral-950/20 flex gap-2 overflow-x-auto md:hidden scrollbar-none pr-3">
          {quickPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              id={`quick-prompt-mob-btn-${idx}`}
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-right whitespace-nowrap px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400 font-semibold"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form 
          id="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center gap-2"
        >
          <input
            id="chat-text-input"
            type="text"
            placeholder="اكتب استشارتك الإسلامية أو اسأل عن السيرة النبوية هنا..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-neutral-950 border border-neutral-800 text-xs md:text-sm text-neutral-200 placeholder-neutral-500 py-3 px-4 rounded-xl outline-none focus:border-amber-500 disabled:opacity-50"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-850 disabled:text-neutral-600 text-neutral-950 flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>

      </div>

    </div>
  );
}
