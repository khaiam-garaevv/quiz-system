'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-12 bg-zinc-100 rounded-lg"></div>
    <div className="h-12 bg-zinc-100 rounded-lg"></div>
    <div className="h-32 bg-zinc-100 rounded-lg"></div>
  </div>
);

export default function QuizApp() {
  const [anonId, setAnonId] = useState<string>('');
  const [themes, setThemes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (digər state-lər əvvəlki kimi)
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);
  const [activeQs, setActiveQs] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [view, setView] = useState<'home' | 'quiz' | 'result'>('home');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

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


  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Progress Bar */}
        {view === 'quiz' && (
          <div className="h-1.5 w-full bg-zinc-100">
            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentIdx) / activeQs.length) * 100}%` }} />
          </div>
        )}

        <div className="p-6">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {view === 'home' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-zinc-900">თემები</h1>
                    <p className="text-zinc-500 text-sm">შეამოწმეთ თქვენი ცოდნა.</p>

                  </div>

                  <div className="grid gap-3">
                    {themes.map(t => (
                      <button
                        key={t.id}
                        className="w-full p-4 bg-white border border-zinc-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all text-left font-medium"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>

                  {attempts.length > 0 && (
                    <div className="p-4 bg-zinc-900 rounded-2xl text-white">
                      <h2 className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Statistika</h2>
                      <div className="text-3xl font-bold">{Math.round((attempts.reduce((s, a) => s + a.score, 0) / attempts.reduce((s, a) => s + a.total, 0)) * 100)}%</div>
                      <p className="text-zinc-400 text-sm">Ümumi uğur göstəricisi</p>
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}