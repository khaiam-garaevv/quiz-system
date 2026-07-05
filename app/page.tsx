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

  const Fonts = () => (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .font-display { font-family: 'Fraunces', serif; }
      .font-mono-ui { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.03em; }
      @keyframes stampIn {
        0% { transform: scale(1.7) rotate(-10deg); opacity: 0; }
        55% { transform: scale(0.92) rotate(3deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      .stamp { animation: stampIn 0.4s cubic-bezier(.2,.9,.3,1); }
      @media (prefers-reduced-motion: reduce) {
        .stamp { animation: none !important; }
      }
    `}</style>
  );

  if (view === 'home') {
    return (
      <main className="min-h-screen" style={{ background: '#EDEFF4' }}>
        <Fonts />
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="mb-14">
            <p className="font-mono-ui text-xs uppercase mb-4" style={{ color: '#5B6178' }}>
              {String(themes.length).padStart(2, '0')} bölmə &middot; test toplusu
            </p>
            <h1 className="font-display text-4xl md:text-5xl" style={{ color: '#21263B' }}>
              Testlər
            </h1>
            <div className="mt-5 h-[3px] w-16" style={{ background: '#B3261E' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((t, i) => (
              <button
                key={t.id}
                onClick={() => startQuiz(t.id)}
                className="group flex items-stretch bg-white border overflow-hidden text-left transition-all duration-300 hover:shadow-[0_8px_24px_-12px_rgba(33,38,59,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ borderColor: '#D7DBE4' }}
              >
                <div
                  className="flex items-center justify-center w-14 shrink-0 font-mono-ui text-sm transition-colors duration-300"
                  style={{ background: '#21263B', color: '#EDEFF4' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 px-5 py-5 flex items-center justify-between gap-4">
                  <span className="font-display text-base md:text-lg leading-snug" style={{ color: '#21263B' }}>
                    {t.name}
                  </span>
                  <span
                    className="font-mono-ui text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0"
                    style={{ color: '#B3261E' }}
                  >
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const q = activeQs[currentIdx];
  if (view !== 'home' && !q) return null;

  return (
    <main className="min-h-screen" style={{ background: '#EDEFF4' }}>
      <Fonts />
      <div className="max-w-2xl mx-auto px-6 py-14 md:py-20">
        {view === 'quiz' ? (
          <div>
            <div className="flex items-center justify-between mb-3 font-mono-ui text-xs" style={{ color: '#5B6178' }}>
              <span>
                SUAL {String(currentIdx + 1).padStart(2, '0')} / {String(activeQs.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-5">
                <span style={{ color: '#276749' }}>✓ Düzgün {score}</span>
                <span style={{ color: '#B3261E' }}>✗ Səhv {wrongCount}</span>
              </div>
            </div>

            <div className="h-[3px] w-full mb-10 overflow-hidden" style={{ background: '#D7DBE4' }}>
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{ width: `${(currentIdx / (activeQs.length || 1)) * 100}%`, background: '#21263B' }}
              />
            </div>

            <div className="relative bg-white border p-8 md:p-10 mb-8" style={{ borderColor: '#D7DBE4' }}>
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, #21263B 0, #21263B 1px, transparent 1px, transparent 28px)',
                }}
              />
              <h2
                className="font-display text-xl md:text-2xl leading-relaxed relative"
                style={{ color: '#21263B' }}
              >
                {q.question}
              </h2>
            </div>

            <div className="space-y-3">
              {['a', 'b', 'c'].map(opt => {
                let optState = 'default';
                if (selectedOpt) {
                  if (opt === q.correct_option) optState = 'correct';
                  else if (opt === selectedOpt) optState = 'wrong';
                  else optState = 'muted';
                }

                const ringColor =
                  optState === 'correct' ? '#276749' : optState === 'wrong' ? '#B3261E' : '#D7DBE4';

                return (
                  <button
                    key={opt}
                    onClick={() => checkAnswer(opt)}
                    disabled={!!selectedOpt}
                    className={`w-full flex items-center gap-4 p-4 bg-white border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      optState === 'default' ? 'hover:border-[#21263B]' : ''
                    } ${optState === 'muted' ? 'opacity-40' : ''}`}
                    style={{ borderColor: ringColor }}
                  >
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 font-mono-ui text-sm shrink-0 transition-all duration-300 ${
                        optState === 'correct' || optState === 'wrong' ? 'stamp' : ''
                      }`}
                      style={{
                        borderColor: ringColor,
                        background: optState === 'correct' ? '#276749' : optState === 'wrong' ? '#B3261E' : 'transparent',
                        color: optState === 'correct' || optState === 'wrong' ? '#fff' : '#5B6178',
                      }}
                    >
                      {optState === 'correct' ? '✓' : optState === 'wrong' ? '✗' : opt.toUpperCase()}
                    </span>
                    <span style={{ color: '#21263B' }}>{q[`option_${opt}`]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div
              className="stamp inline-flex flex-col items-center justify-center w-44 h-44 md:w-52 md:h-52 rounded-full border-4 mb-10"
              style={{
                borderColor: score / (activeQs.length || 1) >= 0.6 ? '#276749' : '#B3261E',
                transform: 'rotate(-4deg)',
              }}
            >
              <span className="font-mono-ui text-xs uppercase mb-2" style={{ color: '#5B6178' }}>
                Nəticə
              </span>
              <span className="font-display text-4xl md:text-5xl" style={{ color: '#21263B' }}>
                {score}/{activeQs.length}
              </span>
            </div>
            <div>
              <button
                onClick={() => setView('home')}
                className="font-mono-ui text-sm px-8 py-3 transition-all duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: '#21263B', color: '#EDEFF4' }}
              >
                ANA SƏHİFƏ
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}