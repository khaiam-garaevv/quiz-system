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
  const [view, setView] = useState('home');
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
    }, 1000);
  };

  if (view === 'home') {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Testlər</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map(t => (
            <button key={t.id} onClick={() => startQuiz(t.id)} className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md text-left transition-all">
              {t.name}
            </button>
          ))}
        </div>
      </main>
    );
  }

  const q = activeQs[currentIdx];
  return (
    <main className="max-w-2xl mx-auto p-8">
      {view === 'quiz' ? (
        <div>
          <div className="flex gap-4 mb-6 text-sm font-bold">
            <span className="text-emerald-600">Düzgün: {score}</span>
            <span className="text-red-600">Səhv: {wrongCount}</span>
          </div>
          <h2 className="text-xl mb-8 font-medium">{q.question}</h2>
          <div className="space-y-3">
            {['a', 'b', 'c'].map(opt => {
              let bgClass = "bg-white border-slate-200 hover:bg-slate-50";
              if (selectedOpt) {
                if (opt === q.correct_option) bgClass = "!bg-emerald-600 !border-emerald-600 !text-white";
                else if (opt === selectedOpt && opt !== q.correct_option) bgClass = "!bg-red-600 !border-red-600 !text-white";
              }
              return (
                <button key={opt} onClick={() => checkAnswer(opt)} className={`w-full p-4 border rounded-xl text-left transition-all ${bgClass}`}>
                  {q[`option_${opt}`]}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">{score} / {activeQs.length}</h2>
          <button onClick={() => setView('home')} className="px-6 py-2 bg-slate-900 text-white rounded-lg">Ana Səhifə</button>
        </div>
      )}
    </main>
  );
}