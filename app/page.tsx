'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function QuizApp() {
  const [themes, setThemes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQs, setActiveQs] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [view, setView] = useState<'home' | 'quiz' | 'result'>('home');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: t } = await supabase.from('themes').select('*').order('sort_order');
      const { data: q } = await supabase.from('questions').select('*');
      setThemes(t || []);
      setQuestions(q || []);
    }
    fetchData();
  }, []);

  const startQuiz = (themeId: number) => {
    const themeQs = questions.filter(q => q.theme_id === themeId);
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

    if (ans === activeQs[currentIdx].correct_option) {
      setScore(s => s + 1);
    } else {
      setWrongCount(w => w + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < activeQs.length) {
        setCurrentIdx(i => i + 1);
        setSelectedOpt(null);
      } else {
        setView('result');
      }
    }, 700);
  };

  const restart = () => {
    setView('home');
    setSelectedOpt(null);
  };

  const progressPct = view === 'quiz' && activeQs.length
    ? Math.round((currentIdx / activeQs.length) * 100)
    : 0;

  const q = activeQs[currentIdx];

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
                <div className="flex flex-col gap-2">
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