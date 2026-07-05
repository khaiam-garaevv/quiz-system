'use client';
import { supabase } from '@/lib/supabase';
import { getAnonId } from '@/lib/anonId';
import { useState, useEffect } from 'react';

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 bg-zinc-100 rounded-2xl"></div>
    <div className="h-16 bg-zinc-100 rounded-2xl"></div>
    <div className="h-32 bg-zinc-100 rounded-2xl"></div>
  </div>
);

export default function QuizApp() {
  const [anonId, setAnonId] = useState<string>('');
  const [themes, setThemes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz State-ləri
  const [view, setView] = useState<'home' | 'quiz' | 'result'>('home');
  const [activeQs, setActiveQs] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  useEffect(() => {
    const id = getAnonId();
    setAnonId(id);
    fetchData(id);
  }, []);

  async function fetchData(id: string) {
    setLoading(true);
    const [t, q, a] = await Promise.all([
      supabase.from('themes').select('*').order('sort_order'),
      supabase.from('questions').select('*'),
      supabase.from('quiz_attempts').select('*').eq('anon_id', id).order('created_at', { ascending: false })
    ]);

    setThemes(t.data || []);
    setQuestions(q.data || []);
    setAttempts(a.data || []);
    setLoading(false);
  }

  const startQuiz = (themeId: number) => {
    const themeQs = questions.filter(q => q.theme_id === themeId);
    setActiveQs([...themeQs].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setView('quiz');
  };

  const checkAnswer = (ans: string) => {
    if (selectedOpt) return;
    setSelectedOpt(ans);
    if (ans === activeQs[currentIdx].correct_option) setScore(s => s + 1);

    setTimeout(() => {
      if (currentIdx + 1 < activeQs.length) {
        setCurrentIdx(i => i + 1);
        setSelectedOpt(null);
      } else {
        setView('result');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        {view === 'quiz' && (
          <div className="h-1.5 w-full bg-zinc-100">
            <div className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / activeQs.length) * 100}%` }} />
          </div>
        )}

        <div className="p-6">
          {loading ? <Skeleton /> : (
            <>
              {view === 'home' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-zinc-900">თემები</h1>
                    <p className="text-zinc-500 text-sm">აირჩიეთ თემა ტესტის დასაწყებად.</p>
                  </div>
                  <div className="grid gap-3">
                    {themes.map(t => (
                      <button key={t.id} onClick={() => startQuiz(t.id)}
                        className="w-full p-4 border border-zinc-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left font-medium">
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {view === 'quiz' && activeQs[currentIdx] && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold">{activeQs[currentIdx].question}</h2>
                  <div className="grid gap-3">
                    {(['a', 'b', 'c'] as const).map(opt => (
                      <button key={opt} onClick={() => checkAnswer(opt)}
                        className={`p-4 border rounded-2xl text-left transition-all ${selectedOpt === opt ? (opt === activeQs[currentIdx].correct_option ? 'bg-emerald-100 border-emerald-400' : 'bg-red-100 border-red-400') : 'hover:border-zinc-400'
                          }`}>
                        {activeQs[currentIdx][`option_${opt}`]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {view === 'result' && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">დასრულდა!</h2>
                  <p>თქვენი ქულა: {score} / {activeQs.length}</p>
                  <button onClick={() => setView('home')} className="w-full p-4 bg-zinc-900 text-white rounded-2xl">
                    მთავარზე დაბრუნება
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}