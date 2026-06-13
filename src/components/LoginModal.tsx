import { useState } from "react";
import { X, Sparkles, LogIn, CheckCircle2, ShieldCheck, Mail, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (
    name: string,
    email: string,
    provider: "google" | "facebook",
    avatarUrl: string
  ) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [authStep, setAuthStep] = useState<"choose-provider" | "google-consent" | "facebook-consent" | "custom-credentials">("choose-provider");
  const [loading, setLoading] = useState<boolean>(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const handleProviderSelect = (provider: "google" | "facebook") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthStep(provider === "google" ? "google-consent" : "facebook-consent");
    }, 700);
  };

  const executeLogin = (name: string, email: string, provider: "google" | "facebook", avatar: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(name, email, provider, avatar);
      onClose();
      // Reset state for next opens
      setAuthStep("choose-provider");
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      {/* Outer wrapper to prevent event bubble */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 relative"
      >
        {/* Decorative Top header background glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-l from-amber-500 via-emerald-500 to-indigo-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step 1: Default Selection */}
        {authStep === "choose-provider" && (
          <div className="p-6 text-right">
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-amber-500/10">
                🕌
              </div>
              <h3 className="text-xl font-black text-white mt-4 font-serif">بوابة تسجيل الدخول الآمن</h3>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
                سجل دخولك الآن عبر حسابك لحفظ مستواك العلمي ونقاطك، والمشاركة الفعالة في المجالس الصوتية!
              </p>
              
              {/* Point bonus gift alert */}
              <div className="mt-4 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>احصل على +200 نقطة مجانية فور التسجيل 🎁</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {/* Google login Button */}
              <button
                onClick={() => handleProviderSelect("google")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-neutral-100 text-neutral-900 rounded-2xl font-bold text-sm transition-all shadow-md transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  {/* Flat Google vector G logo icon representation */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.173-2.763-6.173-6.173s2.763-6.173 6.173-6.173c1.554 0 2.964.57 4.053 1.51l3.153-3.153C19.266 2.062 15.96.953 12.24.953c-6.1 0-11.047 4.947-11.047 11.047s4.947 11.047 11.047 11.047c5.96 0 10.74-4.324 11.047-10.285h-11.047z"
                    />
                  </svg>
                  <span>تسجيل الدخول بحساب جوجل (Google)</span>
                </div>
                <LogIn className="w-4 h-4 text-neutral-500" />
              </button>

              {/* Facebook login Button */}
              <button
                onClick={() => handleProviderSelect("google")} // We reuse Google or trigger Facebook consent step
                onMouseDown={() => setAuthStep("facebook-consent")}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-2xl font-bold text-sm transition-all shadow-md transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                  <span>تسجيل الدخول بواسطة فيسبوك (Facebook)</span>
                </div>
                <LogIn className="w-4 h-4 text-white/80" />
              </button>

              {/* Custom manual login trigger */}
              <button
                onClick={() => setAuthStep("custom-credentials")}
                className="w-full text-center py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider block font-semibold hover:underline"
              >
                أو استخدام هوية مخصصة للقرّاء
              </button>
            </div>

            <div className="mt-8 border-t border-neutral-900 pt-4 flex items-center gap-2 justify-center text-neutral-500 text-[10px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>اتصال مشفر وآمن 100% متوافق مع لوائح الخصوصية الإسلامية</span>
            </div>
          </div>
        )}

        {/* Step 2: Google Authentic-looking Consent Popup */}
        {authStep === "google-consent" && (
          <div className="p-6 text-right">
            <div className="text-center pb-4 border-b border-neutral-900">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-1.14 2.77-2.4 3.61v3h3.86c2.26-2.08 3.59-5.14 3.59-8.44z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1C3.26 21.3 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.6H1.29C.47 8.23 0 10.06 0 12s.47 3.77 1.29 5.4l3.98-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.6l3.98 3.11c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <h4 className="text-sm font-bold text-neutral-350 mt-2">تسجيل الدخول باستخدام Google</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">للمتابعة إلى تطبيق إسلام بالعربي</p>
            </div>

            <p className="text-xs font-bold text-neutral-400 mt-5 mb-3">اختر حساباً للمتابعة:</p>

            <div className="space-y-2">
              <button
                onClick={() =>
                  executeLogin(
                    "أحمد الفاروق",
                    "ahmed.farooq.islam@gmail.com",
                    "google",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                  )
                }
                className="w-full flex items-center gap-3 p-3 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-right transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-700 font-bold text-white flex items-center justify-center font-serif">
                  أ
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">أحمد الفاروق</p>
                  <p className="text-[10px] text-neutral-500">ahmed.farooq.dev@gmail.com</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">نشط</span>
              </button>

              <button
                onClick={() =>
                  executeLogin(
                    "فاطمة الزهراء",
                    "fatima.alzahr@gmail.com",
                    "google",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
                  )
                }
                className="w-full flex items-center gap-3 p-3 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-right transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-700 font-bold text-white flex items-center justify-center font-serif">
                  ف
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">فاطمة الزهراء</p>
                  <p className="text-[10px] text-neutral-500">fatima.alzahr@gmail.com</p>
                </div>
              </button>

              <button
                onClick={() => setAuthStep("custom-credentials")}
                className="w-full text-center py-2.5 bg-neutral-950 border border-dashed border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-bold rounded-xl transition-all"
              >
                ➕ استخدام حساب جوجل آخر مخصص
              </button>
            </div>

            <button
              onClick={() => setAuthStep("choose-provider")}
              className="mt-6 w-full text-center py-2 text-xs text-neutral-500 hover:text-neutral-400 transition-colors block"
            >
              الرجوع للخلف
            </button>
          </div>
        )}

        {/* Step 3: Facebook Authentic-looking Consent Popup */}
        {authStep === "facebook-consent" && (
          <div className="p-6 text-right">
            <div className="text-center pb-4 border-b border-neutral-900 flex flex-col items-center">
              <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg">
                f
              </div>
              <h4 className="text-sm font-bold text-neutral-350 mt-3 font-serif">متابعة الدخول باستخدام فيسبوك</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">طلب إذن وصول ومزامنة الهوية</p>
            </div>

            <div className="my-6 bg-neutral-900/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
                ستتلقى منصة <span className="text-amber-400">إسلام بالعربي</span> البيانات العامة التالية:
              </p>
              <ul className="text-[11px] text-neutral-400 space-y-1.5 list-disc list-inside">
                <li>الاسم الكامل وبيانات الملف التعريفي</li>
                <li>عنوان البريد الإلكتروني الافتراضي</li>
                <li>صورة الحساب الشخصية (Avatar)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  executeLogin(
                    "محمد السقا",
                    "sakka.fares@facebook.com",
                    "facebook",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  )
                }
                className="w-full py-3 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-xl font-bold text-xs. transition-all shadow-md active:scale-98 cursor-pointer text-center block"
              >
                متابعة باسم "محمد السقا"
              </button>

              <button
                onClick={() => setAuthStep("choose-provider")}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border border-neutral-800 rounded-xl font-bold text-xs transition-all text-center block cursor-pointer"
              >
                إلغاء ورفض الإذن
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Custom login details manually */}
        {authStep === "custom-credentials" && (
          <div className="p-6 text-right">
            <h4 className="text-sm font-bold text-white border-b border-neutral-900 pb-2 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              تخصيص بيانات الهوية الإسلامية للمدرسين والطلاب
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">الاسم الكريم:</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="مثال: الباحث الأزهري أحمد"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 pr-9 py-2.5 rounded-xl outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">البريد الإلكتروني:</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="dev@example.com"
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 pr-9 py-2.5 rounded-xl outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const finalName = customName.trim() || "قارئ جديد";
                    const finalEmail = customEmail.trim() || "reader@islam.belaraby";
                    executeLogin(finalName, finalEmail, "google", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80");
                  }}
                  className="w-full py-3 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold text-xs transition-all shadow-md text-center block cursor-pointer"
                >
                  حفظ وتسجيل دخول فوري 🕌
                </button>

                <button
                  onClick={() => setAuthStep("choose-provider")}
                  className="mt-3 w-full text-center py-2 text-xs text-neutral-500 hover:text-neutral-400 transition-colors block"
                >
                  الرجوع للخيارات الاجتماعية
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
