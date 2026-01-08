import React, { useState, useEffect } from 'react';
import { scenarios } from '../data/vocabulary';

export default function ScenarioPractice({
    speak,
    startListening,
    stopListening,
    transcript,
    isListening,
    speaking,
    completeScenario,
    addScore,
    user,
    resetTranscript,
    error
}) {
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);

    // Auto-speak bot messages and prepare for user turn
    useEffect(() => {
        if (activeScenario && currentStepIndex < activeScenario.steps.length) {
            const step = activeScenario.steps[currentStepIndex];
            if (step.speaker === 'bot') {
                const speakTimeout = setTimeout(() => {
                    speak(step.text);
                }, 300);

                // Auto-advance to the user part (which in this new UI is basically enabling the mic for the same text)
                const advanceTimeout = setTimeout(() => {
                    if (currentStepIndex < activeScenario.steps.length - 1 && activeScenario.steps[currentStepIndex + 1].speaker === 'user') {
                        setCurrentStepIndex(prev => prev + 1);
                    }
                }, 2000 + (step.text.length * 50));

                return () => {
                    clearTimeout(speakTimeout);
                    clearTimeout(advanceTimeout);
                };
            }
        }
    }, [activeScenario, currentStepIndex, speak]);

    // Check answer when transcript changes
    useEffect(() => {
        if (!isListening && transcript && activeScenario) {
            const currentStep = activeScenario.steps[currentStepIndex];
            if (currentStep && currentStep.speaker === 'user') {
                const normalizedTranscript = transcript.toLowerCase().trim();
                const expected = currentStep.hint?.toLowerCase().trim() || activeScenario.steps[currentStepIndex - 1]?.text?.toLowerCase().trim();

                // Simple keyword check
                const keywords = currentStep.expected || [];
                const matchedKeywords = keywords.filter(kw => normalizedTranscript.includes(kw.toLowerCase()));

                if (normalizedTranscript.includes(expected) || matchedKeywords.length >= Math.ceil(keywords.length / 2)) {
                    setFeedback('correct');
                    addScore(10);
                } else {
                    setFeedback('incorrect');
                }
            }
        }
    }, [isListening, transcript]);

    const startDrill = (count) => {
        const allUserSteps = scenarios.flatMap(s =>
            s.steps
                .map((step, idx) => ({ ...step, parentScenario: s, originalIdx: idx }))
                .filter(step => step.speaker === 'user')
        );
        const shuffled = [...allUserSteps].sort(() => 0.5 - Math.random());
        const drillSteps = shuffled.slice(0, count).flatMap(step => [
            {
                speaker: 'bot',
                text: step.parentScenario.steps[step.originalIdx - 1]?.text || "Spreek na:",
                translation: step.parentScenario.steps[step.originalIdx - 1]?.translation || "Spreek na:",
                isInstruction: true
            },
            step
        ]);

        setActiveScenario({
            id: 'drill',
            title: `Snel Oefenen (${count})`,
            steps: drillSteps
        });
        setCurrentStepIndex(0);
        setFeedback(null);
        resetTranscript();
    };

    const nextStep = () => {
        setFeedback(null);
        resetTranscript();
        if (currentStepIndex < activeScenario.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            completeScenario(activeScenario.id);
            setActiveScenario(null);
        }
    };

    const handleStartListening = () => {
        setFeedback(null);
        startListening();
    };

    if (!activeScenario) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 text-center">
                    <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-2">Direct Aan de Slag</p>
                    <h3 className="text-3xl font-bold mb-6 font-display">Snel Oefenen</h3>
                    <div className="flex justify-center gap-4">
                        {[5, 10, 15].map(num => (
                            <button
                                key={num}
                                onClick={() => startDrill(num)}
                                className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center font-bold text-xl hover:border-brand-orange hover:text-brand-orange hover:bg-white transition-all transform hover:scale-110"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {scenarios.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setActiveScenario(s); setCurrentStepIndex(0); setFeedback(null); resetTranscript(); }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left hover:border-brand-orange transition-all flex justify-between items-center group"
                        >
                            <div>
                                <h4 className="font-bold text-lg mb-1 group-hover:text-brand-orange transition-colors">{s.title}</h4>
                                <p className="text-slate-500 text-sm">{s.description}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-full group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentStep = activeScenario.steps[currentStepIndex];

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-start py-4 animate-in fade-in duration-500">
            <div className="w-full max-w-lg">
                <button
                    onClick={() => setActiveScenario(null)}
                    className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2 hover:text-slate-600 transition-colors"
                >
                    &larr; Stoppen
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[550px] flex flex-col items-center p-8 md:p-12 text-center">

                    {/* Bot Segment - Always visible once it happened */}
                    <div className="mb-12 w-full">
                        <p className="text-brand-orange text-[10px] font-bold uppercase tracking-widest mb-3">Buddy spreekt:</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-black mb-2 font-display leading-tight">
                            "{currentStep.speaker === 'bot' ? currentStep.text : (activeScenario.steps[currentStepIndex - 1]?.text || '...')}"
                        </h2>
                        <p className="text-slate-400 text-lg">
                            {currentStep.speaker === 'bot' ? currentStep.translation : (activeScenario.steps[currentStepIndex - 1]?.translation || '')}
                        </p>
                    </div>

                    <div className="w-full h-px bg-slate-50 mb-12" />

                    {/* User Action Segment */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                        {currentStep.speaker === 'user' ? (
                            feedback === 'correct' ? (
                                <div className="space-y-6 py-8">
                                    <h3 className="text-5xl font-bold text-brand-orange animate-bounce">Richtig! ✓</h3>
                                    <p className="text-slate-400 font-bold text-xl">+10 XP</p>
                                    <button
                                        onClick={nextStep}
                                        className="px-12 py-4 bg-brand-orange text-white rounded-full font-bold text-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                                    >
                                        Volgende →
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <p className="text-black text-xl md:text-2xl font-bold mb-2">Spreek dit na:</p>
                                        <p className="text-brand-orange text-2xl md:text-3xl font-bold">"{currentStep.hint}"</p>
                                    </div>

                                    <div className="min-h-[60px] mb-8 bg-slate-50 w-full rounded-2xl p-4 flex items-center justify-center">
                                        {transcript ? (
                                            <p className="text-black text-xl font-bold italic">"{transcript}"</p>
                                        ) : (
                                            <p className="text-slate-400 italic text-sm">Houd microfoon ingedrukt en spreek...</p>
                                        )}
                                    </div>

                                    <div className="relative mb-6">
                                        {isListening && <div className="absolute inset-0 bg-brand-orange/20 rounded-full animate-ping" />}
                                        <button
                                            onMouseDown={handleStartListening}
                                            onMouseUp={stopListening}
                                            onMouseLeave={stopListening}
                                            onTouchStart={(e) => { e.preventDefault(); handleStartListening(); }}
                                            onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform shadow-xl relative z-10 ${isListening ? 'bg-brand-orange scale-110' : 'bg-white border-2 border-slate-100 hover:border-brand-orange'}`}
                                        >
                                            <svg className={`w-10 h-10 ${isListening ? 'text-white' : 'text-brand-orange'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Houd ingedrukt om te spreken</p>

                                    <button
                                        onClick={nextStep}
                                        className="text-slate-300 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors pb-4"
                                    >
                                        Overslaan &rarr;
                                    </button>
                                </>
                            )
                        ) : (
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Luisteren naar Buddy...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
