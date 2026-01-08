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
    error,
    mastery,
    recordAttempt
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

                // Auto-advance to the user part
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

                // Generate unique step ID for tracking
                const stepId = `${activeScenario.id}:${currentStep.originalIdx || currentStepIndex}`;

                if (normalizedTranscript.includes(expected) || matchedKeywords.length >= Math.ceil(keywords.length / 2)) {
                    setFeedback('correct');
                    addScore(10);
                    recordAttempt(stepId, true);
                } else {
                    setFeedback('incorrect');
                    recordAttempt(stepId, false);
                }
            }
        }
    }, [isListening, transcript]);

    const startDrill = (count) => {
        // Collect all possible user steps
        const allUserSteps = scenarios.flatMap(s =>
            s.steps
                .map((step, idx) => ({ ...step, scenarioId: s.id, originalIdx: idx, parentScenario: s }))
                .filter(step => step.speaker === 'user')
        );

        // Weighted random selection based on mastery
        const weightedPool = [];
        allUserSteps.forEach(step => {
            const stepId = `${step.scenarioId}:${step.originalIdx}`;
            const m = mastery[stepId] || { score: 0 };

            let weight = 10; // Default: Never seen
            if (m.score > 80) weight = 1; // Mastered
            else if (m.score > 50) weight = 3; // Learning
            else if (m.score > 0) weight = 7; // Struggling

            // Add to pool based on weight
            for (let i = 0; i < weight; i++) {
                weightedPool.push(step);
            }
        });

        // Pick 'count' unique steps from the weighted pool
        const selectedSteps = [];
        const usedIds = new Set();

        while (selectedSteps.length < count && weightedPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            const step = weightedPool[randomIndex];
            const stepId = `${step.scenarioId}:${step.originalIdx}`;

            if (!usedIds.has(stepId)) {
                selectedSteps.push(step);
                usedIds.add(stepId);
            }
            // Remove all instances of this step from the pool to avoid duplicates
            weightedPool.filter(s => `${s.scenarioId}:${s.originalIdx}` !== stepId);
        }

        const drillSteps = selectedSteps.flatMap(step => [
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
            title: `Smart Oefenen (${count})`,
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
                    <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-2">Jouw Personal Trainer</p>
                    <h3 className="text-3xl font-bold mb-4 font-display">Smart Oefenen</h3>
                    <p className="text-slate-500 text-sm mb-6">De app kiest automatisch zinnen die je nog niet goed kent.</p>
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
        <div className="min-h-[85vh] flex flex-col items-center justify-start py-2 animate-in fade-in duration-500">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col items-center p-8 md:p-10 text-center relative">

                    {/* Bot Segment - Always visible once it happened */}
                    <div className="mb-6 w-full">
                        <p className="text-brand-orange text-[10px] font-bold uppercase tracking-widest mb-2">Buddy spreekt:</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-black mb-1 font-display leading-tight">
                            "{currentStep.speaker === 'bot' ? currentStep.text : (activeScenario.steps[currentStepIndex - 1]?.text || '...')}"
                        </h2>
                        <p className="text-slate-400 text-base md:text-lg">
                            {currentStep.speaker === 'bot' ? currentStep.translation : (activeScenario.steps[currentStepIndex - 1]?.translation || '')}
                        </p>
                    </div>

                    <div className="w-full h-px bg-slate-50 mb-6" />

                    {/* User Action Segment */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center">
                        {currentStep.speaker === 'user' ? (
                            feedback === 'correct' ? (
                                <div className="space-y-4 py-6">
                                    <h3 className="text-4xl font-bold text-brand-orange animate-bounce">Richtig! ✓</h3>
                                    <p className="text-slate-400 font-bold text-lg">+10 XP</p>
                                    <button
                                        onClick={nextStep}
                                        className="px-10 py-3 bg-brand-orange text-white rounded-full font-bold text-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                                    >
                                        Volgende →
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <p className="text-black text-lg md:text-xl font-bold mb-2">Spreek dit na:</p>
                                        <p className="text-brand-orange text-xl md:text-2xl font-bold">"{currentStep.hint}"</p>
                                    </div>

                                    <div className="min-h-[50px] mb-6 bg-slate-50 w-full rounded-2xl p-4 flex items-center justify-center">
                                        {transcript ? (
                                            <p className="text-black text-lg font-bold italic">"{transcript}"</p>
                                        ) : (
                                            <p className="text-slate-400 italic text-sm">Houd microfoon ingedrukt en spreek...</p>
                                        )}
                                    </div>

                                    <div className="relative mb-4">
                                        {isListening && <div className="absolute inset-0 bg-brand-orange/20 rounded-full animate-ping" />}
                                        <button
                                            onMouseDown={handleStartListening}
                                            onMouseUp={stopListening}
                                            onMouseLeave={stopListening}
                                            onTouchStart={(e) => { e.preventDefault(); handleStartListening(); }}
                                            onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform shadow-xl relative z-10 ${isListening ? 'bg-brand-orange scale-110' : 'bg-white border-2 border-slate-100 hover:border-brand-orange'}`}
                                        >
                                            <svg className={`w-8 h-8 ${isListening ? 'text-white' : 'text-brand-orange'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Houd ingedrukt om te spreken</p>

                                    <button
                                        onClick={nextStep}
                                        className="text-slate-300 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors mb-4"
                                    >
                                        Overslaan &rarr;
                                    </button>
                                </>
                            )
                        ) : (
                            <div className="py-8 flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Luisteren naar Buddy...</p>
                            </div>
                        )}
                    </div>

                    {/* Stoppen button */}
                    <button
                        onClick={() => setActiveScenario(null)}
                        className="mt-4 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:text-slate-500 transition-colors"
                    >
                        &larr; Stoppen
                    </button>
                </div>
            </div>
        </div>
    );
}
