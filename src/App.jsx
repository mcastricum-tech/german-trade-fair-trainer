import React, { useState } from 'react';
import VocabularyList from './components/VocabularyList';
import ScenarioPractice from './components/ScenarioPractice';
import VoiceSelector from './components/VoiceSelector';
import Onboarding from './components/Onboarding';
import { useSpeech } from './hooks/useSpeech';
import { useProgress } from './hooks/useProgress';

function App() {
  const [view, setView] = useState('scenarios'); // 'vocabulary' | 'scenarios'

  const {
    user,
    setUserName,
    addScore,
    completeScenario
  } = useProgress();

  const {
    speak,
    startListening,
    stopListening,
    transcript,
    isListening,
    speaking,
    voices,
    selectedVoice,
    setSelectedVoice
  } = useSpeech();

  const commonProps = {
    speak,
    startListening,
    stopListening,
    transcript,
    isListening,
    speaking,
    user,
    addScore,
    completeScenario
  };

  if (!user) {
    return <Onboarding onComplete={setUserName} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-orange selection:text-white pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-28 flex items-center justify-between">

          {/* Logo Area */}
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="YarnZoo Logo" className="w-20 h-20 object-contain" />
            <div className="hidden md:flex flex-col">
              <h1 className="font-bold text-brand-orange text-3xl md:text-4xl leading-none font-display tracking-tight">Duitse Beurs Trainer</h1>
              <p className="text-sm md:text-base text-black font-bold tracking-widest uppercase mt-1">Garens & Haken</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-brand-text">Hallo, <span className="text-brand-orange">{user.name}</span></p>
              <div className="flex items-center justify-end gap-1 text-xs font-bold bg-brand-orange/10 text-brand-orange px-2 py-1 rounded-full mt-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span>{user.score} XP</span>
              </div>
            </div>

            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
            />

            <nav className="flex gap-2 p-1">
              <button
                onClick={() => setView('scenarios')}
                className={`px-6 py-2 rounded-full text-lg font-display font-bold transition-all ${view === 'scenarios'
                    ? 'bg-brand-orange text-white shadow-md transform -translate-y-0.5'
                    : 'text-brand-text hover:text-brand-orange hover:bg-orange-50'
                  }`}
              >
                Start
              </button>
              <button
                onClick={() => setView('vocabulary')}
                className={`px-6 py-2 rounded-full text-lg font-display font-bold transition-all ${view === 'vocabulary'
                    ? 'bg-brand-orange text-white shadow-md transform -translate-y-0.5'
                    : 'text-brand-text hover:text-brand-orange hover:bg-orange-50'
                  }`}
              >
                Woorden
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        {view === 'scenarios' ? (
          <ScenarioPractice {...commonProps} />
        ) : (
          <VocabularyList {...commonProps} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black mt-12 py-12 text-center bg-slate-50">
        <p className="text-brand-text font-display text-2xl">© YarnZoo 2026 - Duitse beurs trainer</p>
        <p className="text-black font-bold mt-2">Viel Erfolg auf der Messe!</p>
      </footer>
    </div>
  );
}

export default App;
