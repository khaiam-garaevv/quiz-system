'use client';
import { supabase } from '@/lib/supabase';
import { getAnonId } from '@/lib/anonId';
import { useState, useEffect } from 'react';

export default function QuizApp() {
  const [anonId, setAnonId] = useState<string>('');

  const [themes, setThemes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);
  const [activeQs, setActiveQs] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [view, setView] = useState<'home' | 'quiz' | 'result'>('home');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  useEffect(() => {
    const id = getAnonId();
    setAnonId(id);
    fetchData(id);
  }, []);

  async function fetchData(id: string) {
    setLoadingStats(true);
    const { data: t } = await supabase.from('themes').select('*').order('sort_order');
    const { data: q } = await supabase.from('questions').select('*');
    const { data: a } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('anon_id', id)
      .order('created_at', { ascending: false });

    setThemes(t || []);
    setQuestions(q || []);
    setAttempts(a || []);
    setLoadingStats(false);
  }

  const startQuiz = (themeId: number) => {
    const themeQs = questions.filter(q => q.theme_id === themeId);
    setActiveThemeId(themeId);
    setActiveQs([...themeQs].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScore(0);
    setWrongCount(0);
    setSelectedOpt(null);
    setView('quiz');
  };

  const checkAnswer = (ans: string) => {
    if (selectedOpt) return;
    setSelectedOpt(ans);

    const isCorrect = ans === activeQs[currentIdx].correct_option;
    const nextScore = isCorrect ? score + 1 : score;
    const nextWrong = isCorrect ? wrongCount : wrongCount + 1;

    if (isCorrect) setScore(nextScore);
    else setWrongCount(nextWrong);

    setTimeout(async () => {
      if (currentIdx + 1 < activeQs.length) {
        setCurrentIdx(i => i + 1);
        setSelectedOpt(null);
      } else {
        await saveAttempt(nextScore, nextWrong);
        setView('result');
      }
    }, 700);
  };

  async function saveAttempt(finalScore: number, finalWrong: number) {
    const { data } = await supabase
      .from('quiz_attempts')
      .insert({
        anon_id: anonId,
        theme_id: activeThemeId,
        score: finalScore,
        wrong_count: finalWrong,
        total: activeQs.length,
      })
      .select()
      .single();

    if (data) setAttempts(prev => [data, ...prev]);
  }

  const restart = () => {
    setView('home');
    setSelectedOpt(null);
  };

  const progressPct = view === 'quiz' && activeQs.length
    ? Math.round((currentIdx / activeQs.length) * 100)
    : 0;

  const q = activeQs[currentIdx];

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalAnswered = attempts.reduce((sum, a) => sum + a.total, 0);
  const overallAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const themeName = (themeId: number) => themes.find(t => t.id === themeId)?.name ?? '—';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ka-GE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-lg">
          <div className="h-[3px] w-full bg-zinc-100">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="p-7">
            {view === 'home' && (
              <div>
                <h1 className="text-xl font-bold mb-4">აირჩიეთ თემა</h1>
                <div className="flex flex-col gap-2 mb-6">
                  {themes.length === 0 ? (
                    <p className="text-zinc-500 text-sm">იტვირთება...</p>
                  ) : (
                    themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => startQuiz(t.id)}
                        className="p-4 border rounded-lg text-left hover:bg-zinc-50"
                      >
                        {t.name}
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-100 pt-5">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase mb-3">სტატისტიკა</h2>

                  {loadingStats ? (
                    <p className="text-zinc-500 text-sm">იტვირთება...</p>
                  ) : totalAttempts === 0 ? (
                    <p className="text-zinc-500 text-sm">ჯერ არცერთი ტესტი არ დაგირთავს.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-zinc-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold">{totalAttempts}</div>
                          <div className="text-xs text-zinc-500">გავლილი ტესტი</div>
                        </div>
                        <div className="bg-zinc-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-indigo-600">{overallAccuracy}%</div>
                          <div className="text-xs text-zinc-500">საერთო სიზუსტე</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {attempts.slice(0, 8).map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg text-sm"
                          >
                            <div>
                              <div className="font-medium">{themeName(a.theme_id)}</div>
                              <div className="text-xs text-zinc-400">{formatDate(a.created_at)}</div>
                            </div>
                            <div className="font-bold text-indigo-600">{a.score}/{a.total}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {view === 'quiz' && q && (
              <div>
                <div className="flex justify-between mb-4 text-xs font-bold text-zinc-500">
                  <span>კითხვა: {currentIdx + 1}/{activeQs.length}</span>
                  <span className="text-indigo-600">სწორი: {score}</span>
                </div>

                <div className="bg-zinc-50 p-6 rounded-xl text-center mb-4">
                  <span className="text-lg font-bold">{q.question}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {(['a', 'b', 'c'] as const).map(opt => {
                    const isSelected = selectedOpt === opt;
                    const isCorrectOpt = opt === q.correct_option;
                    let extraClass = '';
                    if (selectedOpt) {
                      if (isCorrectOpt) extraClass = 'border-emerald-600 bg-emerald-50';
                      else if (isSelected) extraClass = 'border-red-600 bg-red-50';
                    }
                    return (
                      <button
                        key={opt}
                        disabled={!!selectedOpt}
                        onClick={() => checkAnswer(opt)}
                        className={`p-3 border rounded-lg text-left hover:bg-zinc-100 ${extraClass}`}
                      >
                        {q[`option_${opt}`]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === 'result' && (
              <div className="text-center">
                <h1 className="text-xl font-bold mb-2">შედეგი</h1>
                <p className="mb-4">
                  თქვენ {activeQs.length}-დან <b>{score}</b> სწორად უპასუხეთ.
                </p>
                <div className="text-left mb-4 text-sm text-zinc-500">
                  <p>სწორი პასუხები: {score}</p>
                  <p>არასწორი პასუხები: {wrongCount}</p>
                </div>
                <button
                  onClick={restart}
                  className="w-full py-3 bg-zinc-900 text-white rounded-lg"
                >
                  თავიდან დაწყება
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}