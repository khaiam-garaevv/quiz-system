'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    `}</style>
  );

  return (
    <main className="min-h-screen" style={{ background: '#EDEFF4' }}>
      <Fonts />
      <div className="max-w-2xl mx-auto px-6 py-14">
        
        {view === 'home' ? (
          <div>
            <div className="mb-14">
              <p className="font-mono-ui text-xs uppercase mb-4 text-[#5B6178]">
                {String(themes.length).padStart(2, '0')} bölmə &middot; test toplusu
              </p>
              <h1 className="font-display text-4xl text-[#21263B]">Testlər</h1>
              <div className="mt-5 h-[3px] w-16 bg-[#B3261E]" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {themes.map((t, i) => (
                <Button
                  key={t.id}
                  variant="outline"
                  onClick={() => startQuiz(t.id)}
                  className="h-auto p-0 border-[#D7DBE4] hover:border-[#21263B] transition-all justify-start"
                >
                  <div className="flex w-full items-center">
                    <div className="w-14 py-5 font-mono-ui text-sm bg-[#21263B] text-[#EDEFF4]">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="flex-1 px-5 font-display text-lg text-[#21263B] text-left">
                      {t.name}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : view === 'quiz' ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono-ui text-xs uppercase text-[#5B6178]">
                Sual {currentIdx + 1} / {activeQs.length}
              </span>
              <div className="flex gap-2">
                <span className="text-[#276749] text-xs font-bold">✓ {score}</span>
                <span className="text-[#B3261E] text-xs font-bold">✗ {wrongCount}</span>
              </div>
            </div>

            <Card className="mb-8 border-[#D7DBE4] shadow-none">
              <CardContent className="p-8">
                <h2 className="font-display text-2xl text-[#21263B]">
                  {activeQs[currentIdx].question}
                </h2>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {['a', 'b', 'c'].map(opt => (
                <Button
                  key={opt}
                  variant="outline"
                  disabled={!!selectedOpt}
                  onClick={() => checkAnswer(opt)}
                  className={`w-full h-auto p-4 justify-start gap-4 border-[#D7DBE4] ${
                    selectedOpt === opt ? (opt === activeQs[currentIdx].correct_option ? 'border-[#276749]' : 'border-[#B3261E]') : ''
                  }`}
                >
                  <span className={`w-9 h-9 flex items-center justify-center rounded-full border-2 ${
                    selectedOpt === opt ? 'bg-[#21263B] text-white' : 'border-[#D7DBE4]'
                  }`}>
                    {opt.toUpperCase()}
                  </span>
                  <span className="text-[#21263B]">{activeQs[currentIdx][`option_${opt}`]}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="stamp inline-flex flex-col items-center justify-center w-52 h-52 rounded-full border-4 mb-10" style={{ borderColor: score / (activeQs.length || 1) >= 0.6 ? '#276749' : '#B3261E' }}>
              <span className="font-mono-ui text-xs uppercase text-[#5B6178]">Nəticə</span>
              <span className="font-display text-5xl text-[#21263B]">{score}/{activeQs.length}</span>
            </div>
            <Button onClick={() => setView('home')} className="bg-[#21263B] text-white px-8">
              ANA SƏHİFƏ
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}