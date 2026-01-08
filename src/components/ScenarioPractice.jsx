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
    error // Receive error
}) {
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [drillSetup, setDrillSetup] = useState(false); // State to show drill config

    // Auto-speak bot messages and auto-advance
    useEffect(() => {
        if (activeScenario && currentStepIndex < activeScenario.steps.length) {
            const step = activeScenario.steps[currentStepIndex];
            if (step.speaker === 'bot') {
                // Speak the bot message
                if (!step.isInstruction) {
                    const speakTimeout = setTimeout(() => {
                        speak(step.text);
                    }, 300);

                    // Auto-advance to next step (user turn) after a slight delay
                    const advanceTimeout = setTimeout(() => {
                        nextStep();
                    }, 2500);

                    return () => {
                        clearTimeout(speakTimeout);
                        clearTimeout(advanceTimeout);
                    };
                } else {
                    // Just an instruction (e.g. in drill mode)
                    const advanceTimeout = setTimeout(() => {
                        nextStep();
                    }, 1500);
                    return () => clearTimeout(advanceTimeout);
                }
            }
        }
    }, [activeScenario, currentStepIndex, speak]);

    // Check user answer ONLY after they stop speaking
    useEffect(() => {
        if (!activeScenario || isListening || !transcript || feedback === 'correct') return;

        const step = activeScenario.steps[currentStepIndex];
        if (step.speaker === 'user') {
            const matches = step.expected.some(word =>
                transcript.toLowerCase().includes(word.toLowerCase())
            );

            if (matches) {
                setFeedback('correct');
                addScore(10);
                const timeout = setTimeout(() => {
                    setFeedback(null);
                    nextStep();
                }, 1000);
                return () => clearTimeout(timeout);
            } else {
                setFeedback('incorrect');
            }
        }
    }, [isListening, transcript, activeScenario, currentStepIndex, feedback, addScore]);

    // Cleanup: don't need the second useEffect for incorrect state anymore as it's merged above

    const nextStep = () => {
        setFeedback(null);
        resetTranscript();

        if (currentStepIndex < activeScenario.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Scenario done
            if (activeScenario.id !== 'drill') {
                completeScenario(activeScenario.id);
            }
            setActiveScenario(null);
            setCurrentStepIndex(0);
        }
    };

    const startDrill = (count) => {
        // Create drill items by finding User steps and their preceding Bot context
        let drillItems = [];

        scenarios.forEach(sc => {
            sc.steps.forEach((step, index) => {
                if (step.speaker === 'user') {
                    // Try to find the preceding bot step for context
                    let contextStep = null;
                    if (index > 0 && sc.steps[index - 1].speaker === 'bot') {
                        contextStep = { ...sc.steps[index - 1] };
                    } else {
                        // Fallback if no bot step (e.g. start of scenario): Usage hint as bot text
                        contextStep = {
                            speaker: 'bot',
                            text: step.hint || "Vertaal:",
                            translation: "Oefen deze zin",
                            isInstruction: true
                        };
                    }

                    drillItems.push({
                        context: contextStep,
                        userStep: { ...step }
                    });
                }
            });
        });

        // Shuffle the drill items (pairs of context+answer)
        const shuffled = drillItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, count);

        // Flatten back into a step sequence: Context -> User -> Context -> User ...
        const drillSteps = [];
        selectedItems.forEach(item => {
            drillSteps.push(item.context);
            drillSteps.push(item.userStep);
        });

        setActiveScenario({
            id: 'drill',
            title: 'Snel Oefenen',
            description: `${count} willekeurige vragen`,
            steps: drillSteps
        });
        setDrillSetup(false);
        setCurrentStepIndex(0);
        setFeedback(null);
        setShowHint(false);
    };

    const handleStartScenario = (scenario) => {
        setActiveScenario(scenario);
        setCurrentStepIndex(0);
        setFeedback(null);
        setShowHint(false);
    };

    const handleStartListening = () => {
        setFeedback(null);
        startListening();
    };



    if (!activeScenario) {
        return (
            <div className="max-w-5xl mx-auto">
                {/* Drill Mode Card */}
                <div className="mb-12">
                    <div className="bg-brand-orange text-white rounded-[2rem] p-8 md:p-10 shadow-lg relative overflow-hidden ring-4 ring-orange-100">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="text-3xl md:text-4xl font-bold font-display mb-2">⚡️ Snel Oefenen</h3>
                            <p className="text-orange-100 text-lg font-medium mb-6">Kies direct een aantal vragen:</p>

                            <div className="flex gap-4 justify-center">
                                {[5, 10, 15].map(num => (
                                    <button
                                        key={num}
                                        onClick={(e) => { e.stopPropagation(); startDrill(num); }}
                                        className="w-14 h-14 md:w-16 md:h-16 bg-white text-brand-orange font-bold text-xl md:text-2xl rounded-full hover:bg-orange-50 hover:scale-110 transition-all shadow-md active:scale-95 flex items-center justify-center font-display"
                                        aria-label={`${num} vragen`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Decorative background shapes */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute top-10 right-10 text-9xl opacity-10 font-display rotate-12 pointer-events-none">?</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {scenarios.map(sc => {
                        const isCompleted = user?.completedScenarios?.includes(sc.id);
                        return (
                            <div
                                key={sc.id}
                                onClick={() => handleStartScenario(sc)}
                                className={`bg-white rounded-[2rem] p-10 shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1 duration-300 relative overflow-hidden ${isCompleted ? 'ring-4 ring-brand-teal/20' : ''}`}
                            >
                                {isCompleted && (
                                    <div className="absolute top-0 right-0 bg-brand-teal text-white px-4 py-2 rounded-bl-[2rem] font-bold text-sm uppercase tracking-wider">
                                        Voltooid ✓
                                    </div>
                                )}
                                <h3 className="text-3xl font-bold text-black mb-4 font-display group-hover:text-brand-orange transition-colors">
                                    {sc.title}
                                </h3>
                                <p className="text-brand-text text-lg leading-relaxed font-medium">{sc.description}</p>
                                <div className="mt-8 flex items-center text-brand-orange font-bold font-display text-xl uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                    Starten <span className="ml-2">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const currentStep = activeScenario.steps[currentStepIndex];

    return (
        <div className="max-w-3xl mx-auto min-h-[60vh] flex flex-col justify-start md:justify-center pt-8 md:pt-0 pb-32 md:pb-0">
            <div className="flex justify-between items-center mb-4 md:mb-8">
                <button
                    onClick={() => setActiveScenario(null)}
                    className="text-slate-400 hover:text-brand-orange flex items-center gap-2 font-bold font-display text-lg md:text-xl transition-colors"
                >
                    ← Stoppen
                </button>

                {/* XP gained in this session indicator could go here, but global is in header */}
            </div>

            <div className="flex-1 flex flex-col gap-6 md:gap-8">
                {/* Progress */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-brand-orange h-full rounded-full transition-all duration-500"
                        style={{ width: `${((currentStepIndex) / activeScenario.steps.length) * 100}%` }}
                    />
                </div>

                {/* Bot Message or Context */}
                {currentStep.speaker === 'bot' && (
                    <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-xl md:shadow-2xl text-center relative overflow-hidden ring-1 ring-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                        <p className="text-2xl md:text-5xl font-bold text-black mb-4 font-display leading-tight italic opacity-40 animate-pulse">
                            Buddy spreekt...
                        </p>
                        <p className="text-2xl md:text-4xl font-bold text-black mb-4 font-display leading-tight">"{currentStep.text}"</p>
                        <p className="text-slate-500 text-lg md:text-xl font-medium">{currentStep.translation}</p>
                    </div>
                )}

                {/* User Turn */}
                {currentStep.speaker === 'user' && (
                    <div className="bg-brand-orange p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl text-center text-white relative overflow-hidden">

                        {feedback === 'correct' ? (
                            <div className="py-8 flex flex-col items-center justify-center min-h-[250px] gap-6">
                                <div className="text-center">
                                    <div className="text-4xl md:text-6xl font-bold mb-4 font-display">
                                        Richtig! ✓
                                    </div>
                                    <p className="text-white/80 font-bold text-xl md:text-2xl">+10 XP</p>
                                </div>
                                <button
                                    onClick={nextStep}
                                    className="px-10 py-4 bg-white text-brand-orange rounded-full font-bold font-display text-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                >
                                    Volgende →
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* If we are in drill mode, allow skipping simply */}

                                <div className="mb-6 md:mb-8 flex flex-col items-center gap-2">
                                    <span className="bg-white/10 text-white text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white/20">Jij bent aan de beurt</span>

                                    {/* Bot Context (Previous Step) */}
                                    {currentStepIndex > 0 && activeScenario.steps[currentStepIndex - 1].speaker === 'bot' && (
                                        <div className="mt-4 mb-6 bg-black/10 p-4 rounded-2xl w-full max-w-sm border border-white/10">
                                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Buddy zei:</p>
                                            <p className="text-xl font-bold">"{activeScenario.steps[currentStepIndex - 1].text}"</p>
                                            <div className="flex justify-center gap-4 mt-2">
                                                <button
                                                    onClick={() => speak(activeScenario.steps[currentStepIndex - 1].text)}
                                                    className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 uppercase font-bold"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                                    Herhaal Buddy
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep.translation && (
                                        <p className="text-xl md:text-3xl font-bold mt-2">"{currentStep.translation}"</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="mb-6 bg-red-500/20 border border-red-500/50 p-3 md:p-4 rounded-xl animate-pulse">
                                        <p className="text-red-200 font-bold text-xs md:text-sm">⚠️ {error}</p>
                                    </div>
                                )}

                                {showHint ? (
                                    <div
                                        className="mb-6 md:mb-10 bg-white/10 p-4 md:p-6 rounded-2xl inline-block w-full max-w-lg relative"
                                    >
                                        <div className="flex justify-between items-center mb-1 md:mb-2">
                                            <p className="text-white/60 text-xs md:text-sm uppercase font-bold tracking-wider">Het antwoord is:</p>
                                            <button
                                                onClick={() => setShowHint(false)}
                                                className="text-white/30 hover:text-white text-[10px] uppercase tracking-widest"
                                            >
                                                Sluiten &times;
                                            </button>
                                        </div>
                                        <p className="text-xl md:text-3xl font-bold font-display leading-snug mb-4">"{currentStep.hint}"</p>
                                        <button
                                            onClick={() => speak(currentStep.hint)}
                                            className="bg-white text-brand-orange px-6 py-2 rounded-full font-bold font-display text-sm hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            Hör de uitspraak
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowHint(true)}
                                        className="text-white/60 text-xs md:text-sm hover:text-white mb-6 md:mb-10 underline decoration-dotted underline-offset-4"
                                    >
                                        Toon hint
                                    </button>
                                )}

                                <div className="min-h-[60px] md:min-h-[100px] mb-6 md:mb-8 flex flex-col items-center justify-center gap-2">
                                    {transcript ? (
                                        <>
                                            <p className="text-2xl md:text-4xl font-bold italic">"{transcript}"</p>
                                            {feedback === 'incorrect' && (
                                                <p className="text-white/60 font-bold text-sm animate-pulse mt-2">Niet herkend. Probeer de hint!</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-white/40 italic text-lg md:text-2xl">Druk op de knop en spreek...</p>
                                    )}
                                </div>

                                <div className="relative mx-auto w-24 h-24 md:w-28 md:h-28">
                                    {isListening && (
                                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping pointer-events-none" />
                                    )}
                                    <button
                                        onMouseDown={handleStartListening}
                                        onMouseUp={stopListening}
                                        onMouseLeave={stopListening}
                                        onTouchStart={(e) => { e.preventDefault(); handleStartListening(); }}
                                        onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                                        className={`w-full h-full rounded-full flex items-center justify-center transition-all transform z-10 relative ${isListening
                                            ? 'bg-white scale-110 shadow-lg'
                                            : 'bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:scale-105'
                                            }`}
                                    >
                                        <svg className={`w-10 h-10 md:w-12 md:h-12 ${isListening ? 'text-brand-orange' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="mt-4 md:mt-6 text-xs md:text-sm text-white/40 font-bold uppercase tracking-widest mb-8">Houd ingedrukt om te spreken</p>

                                <button
                                    onClick={nextStep}
                                    className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest hover:underline py-4"
                                >
                                    Overslaan →
                                </button>
                            </>
                        )}

                        {/* Removed absolute positioned skip button */}
                    </div>
                )}
            </div>
        </div>
    );
}
