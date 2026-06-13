import { useState, useEffect } from "react";
import { BookOpen, Play, HelpCircle, Search, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { quranData } from "../data/quran";
import { quranMetadataList } from "../data/quranMetadata";
import { Surah } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface QuranSectionProps {
  onPlayAudio: (url: string, title: string, subtitle: string) => void;
  onAddPoints: (points: number, reason: string) => void;
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
  initialSurahId?: number;
}

export default function QuranSection({
  onPlayAudio,
  onAddPoints,
  unlockedBadges,
  onUnlockBadge,
  initialSurahId
}: QuranSectionProps) {
  const [currentSurahId, setCurrentSurahId] = useState<number>(initialSurahId || 1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(1);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Verses state for the current active Surah
  const [verses, setVerses] = useState<any[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);
  const [errorLoadingVerses, setErrorLoadingVerses] = useState<string>("");

  // In-memory cache to store loaded verses and prevent redundant API lookups
  const [cache, setCache] = useState<Record<number, any[]>>(() => {
    const initialCache: Record<number, any[]> = {};
    // Load offline pre-loaded surahs into cache
    quranData.forEach(s => {
      initialCache[s.id] = s.verses;
    });
    return initialCache;
  });

  // Get active Surah metadata
  const activeMeta = quranMetadataList.find(s => s.id === currentSurahId) || quranMetadataList[0];

  useEffect(() => {
    if (initialSurahId) {
      setCurrentSurahId(initialSurahId);
      setHighlightedVerse(1);
      setAiExplanation("");
    }
  }, [initialSurahId]);

  // Load active Surah verses from cache or API
  useEffect(() => {
    const loadSurahVerses = async () => {
      if (cache[currentSurahId]) {
        setVerses(cache[currentSurahId]);
        return;
      }

      setLoadingVerses(true);
      setErrorLoadingVerses("");
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${currentSurahId}/editions/quran-simple,en.sahih`);
        if (!res.ok) throw new Error("تعذر الاتصال بالخادم الرقمي للمصحف الشريف");
        const json = await res.json();
        
        if (json.code === 200 && json.data && json.data.length >= 2) {
          const arabicAyahs = json.data[0].ayahs;
          const englishAyahs = json.data[1].ayahs;

          const mapped = arabicAyahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: englishAyahs[index]?.text || ""
          }));

          setCache(prev => ({ ...prev, [currentSurahId]: mapped }));
          setVerses(mapped);
        } else {
          throw new Error("تنسيق بيانات غير مدعوم من المصدر الرقمي");
        }
      } catch (err: any) {
        console.error("Failed to fetch surah data:", err);
        setErrorLoadingVerses("حدث خطأ أثناء الاتصال بمُستودع المصحف الشريف الرقمي. يرجى التحقق من اتصال الإنترنت.");
      } finally {
        setLoadingVerses(false);
      }
    };

    loadSurahVerses();
  }, [currentSurahId]);

  // Trigger Gemini AI Tafsir (Explanation) of selected verse
  const getAiTafsir = async (verseText: string, verseNum: number) => {
    setAiLoading(true);
    setAiExplanation("");
    setErrorMessage("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quran",
          text: verseText,
          title: `سورة ${activeMeta.name} - الآية ${verseNum}`
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "فشل جلب التفسير من خادم الذكاء الاصطناعي");
      }

      setAiExplanation(data.explanation);
      onAddPoints(20, `طلب تفسير بالذكاء الاصطناعي سورة ${activeMeta.name}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "حدث خطأ أثناء التواصل مع خبير التفسير الآلي.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter Quran based on query
  const filteredSurahs = quranMetadataList.filter(s => 
    s.name.includes(searchQuery) || 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right" dir="rtl">
      {/* Search & Index Sidebar */}
      <div className="lg:col-span-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-neutral-800 pb-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          فهرس السور الكريمة (114)
        </h3>

        {/* Search input field */}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-4 h-4 text-neutral-500" />
          <input
            id="quran-search-input"
            type="text"
            placeholder="ابحث باسم السورة، البقرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 pr-9 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Info card badge */}
        <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3 text-right">
          <p className="text-xs font-bold text-emerald-400">📖 تصفح وقراءة المصحف كاملاً</p>
          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
            انقر على أي سورة من الـ 114 سورة الكريمة لقراءتها فورياً، والاستماع لتلاوتها بصوت القارئ مشاري العفاسي، مع دمج الذكاء الاصطناعي لتفسير أي آية تحددها.
          </p>
        </div>

        {/* List of Surahs */}
        <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[580px] scrollbar-thin scrollbar-thumb-neutral-800 pr-1 gap-2 flex flex-col">
          {filteredSurahs.map((surah) => (
            <button
              id={`surah-select-${surah.id}`}
              key={surah.id}
              onClick={() => {
                setCurrentSurahId(surah.id);
                setHighlightedVerse(1);
                setAiExplanation("");
              }}
              className={`p-3 rounded-xl transition-all flex items-center justify-between text-right border ${
                currentSurahId === surah.id
                  ? "bg-gradient-to-l from-emerald-950 to-neutral-900 text-white border-emerald-500/30 font-bold"
                  : "bg-neutral-950/40 hover:bg-neutral-950 text-neutral-400 border-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center font-mono text-xs text-amber-500 border border-neutral-800">
                  {surah.id}
                </div>
                <div>
                  <p className="font-bold text-sm text-neutral-200">{surah.name}</p>
                  <p className="text-[10px] text-neutral-500">{surah.englishName}</p>
                </div>
              </div>
              <div className="text-left text-[10px] text-neutral-500">
                <p className="font-semibold text-emerald-500">{surah.type}</p>
                <p>{surah.versesCount} آية</p>
              </div>
            </button>
          ))}
          {filteredSurahs.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              <BookOpen className="w-8 h-8 mx-auto opacity-20 mb-2" />
              لا توجد سور مطابقة لبحثك
            </div>
          )}
        </div>
      </div>

      {/* Surah Content Reader & Tafsir */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Header toolbar */}
        <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-amber-400">سُورَةُ {activeMeta.name}</h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                {activeMeta.type}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">{activeMeta.englishName} ({activeMeta.versesCount} verses)</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              id="mishary-play-audio-btn"
              onClick={() => onPlayAudio(
                `https://download.quranicaudio.com/quran/mishari_bin_rashid_alafasy/${String(currentSurahId).padStart(3, '0')}.mp3`,
                `تلاوة سورة ${activeMeta.name}`,
                `بصوت القارئ الشيخ مشاري بن راشد العفاسي`
              )}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>استماع للعفاسي 🎧</span>
            </button>

            <div className="hidden md:flex bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] font-bold px-3 py-2 rounded-xl items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>مصحف التلاوة والتدبر 📖</span>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800 min-h-[350px] flex flex-col justify-between">
          <div>
            {/* Loading / Error states of Surah Verses */}
            {loadingVerses && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm text-neutral-300 font-bold">جاري تنزيل وتحميل آيات سورة {activeMeta.name} الكريمة والترجمة...</p>
                <p className="text-[10px] text-neutral-500 font-mono">Loading verses from secure cloud database...</p>
              </div>
            )}

            {errorLoadingVerses && !loadingVerses && (
              <div className="bg-red-950/20 text-red-400 p-6 border border-red-900/30 rounded-xl text-center flex flex-col items-center gap-3 py-16">
                <AlertCircle className="w-8 h-8 shrink-0 text-red-500" />
                <p className="text-sm font-bold">{errorLoadingVerses}</p>
                <button
                  onClick={() => {
                    // Force retry by triggering state change
                    setCurrentSurahId(currentSurahId);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 rounded-lg text-xs font-bold transition-all"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!loadingVerses && !errorLoadingVerses && (
              <>
                {/* Basmala */}
                {currentSurahId !== 1 && currentSurahId !== 9 && (
                  <p className="text-center font-serif text-lg md:text-xl text-amber-500/80 mb-6 font-semibold tracking-widest">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>
                )}

                {/* Verses Grid */}
                <div className="space-y-4">
                  {verses.map((verse) => (
                    <div
                      key={verse.number}
                      onClick={() => setHighlightedVerse(verse.number)}
                      className={`p-4 rounded-xl transition-all cursor-pointer border ${
                        highlightedVerse === verse.number
                          ? "bg-amber-500/5 border-amber-500/30 text-white"
                          : "border-transparent text-neutral-300 hover:bg-neutral-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-lg md:text-xl font-serif text-right leading-loose font-medium flex-1">
                          {verse.text}
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-amber-500/40 text-[10px] font-mono text-amber-400 mr-2 shrink-0 select-none">
                            {verse.number}
                          </span>
                        </p>
                      </div>
                      {/* Translation display */}
                      <p className="text-xs text-neutral-400 leading-relaxed text-left mt-2 pl-4 italic border-l border-neutral-800">
                        {verse.translation}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Interactive footer: explain highlighted verse */}
          {!loadingVerses && !errorLoadingVerses && (
            <div className="mt-8 pt-6 border-t border-neutral-900">
              {highlightedVerse && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-neutral-400 font-semibold">
                      الآية المحددة الحالية: <span className="text-amber-400">الآية رقم {highlightedVerse}</span>
                    </p>
                    <button
                      id="trigger-ai-tafsir-btn"
                      onClick={() => {
                        const verse = verses.find(v => v.number === highlightedVerse);
                        if (verse) getAiTafsir(verse.text, verse.number);
                      }}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-500/30 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      شرح وتفسير الآية ميسراً بالذكاء الاصطناعي
                    </button>
                  </div>

                  {/* AI Explanation Box */}
                  <AnimatePresence mode="wait">
                    {aiLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 flex items-center justify-center gap-3 py-10"
                      >
                        <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                        <p className="text-xs text-neutral-300 font-medium">يقوم المفسّر الآلي للذكاء الاصطناعي بدراسة دلالات الآية...</p>
                      </motion.div>
                    )}

                    {aiExplanation && !aiLoading && (
                      <motion.div
                        key="tafsir-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-gradient-to-br from-emerald-950/20 to-neutral-900 p-5 rounded-xl border border-emerald-500/10 text-right leading-relaxed"
                      >
                        <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-bold text-amber-400">تفسير وتطبيق الآية الكريم بالذكاء الاصطناعي:</h4>
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
                        className="bg-red-950/20 text-red-400 p-4 border border-red-900/30 rounded-xl text-xs flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

