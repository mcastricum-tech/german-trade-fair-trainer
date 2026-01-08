import React, { useState } from 'react';
import VocabularyList from './components/VocabularyList';
import ScenarioPractice from './components/ScenarioPractice';
import VoiceSelector from './components/VoiceSelector';
import Onboarding from './components/Onboarding';
import { useSpeech } from './hooks/useSpeech';
import { useProgress } from './hooks/useProgress';

function App() {
  const [view, setView] = useState('scenarios');
  const { user, setUserName, addScore, completeScenario } = useProgress();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    speaking,
    supported,
    voices,
    selectedVoice,
    setSelectedVoice,
    error // Receive error
  } = useSpeech();

  if (!user) {
    return <Onboarding onComplete={setUserName} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="YarnZoo Logo" className="h-10 w-auto" onError={(e) => e.target.style.display = 'none'} />
            <div className="leading-tight">
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-black">
                Duitse Beurs <span className="text-brand-orange">Trainer</span>
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden sm:block">YarnZoo Academy</p>
            </div>
          </div>

          {/* Nav & Tools */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setView('scenarios')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${view === 'scenarios' ? 'bg-white text-brand-orange shadow-md' : 'text-slate-500 hover:text-black'}`}
              >
                Scenario's
              </button>
              <button
                onClick={() => setView('vocabulary')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${view === 'vocabulary' ? 'bg-white text-brand-orange shadow-md' : 'text-slate-500 hover:text-black'}`}
              >
                Woorden
              </button>
            </nav>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-brand-text">Hallo, <span className="text-brand-orange">{user.name}</span></p>
              <div className="flex items-center justify-end gap-1 text-xs font-bold bg-brand-orange/10 text-brand-orange px-2 py-1 rounded-full mt-1">
                <span className="text-lg leading-none">★</span>
                <span>{user.score} XP</span>
              </div>
            </div>

            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onSelect={setSelectedVoice}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10">
        {!supported ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border-2 border-red-100">
            ⚠️ Je browser ondersteunt geen spraakherkenning. Gebruik Google Chrome of Microsoft Edge.
          </div>
        ) : (
          view === 'scenarios' ? (
            <ScenarioPractice
              speak={speak}
              startListening={startListening}
              stopListening={stopListening}
              transcript={transcript}
              isListening={isListening}
              speaking={speaking}
              completeScenario={completeScenario}
              addScore={addScore}
              user={user}
              error={error} // Pass error prop
            />
          ) : (
            <VocabularyList speak={speak} />
          )
        )}
      </main>

      {/* Mobile Footer Nav (visible only on small screens) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <button
          onClick={() => setView('scenarios')}
          className={`flex flex-col items-center gap-1 ${view === 'scenarios' ? 'text-brand-orange' : 'text-slate-400'}`}
        >
          <span className="text-2xl">💬</span>
          <span className="text-xs font-bold uppercase">Scenario's</span>
        </button>
        <button
          onClick={() => setView('vocabulary')}
          className={`flex flex-col items-center gap-1 ${view === 'vocabulary' ? 'text-brand-orange' : 'text-slate-400'}`}
        >
          <span className="text-2xl">📖</span>
          <span className="text-xs font-bold uppercase">Woorden</span>
        </button>
      </footer>
    </div>
  );
}

export default App;
