import { useState } from "react";
import { Search, BookOpen, Volume2, Award, ChevronRight, Sparkles, SlidersHorizontal, Info } from "lucide-react";
import { quranData } from "../data/quran";
import { hadithData } from "../data/hadith";
import { seerahLessons } from "../data/seerah";
import { Surah, Hadith, SeerahLesson } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SearchSectionProps {
  onNavigateToQuran: (surahId: number) => void;
  onNavigateToHadith: (hadithId: number) => void;
  onNavigateToSeerah: (lessonId: string) => void;
  onAddPoints: (points: number, reason: string) => void;
}

interface SearchResult {
  type: "quran" | "hadith" | "seerah";
  title: string;
  subtitle: string;
  text: string;
  subtext?: string;
  linkId: string | number;
  badge: {
    label: string;
    style: string;
  };
}

export default function SearchSection({
  onNavigateToQuran,
  onNavigateToHadith,
  onNavigateToSeerah,
  onAddPoints
}: SearchSectionProps) {
  const [query, setQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"all" | "quran" | "hadith" | "seerah">("all");

  const handleSearch = (): SearchResult[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const results: SearchResult[] = [];

    // 1. Search in Quran
    if (activeFilter === "all" || activeFilter === "quran") {
      quranData.forEach((surah) => {
        // Search in Surah name
        const matchSurahName = surah.name.toLowerCase().includes(trimmed) || surah.englishName.toLowerCase().includes(trimmed);
        
        surah.verses.forEach((verse) => {
          const matchVerse = verse.text.toLowerCase().includes(trimmed) || verse.translation.toLowerCase().includes(trimmed);
          
          if (matchSurahName || matchVerse) {
            results.push({
              type: "quran",
              title: `سورة ${surah.name}`,
              subtitle: `الآية رقم ${verse.number} • ${surah.type}`,
              text: verse.text,
              subtext: verse.translation,
              linkId: surah.id,
              badge: {
                label: "القرآن الكريم",
                style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }
            });
          }
        });
      });
    }

    // 2. Search in Hadith
    if (activeFilter === "all" || activeFilter === "hadith") {
      hadithData.forEach((hadith) => {
        const matchCategory = hadith.category.toLowerCase().includes(trimmed);
        const matchTitle = hadith.title.toLowerCase().includes(trimmed);
        const matchText = hadith.text.toLowerCase().includes(trimmed);
        const matchNarrator = hadith.narrator.toLowerCase().includes(trimmed);
        const matchExplain = hadith.explanation.toLowerCase().includes(trimmed);

        if (matchCategory || matchTitle || matchText || matchNarrator || matchExplain) {
          results.push({
            type: "hadith",
            title: hadith.title,
            subtitle: `راوي الحديث: ${hadith.narrator} • قسم: ${hadith.category}`,
            text: hadith.text,
            subtext: `الشرح ميسر: ${hadith.explanation}`,
            linkId: hadith.id,
            badge: {
              label: "أحاديث نبوية",
              style: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }
          });
        }
      });
    }

    // 3. Search in Seerah Lessons
    if (activeFilter === "all" || activeFilter === "seerah") {
      seerahLessons.forEach((lesson) => {
        const matchTitle = lesson.title.toLowerCase().includes(trimmed);
        const matchPeriod = lesson.period.toLowerCase().includes(trimmed);
        const matchSummary = lesson.summary.toLowerCase().includes(trimmed);
        const matchDetails = lesson.details.toLowerCase().includes(trimmed);
        
        let matchQuiz = false;
        lesson.quiz.forEach(q => {
          if (q.question.toLowerCase().includes(trimmed) || q.options.some(o => o.toLowerCase().includes(trimmed))) {
            matchQuiz = true;
          }
        });

        if (matchTitle || matchPeriod || matchSummary || matchDetails || matchQuiz) {
          results.push({
            type: "seerah",
            title: lesson.title,
            subtitle: `أحداث الحقبة: ${lesson.period}`,
            text: lesson.summary,
            subtext: lesson.details.slice(0, 240) + "...",
            linkId: lesson.id,
            badge: {
              label: "السيرة العطرة",
              style: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }
          });
        }
      });
    }

    return results;
  };

  const results = handleSearch();

  // Highlight handle trigger
  const handleResultClick = (res: SearchResult) => {
    onAddPoints(5, `بحث موحد وقراءة: ${res.title}`);
    if (res.type === "quran") {
      onNavigateToQuran(res.linkId as number);
    } else if (res.type === "hadith") {
      onNavigateToHadith(res.linkId as number);
    } else if (res.type === "seerah") {
      onNavigateToSeerah(res.linkId as string);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right animate-fade-in" dir="rtl">
      
      {/* Search Header Banner */}
      <div className="bg-neutral-900/60 p-5 md:p-6 rounded-2xl border border-neutral-800 flex flex-col gap-5">
        
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-500 animate-pulse" />
            البحث والتقصي الموحد 
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            ابحث في نصوص القرآن الشريف، الأحاديث المطهرة، ومواقف السيرة النبوية التفاعلية في مكان واحد بسرعة البرق ودون الحاجة لاتصال إنترنت.
          </p>
        </div>

        {/* Input area */}
        <div className="relative">
          <Search className="absolute right-4 top-3.5 w-5 h-5 text-neutral-500" />
          <input
            id="unified-search-input"
            type="text"
            placeholder="اكتب كلمة أو جملة للبحث الفوري (مثال: نية، هجرة، الصلاة، الفاتحة، الجنة)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 pr-12 py-3.5 rounded-xl outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filters and speed-stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Filter badges buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              id="search-filter-all"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === "all"
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-black"
                  : "bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-800"
              }`}
            >
              الكل الكلّي
            </button>
            <button
              id="search-filter-quran"
              onClick={() => setActiveFilter("quran")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === "quran"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-800"
              }`}
            >
              القرآن الكريم
            </button>
            <button
              id="search-filter-hadith"
              onClick={() => setActiveFilter("hadith")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === "hadith"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-800"
              }`}
            >
              الأحاديث الشريفة
            </button>
            <button
              id="search-filter-seerah"
              onClick={() => setActiveFilter("seerah")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === "seerah"
                  ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                  : "bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-800"
              }`}
            >
              السيرة النبوية
            </button>
          </div>

          {/* Stats counts */}
          <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 shrink-0">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            البحث يجري محلياً ويدعم المطابقة الجزئية للنصوص
          </span>
        </div>

      </div>

      {/* Results logs rendering */}
      <div className="space-y-4">
        {query.trim() === "" ? (
          <div className="bg-neutral-900/30 rounded-2xl border border-neutral-900/80 p-12 text-center text-neutral-500">
            <Search className="w-12 h-12 mx-auto stroke-1 opacity-20 mb-3" />
            <p className="text-sm font-semibold text-neutral-400">مجلس البحث المترابط الآن في انتظار مدخلاتك</p>
            <p className="text-xs text-neutral-500 mt-1">اكتب أي كلمة، وسيتم مطابقة نصوص الأركان فورياً لعرض النتائج.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-neutral-900/30 rounded-2xl border border-neutral-900/80 p-12 text-center text-neutral-400">
            <BookOpen className="w-12 h-12 mx-auto stroke-1 opacity-10 mb-3" />
            <p className="text-sm font-bold">لا يوجد نتائج تطابق كلمة "{query}" حالياً</p>
            <p className="text-xs text-neutral-500 mt-1">جرب كلمات أخرى أبسط مثل (نية، تيسير، الفاتحة، الكهف، مكة) أو تأكد من الفلاتر النشطة.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Quick header count */}
            <p className="text-xs text-neutral-400 font-bold px-1 flex justify-between">
              <span>نتائج البحث المطابقة للكلمة:</span>
              <span className="text-amber-400 font-mono">تم العثور على {results.length} نتيجة</span>
            </p>

            <AnimatePresence>
              {results.slice(0, 30).map((res, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-3 group text-right"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      {/* Origin Badge */}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${res.badge.style}`}>
                        {res.badge.label}
                      </span>
                      <h4 className="font-bold text-sm md:text-base text-white mt-2 group-hover:text-amber-400 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">{res.subtitle}</p>
                    </div>
                  </div>

                  {/* Highlight text body */}
                  <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-850">
                    <p className="text-xs md:text-sm text-neutral-200 leading-relaxed font-serif">
                      {res.text}
                    </p>
                    {res.subtext && (
                      <p className="text-[11px] text-neutral-400 border-t border-neutral-900 pt-2 mt-2 leading-relaxed italic">
                        {res.subtext}
                      </p>
                    )}
                  </div>

                  {/* Teleport trigger footer */}
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-900 flex-wrap gap-2">
                    <span className="text-[9px] text-neutral-600 font-mono">الاجتياز يمنحك رتب تصنيفية إضافية</span>
                    
                    <button
                      id={`search-result-teleport-${i}`}
                      onClick={() => handleResultClick(res)}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 hover:border-amber-500/30 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>انتقل للقراءة والتعمق</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
