import { useEffect, useState } from "react";
import { Award, BookOpen, ChevronRight, HelpCircle, Sparkles, Volume2, Play, CheckCircle2, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { seerahLessons } from "../data/seerah";
import { SeerahLesson, QuizQuestion } from "../types";
import { b64toBlob } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface SeerahSectionProps {
  onPlayAudio: (url: string, title: string, subtitle: string) => void;
  onAddPoints: (points: number, reason: string) => void;
  onCompleteQuiz: (lessonId: string) => void;
  completedQuizzes: string[];
  unlockedBadges: string[];
  onUnlockBadge: (badgeId: string) => void;
  initialLessonId?: string;
}

export default function SeerahSection({
  onPlayAudio,
  onAddPoints,
  onCompleteQuiz,
  completedQuizzes,
  unlockedBadges,
  onUnlockBadge,
  initialLessonId
}: SeerahSectionProps) {
  const [activeLesson, setActiveLesson] = useState<SeerahLesson>(() => {
    if (initialLessonId) {
      const match = seerahLessons.find(l => l.id === initialLessonId);
      if (match) return match;
    }
    return seerahLessons[0];
  });
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(false || "");

  useEffect(() => {
    if (initialLessonId) {
      const match = seerahLessons.find(l => l.id === initialLessonId);
      if (match) {
        setActiveLesson(match);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        setErrorMessage("");
      }
    }
  }, [initialLessonId]);

  // Change lesson
  const handleLessonChange = (lesson: SeerahLesson) => {
    setActiveLesson(lesson);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setErrorMessage("");
  };

  // Sound generator for Seerah
  const listenToSeerahWithAi = async () => {
    setAudioLoading(true);
    setErrorMessage("");
    try {
      const textToSpeak = `الدرس من السيرة النبوية الشريفة: ${activeLesson.title}. الفترة: ${activeLesson.period}. الخلاصة: ${activeLesson.summary}`;
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, type: "seerah" })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "فشل توليد الشرح الصوتي لدرس السيرة");
      }

      const audioBlob = b64toBlob(data.audio, "audio/mp3");
      const audioUrl = URL.createObjectURL(audioBlob);

      onPlayAudio(audioUrl, activeLesson.title, "رواية السيرة النبوية بصوت الذكاء الاصطناعي");
      onAddPoints(40, `الاستماع إلى قراءة السيرة النبوية العطرة بالذكاء الاصطناعي`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشل تحميل التسجيل الصوتي للسيرة.");
    } finally {
      setAudioLoading(false);
    }
  };

  // Handle option click
  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    activeLesson.quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    const maxScore = activeLesson.quiz.length;
    if (score === maxScore) {
      // Award points on perfect score
      const bonusPoints = 200;
      onCompleteQuiz(activeLesson.id);
      onAddPoints(bonusPoints, `أتممت اختبار السيرة: ${activeLesson.title}`);

      // Check if all quizzes are complete for Seerah badge
      const totalLessons = seerahLessons.length;
      const newlyCompleted = [...completedQuizzes];
      if (!newlyCompleted.includes(activeLesson.id)) {
        newlyCompleted.push(activeLesson.id);
      }
      
      const allDone = seerahLessons.every(l => newlyCompleted.includes(l.id));
      if (allDone && !unlockedBadges.includes("badge-seerah-master")) {
        onUnlockBadge("badge-seerah-master");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right animate-fade-in" dir="rtl">
      {/* Interactive Timeline map sidebar */}
      <div className="lg:col-span-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-neutral-800 pb-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          معالم السيرة النبوية
        </h3>
        <p className="text-[10px] text-neutral-400 -mt-1 leading-relaxed">
          تعلم أحداث السيرة النبوية العطرة بالترتيب الزمني وأجب عن الاختبارات لكسب رتب جديدة ومكافآت.
        </p>

        {/* Vertical Timeline Stepper */}
        <div className="flex flex-col gap-5 relative pl-2 pr-1 my-3">
          {/* Vertical line connector */}
          <div className="absolute right-5 top-4 bottom-4 w-0.5 bg-neutral-800"></div>

          {seerahLessons.map((lesson, idx) => {
            const isCompleted = completedQuizzes.includes(lesson.id);
            const isActive = activeLesson.id === lesson.id;
            
            return (
              <button
                id={`seerah-lesson-${lesson.id}`}
                key={lesson.id}
                onClick={() => handleLessonChange(lesson)}
                className="text-right focus:outline-none flex gap-4 items-start relative z-10 w-full"
              >
                {/* Node counter */}
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 transition-all ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-400 text-neutral-900 shadow-lg shadow-emerald-500/20"
                      : isActive
                        ? "bg-amber-400 border-amber-300 text-neutral-900 shadow-lg shadow-amber-500/20"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>

                <div className="flex-1">
                  <p className={`text-xs font-bold leading-none ${isActive ? "text-amber-400" : "text-neutral-300"}`}>
                    {lesson.title}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{lesson.period}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress summary card */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
          <p className="text-xs text-neutral-400 font-bold">التقدم الإجمالي المحرز:</p>
          <div className="w-full bg-neutral-900 h-2 rounded-full mt-2 overflow-hidden border border-neutral-800 flex">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedQuizzes.length / seerahLessons.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-neutral-500 text-left mt-1 font-mono">
            تم اجتياز {completedQuizzes.length} من أصل {seerahLessons.length} دروس
          </p>
        </div>
      </div>

      {/* Lesson Reader Board with details and audio voice trigger */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
            <div>
              <p className="text-xs text-amber-500 font-mono tracking-wide">{activeLesson.period}</p>
              <h2 className="text-lg md:text-xl font-bold text-white mt-1">{activeLesson.title}</h2>
            </div>
          </div>

          {/* Lesson detailed description text */}
          <div className="text-sm md:text-base leading-relaxed text-slate-300 font-serif space-y-4 whitespace-pre-line pl-2">
            {activeLesson.details}
          </div>

          {/* Sincere reminder info block */}
          <div className="bg-emerald-950/20 p-4 border border-emerald-500/10 rounded-xl flex items-start gap-3 mt-2">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-emerald-400 leading-none">عبرة نبوية مأثورة:</p>
              <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                إن السيرة النبوية ليست مجرد سرد تاريخي، بل هي دستور أخلاقي وتربوي وقواعد لبناء النفس والمجتمعات الطاهرة. تأمل الدروس ومارس خصال الرسول في حياتك!
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-950/10 text-red-400 p-3 border border-red-900/20 rounded-xl text-xs flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
        </div>

        {/* Interactive Lesson Quiz panel */}
        <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              اختبار الفهم السريع والتحصيل العلمي
            </h3>
            {completedQuizzes.includes(activeLesson.id) && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                ✓ تم الاجتياز بنجاح (+200 نقطة)
              </span>
            )}
          </div>

          {/* Loop over quiz questions */}
          <div className="space-y-6 my-2">
            {activeLesson.quiz.map((q, qIdx) => (
              <div key={q.id} className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-800">
                <p className="text-xs md:text-sm font-bold text-white mb-3">
                  س{qIdx + 1}: {q.question}
                </p>

                {/* Question choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[q.id] === oIdx;
                    const isCorrect = q.correctAnswer === oIdx;
                    const isWrongSelection = isSelected && !isCorrect;
                    
                    let btnStyle = "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold";
                      } else if (isWrongSelection) {
                        btnStyle = "bg-red-500/10 text-red-500 border-red-500/40";
                      } else {
                        btnStyle = "bg-neutral-950 text-neutral-600 border-neutral-900 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-amber-500/10 text-amber-400 border-amber-500/50 font-semibold";
                    }

                    return (
                      <button
                        id={`quiz-option-${q.id}-${oIdx}`}
                        key={oIdx}
                        onClick={() => handleSelectAnswer(q.id, oIdx)}
                        disabled={quizSubmitted}
                        className={`p-3 rounded-xl text-right transition-all border text-xs flex justify-between items-center cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {quizSubmitted && isWrongSelection && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit/Reset Button footer */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-neutral-500">مطلوب إجابة صحيحة على جميع الأسئلة لكسب 200 نقطة و ترقية XP.</p>
            {!quizSubmitted ? (
              <button
                id="submit-seerah-quiz-btn"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < activeLesson.quiz.length}
                className="px-5 py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 font-bold hover:shadow-emerald-500/10 text-white rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              >
                تأكيد الإجابات واحتساب النتائج
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold">
                  درجتك: <span className={`${quizScore === activeLesson.quiz.length ? "text-emerald-400" : "text-amber-500"}`}>{quizScore}</span> من {activeLesson.quiz.length}
                </p>
                <button
                  id="reset-seerah-quiz-btn"
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(null);
                  }}
                  className="px-3 py-1.5 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-400 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  أعِد المحاولة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
