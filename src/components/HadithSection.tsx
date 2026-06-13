import { useEffect, useState } from "react";
import { Award, Volume2, Sparkles, RefreshCw, AlertCircle, Search, Compass, ShieldAlert } from "lucide-react";
import { hadithData } from "../data/hadith";
import { Hadith } from "../types";
import { b64toBlob } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface HadithSectionProps {
  onPlayAudio: (url: string, title: string, subtitle: string) => void;
  onAddPoints: (points: number, reason: string) => void;
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
  initialHadithId?: number;
}

export default function HadithSection({
  onPlayAudio,
  onAddPoints,
  unlockedBadges,
  onUnlockBadge,
  initialHadithId
}: HadithSectionProps) {
  const [selectedHadith, setSelectedHadith] = useState<Hadith>(() => {
    if (initialHadithId) {
      const match = hadithData.find(h => h.id === initialHadithId);
      if (match) return match;
    }
    return hadithData[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [explainLoading, setExplainLoading] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (initialHadithId) {
      const match = hadithData.find(h => h.id === initialHadithId);
      if (match) {
        setSelectedHadith(match);
        setSelectedCategory("الكل");
        setAiExplanation("");
      }
    }
  }, [initialHadithId]);

  const categories = ["الكل", "الإيمان والنية", "الأخلاق والسلوك", "المعاملات والتكافل", "التربية والتيسير", "العلم وفضله"];

  // Search and filter hadiths
  const filteredHadith = hadithData.filter(h => {
    const matchesCat = selectedCategory === "الكل" || h.category === selectedCategory;
    const matchesSearch = h.title.includes(searchQuery) || h.text.includes(searchQuery) || h.narrator.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Call API for Gemini voice generation
  const listenToHadithWithAi = async (hadith: Hadith) => {
    setAudioLoading(true);
    setErrorMessage("");
    try {
      const textToSpeak = `الحديث الشريف: ${hadith.title}. عن ${hadith.narrator}. قال رسول الله صلى الله عليه وسلم: ${hadith.text}`;
      
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, type: "hadith" })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "فشل توليد التلاوة الصوتية باستخدام الذكاء الاصطناعي");
      }

      // Convert base64 to binary and create blob URL
      const audioBlob = b64toBlob(data.audio, "audio/mp3");
      const audioUrl = URL.createObjectURL(audioBlob);

      onPlayAudio(audioUrl, hadith.title, "صوت مفسر الذكاء الاصطناعي");
      onAddPoints(50, `الاستماع إلى الحديث الصوتي الشريف بالذكاء الاصطناعي`);
      
      if (!unlockedBadges.includes("badge-hadith")) {
        onUnlockBadge("badge-hadith");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "حدث خطأ أثناء الاتصال بخدمة الصوت التلقائي.");
    } finally {
      setAudioLoading(false);
    }
  };

  // Explanation with AI helper
  const explainHadithWithAi = async (hadith: Hadith) => {
    setExplainLoading(true);
    setAiExplanation("");
    setErrorMessage("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hadith",
          text: hadith.text,
          title: hadith.title
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "فشل جلب الشرح الذكي");
      }

      setAiExplanation(data.explanation);
      onAddPoints(30, `فهم وحفظ الحديث الشريف: ${hadith.title}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "تعذر الاتصال بخبير الشرح التلقائي.");
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right" dir="rtl">
      {/* Category Sidebar */}
      <div className="lg:col-span-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-neutral-800 pb-2">
          <Compass className="w-5 h-5 text-amber-500" />
          مجالس الحديث النبوي
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-4 h-4 text-neutral-500" />
          <input
            id="hadith-search-input"
            type="text"
            placeholder="ابحث في الأحاديث والراوي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 pr-9 py-2.5 rounded-xl outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Category List Filters */}
        <div className="flex flex-wrap lg:flex-col gap-1.5">
          {categories.map((c) => (
            <button
              id={`hadith-category-${c}`}
              key={c}
              onClick={() => {
                setSelectedCategory(c);
                setAiExplanation("");
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-right transition-all grow md:grow-0 ${
                selectedCategory === c
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  : "bg-neutral-950 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-900 border border-transparent"
              }`}
            >
              • {c}
            </button>
          ))}
        </div>

        {/* Quick index of matching Hadiths */}
        <div className="flex-1 overflow-y-auto max-h-[180px] lg:max-h-[290px] pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-neutral-800">
          {filteredHadith.map(h => (
            <button
              id={`hadith-select-${h.id}`}
              key={h.id}
              onClick={() => {
                setSelectedHadith(h);
                setAiExplanation("");
              }}
              className={`p-2.5 rounded-xl text-right transition-all border text-xs flex flex-col gap-1 ${
                selectedHadith.id === h.id
                  ? "bg-neutral-900 border-amber-500/30 text-white"
                  : "bg-neutral-950/40 hover:bg-neutral-950 border-neutral-900 text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200">{h.title}</span>
                <span className="text-[10px] bg-neutral-950 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-800 shrink-0">{h.category}</span>
              </div>
              <p className="opacity-80 line-clamp-1 text-[10px] text-neutral-500 mt-1">{h.text}</p>
            </button>
          ))}
          {filteredHadith.length === 0 && (
            <div className="text-center py-6 text-neutral-500">لا توجد أحاديث مطابقة</div>
          )}
        </div>
      </div>

      {/* Hadith Detail View */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                {selectedHadith.category}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white mt-1.5">{selectedHadith.title}</h2>
            </div>
          </div>

          {/* Hadith text display */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800/80 my-2 shadow-inner relative">
            <span className="absolute left-4 top-4 text-amber-500/10 text-6xl font-serif">”</span>
            <p className="text-base md:text-lg font-serif leading-loose text-neutral-200 text-center font-medium">
              عن {selectedHadith.narrator} قال: قال رسول الله صلى الله عليه وسلم:
              <br />
              <span className="text-teal-400 font-semibold block mt-4 px-4">
                « {selectedHadith.text} »
              </span>
            </p>
          </div>

          {/* Standard Tafseer */}
          <div className="text-sm bg-neutral-950/40 p-4 rounded-xl border border-neutral-900 leading-relaxed text-neutral-400">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2 border-b border-neutral-800 pb-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              الشرح الميسر المعتمد:
            </h4>
            <p className="text-xs md:text-sm">{selectedHadith.explanation}</p>
          </div>

          {/* AI Advanced explain button */}
          <div className="border-t border-neutral-800 pt-4 mt-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-neutral-500">يمكنك طلب شرح إضافي أوسع وتطبيق حياتي مع المفسر الذكي.</p>
              <button
                id="explain-hadith-ai-btn"
                onClick={() => explainHadithWithAi(selectedHadith)}
                disabled={explainLoading}
                className="px-4 py-2 bg-gradient-to-l from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 font-bold hover:shadow-amber-500/10 text-neutral-950 text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                تفسير أعمق وتطبيقات ذكية
              </button>
            </div>

            {/* Explanations Display */}
            <AnimatePresence mode="wait">
              {explainLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-neutral-900/60 p-5 rounded-xl border border-neutral-800 flex items-center justify-center gap-3 py-10 mt-4"
                >
                  <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                  <p className="text-xs text-neutral-300 font-medium">يقوم المفسّر الآلي للذكاء الاصطناعي بتحضير دروس الحديث الشريف...</p>
                </motion.div>
              )}

              {aiExplanation && !explainLoading && (
                <motion.div
                  key="explain-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-950/20 to-neutral-900 p-5 rounded-xl border border-amber-500/10 mt-4 leading-relaxed"
                >
                  <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-amber-400">تفسير ودراسة حياة الحديث وتطبيقاته بالذكاء الاصطناعي:</h4>
                  </div>
                  <div className="text-slate-300 text-xs md:text-sm whitespace-pre-line space-y-2 leading-relaxed">
                    {aiExplanation}
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-950/20 text-red-400 p-4 border border-red-900/30 rounded-xl text-xs flex items-center gap-2 mt-4"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
