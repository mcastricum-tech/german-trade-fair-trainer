import React, { useState } from 'react';
import VocabularyList from './components/VocabularyList';
import ScenarioPractice from './components/ScenarioPractice';
import VoiceSelector from './components/VoiceSelector';
import Onboarding from './components/Onboarding';
import { useSpeech } from './hooks/useSpeech';
import { useProgress } from './hooks/useProgress';

function App() {
  const [view, setView] = useState('scenarios');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    setUserName,
    addScore,
    completeScenario,
    resetProgress
  } = useProgress();

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
    resetTranscript,
    error
  } = useSpeech();

  if (!user) {
    return <Onboarding onComplete={setUserName} />;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigate = (newView) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-5xl mx-auto px-4 w-full flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
            <h1 className="text-lg font-bold font-display tracking-tight text-black">
              Duitse Beurs <span className="text-brand-orange">Trainer</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Badge - Compact */}
            <div className="flex items-center gap-1 text-[10px] font-bold bg-brand-orange/10 text-brand-orange px-2 py-1 rounded-full">
              <span>★ {user.score} XP</span>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-slate-600 hover:text-brand-orange transition-colors"
              aria-label="Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between relative">
                <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in slide-in-from-top duration-300">
          <div className="p-6 flex justify-end">
            <button onClick={toggleMenu} className="text-4xl text-slate-400">&times;</button>
          </div>
          <nav className="flex flex-col items-center gap-8 pt-12">
            <button
              onClick={() => navigate('scenarios')}
              className={`text-3xl font-bold font-display ${view === 'scenarios' ? 'text-brand-orange' : 'text-slate-400'}`}
            >
              Zinnen
            </button>
            <button
              onClick={() => navigate('vocabulary')}
              className={`text-3xl font-bold font-display ${view === 'vocabulary' ? 'text-brand-orange' : 'text-slate-400'}`}
            >
              Woorden
            </button>
            <div className="mt-8 pt-8 border-t border-slate-100 w-full px-8 flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Duitse Stem</p>
              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onSelect={setSelectedVoice}
              />

              <button
                onClick={() => {
                  if (confirm('Weet je het zeker? Je XP en voortgang worden gewist.')) {
                    resetProgress();
                    setIsMenuOpen(false);
                  }
                }}
                className="mt-6 text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
              >
                Reset Voortgang
              </button>
            </div>
            <div className="mt-auto pb-12 text-slate-300 text-xs font-bold uppercase tracking-widest">
              Hallo, {user.name}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {!supported ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold border-2 border-red-100">
            ⚠️ Gebruik Chrome voor spraak.
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
              resetTranscript={resetTranscript}
              error={error}
            />
          ) : (
            <VocabularyList speak={speak} />
          )
        )}
      </main>
    </div>
  );
}

export default App;
