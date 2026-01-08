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
    error // Receive error
}) {
    const [activeScenario, setActiveScenario] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [drillSetup, setDrillSetup] = useState(false); // State to show drill config

    // Auto-speak bot messages
    useEffect(() => {
        if (activeScenario && currentStepIndex < activeScenario.steps.length) {
            const step = activeScenario.steps[currentStepIndex];
            // Speak only if it's a bot turn.
            if (step.speaker === 'bot') {
                // If it's a context instruction in drill mode (isInstruction is true), we might NOT want to speak it if it's Dutch.
                // Assuming original bot steps are German.
                if (!step.isInstruction) {
                    const timeout = setTimeout(() => {
                        speak(step.text);
                    }, 500);
                    return () => clearTimeout(timeout);
                }
            }
        }
    }, [activeScenario, currentStepIndex, speak]);

    // Check user answer
    useEffect(() => {
        if (!activeScenario) return;
        const step = activeScenario.steps[currentStepIndex];

        if (step.speaker === 'user' && transcript && !feedback) { // Prevent multiple triggers
            const matches = step.expected.some(word =>
                transcript.toLowerCase().includes(word.toLowerCase())
            );

            if (matches) {
                setFeedback('correct');
                addScore(10); // Immediate XP
                const timeout = setTimeout(() => {
                    setFeedback(null);
                    nextStep();
                }, 1500);
                return () => clearTimeout(timeout);
            }
        }
    }, [transcript, activeScenario, currentStepIndex, feedback, addScore]);

    const nextStep = () => {
        if (currentStepIndex < activeScenario.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Scenario done
            if (activeScenario.id !== 'drill') {
                completeScenario(activeScenario.id);
                alert(`Scenario voltooid! Gut gemacht! (+100 XP Bonus)`);
            } else {
                alert(`Drill sessie compleet! Goed gedaan!`);
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



    if (!activeScenario) {
        return (
            <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-brand-orange font-display mb-10 text-center tracking-tight">Scenario's</h2>

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
                    <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl text-center relative overflow-hidden ring-1 ring-slate-100">
                        {/* Minimalist pulse indicator */}
                        {speaking && (
                            <div className="absolute top-6 right-6 flex gap-1">
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        )}

                        <p className="text-2xl md:text-5xl font-bold text-black mb-4 md:mb-6 font-display leading-tight">"{currentStep.text}"</p>
                        <p className="text-slate-500 text-lg md:text-xl font-medium mb-8 md:mb-10">{currentStep.translation}</p>

                        <div className="flex flex-col items-center gap-3 md:gap-4">
                            <button
                                onClick={nextStep}
                                className="w-full md:w-auto px-6 md:px-12 py-3 md:py-4 bg-brand-orange text-white rounded-full font-bold font-display text-lg md:text-2xl hover:bg-orange-600 transition-all hover:scale-105 shadow-lg md:shadow-xl hover:shadow-orange-200"
                            >
                                Weiter →
                            </button>
                            {!currentStep.isInstruction && (
                                <button
                                    onClick={() => speak(currentStep.text)}
                                    className="text-slate-400 hover:text-black font-bold text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 mt-1 md:mt-4 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Wiederholen
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* User Turn */}
                {currentStep.speaker === 'user' && (
                    <div className="bg-black p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl text-center text-white relative overflow-hidden">

                        {feedback === 'correct' ? (
                            <div className="py-8">
                                <div className="text-4xl md:text-6xl font-bold text-brand-orange mb-4 font-display animate-bounce">
                                    Richtig! ✓
                                </div>
                                <p className="text-brand-teal font-bold text-xl md:text-2xl animate-pulse">+10 XP</p>
                            </div>
                        ) : (
                            <>
                                {/* If we are in drill mode, allow skipping simply */}

                                <div className="mb-6 md:mb-8">
                                    <span className="bg-white/10 text-white text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white/20">Jij bent aan de beurt</span>
                                </div>

                                {error && (
                                    <div className="mb-6 bg-red-500/20 border border-red-500/50 p-3 md:p-4 rounded-xl animate-pulse">
                                        <p className="text-red-200 font-bold text-xs md:text-sm">⚠️ {error}</p>
                                    </div>
                                )}

                                {showHint ? (
                                    <div
                                        onClick={() => setShowHint(false)}
                                        className="mb-6 md:mb-10 bg-white/5 p-4 md:p-6 rounded-2xl inline-block max-w-lg cursor-pointer hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex justify-between items-center mb-1 md:mb-2">
                                            <p className="text-brand-orange text-xs md:text-sm uppercase font-bold tracking-wider">Hint</p>
                                            <span className="text-slate-400 text-xs text-[10px] uppercase tracking-widest">Tik om te sluiten</span>
                                        </div>
                                        <p className="text-xl md:text-3xl font-bold font-display leading-snug">"{currentStep.hint}"</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowHint(true)}
                                        className="text-slate-400 text-xs md:text-sm hover:text-white mb-6 md:mb-10 underline decoration-dotted underline-offset-4"
                                    >
                                        Toon hint
                                    </button>
                                )}

                                <div className="min-h-[60px] md:min-h-[100px] mb-6 md:mb-8 flex items-center justify-center">
                                    {transcript ? (
                                        <p className="text-2xl md:text-4xl font-bold">"{transcript}"</p>
                                    ) : (
                                        <p className="text-slate-500 italic text-lg md:text-2xl">Druk op de knop en spreek...</p>
                                    )}
                                </div>

                                <button
                                    onMouseDown={startListening}
                                    onMouseUp={stopListening}
                                    onMouseLeave={stopListening} // Safety: stop if mouse leaves button
                                    onTouchStart={(e) => { e.preventDefault(); startListening(); }}
                                    onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mx-auto transition-all transform ${isListening
                                        ? 'bg-brand-orange scale-110 shadow-[0_0_30px_rgba(231,64,22,0.6)]'
                                        : 'bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:scale-105'
                                        }`}
                                >
                                    <svg className={`w-10 h-10 md:w-12 md:h-12 ${isListening ? 'text-white' : 'text-brand-orange'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                                <p className="mt-4 md:mt-6 text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest mb-8">Houd ingedrukt om te spreken</p>

                                <button
                                    onClick={nextStep}
                                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest hover:underline py-4"
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
