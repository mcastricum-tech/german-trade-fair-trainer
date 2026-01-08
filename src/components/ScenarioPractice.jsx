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

                {/* Unified Practice Card */}
                <div className={`${currentStep.speaker === 'bot' ? 'bg-white' : 'bg-brand-orange'} p-6 md:p-12 rounded-[2rem] shadow-xl md:shadow-2xl text-center relative overflow-hidden transition-colors duration-500 min-h-[500px] flex flex-col justify-between border border-slate-100`}>

                    {/* Bot Area */}
                    <div className="flex flex-col items-center">
                        <div className={`transition-all duration-500 w-full ${currentStep.speaker === 'bot' ? 'opacity-100 scale-100' : 'opacity-40 scale-90 mb-4'}`}>
                            <p className="text-brand-orange text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">Buddy spreekt:</p>
                            <p className={`font-bold font-display leading-tight mb-2 ${currentStep.speaker === 'bot' ? 'text-2xl md:text-5xl text-black' : 'text-xl md:text-2xl text-white'}`}>
                                "{currentStep.speaker === 'bot' ? currentStep.text : (activeScenario.steps[currentStepIndex - 1]?.text || '...')}"
                            </p>
                            <p className={`font-medium ${currentStep.speaker === 'bot' ? 'text-slate-500 text-lg md:text-xl' : 'text-white/60 text-sm md:text-base'}`}>
                                {currentStep.speaker === 'bot' ? currentStep.translation : (activeScenario.steps[currentStepIndex - 1]?.translation || '')}
                            </p>

                            {currentStep.speaker === 'user' && (
                                <button
                                    onClick={() => speak(activeScenario.steps[currentStepIndex - 1]?.text)}
                                    className="mt-2 text-[10px] text-white/40 hover:text-white flex items-center justify-center gap-1 uppercase font-bold mx-auto transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                    Herhaal Buddy
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100/20 w-full my-6" />

                    {/* User Area */}
                    <div className={`flex flex-col items-center transition-all duration-500 ${currentStep.speaker === 'user' ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4 pointer-events-none'}`}>
                        {feedback === 'correct' ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-6">
                                <div className="text-center">
                                    <div className="text-4xl md:text-6xl font-bold mb-4 font-display text-white">
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
                                <div className="mb-6 flex flex-col items-center gap-2">
                                    <span className="bg-white/10 text-white text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white/20">Jouw beurt</span>
                                    {currentStep.speaker === 'user' && currentStep.translation && (
                                        <p className="text-white text-xl md:text-3xl font-bold mt-2">"{currentStep.translation}"</p>
                                    )}
                                </div>

                                {showHint ? (
                                    <div className="mb-6 bg-white/10 p-4 rounded-2xl w-full max-w-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Duitse zin:</p>
                                            <button onClick={() => setShowHint(false)} className="text-white/30 hover:text-white">&times;</button>
                                        </div>
                                        <p className="text-white text-xl font-bold mb-3">"{currentStep.hint}"</p>
                                        <button
                                            onClick={() => speak(currentStep.hint)}
                                            className="bg-white text-brand-orange px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 mx-auto"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            Hör uitspraak
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowHint(true)}
                                        className="text-white/40 text-xs md:text-sm hover:text-white mb-6 underline decoration-dotted"
                                    >
                                        Toon hint
                                    </button>
                                )}

                                <div className="min-h-[40px] mb-6">
                                    {transcript ? (
                                        <p className="text-white text-xl md:text-2xl font-bold italic">"{transcript}"</p>
                                    ) : (
                                        <p className="text-white/30 italic text-sm">Houd microfoon ingedrukt...</p>
                                    )}
                                </div>

                                <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 mb-4">
                                    {isListening && <div className="absolute inset-0 bg-white/20 rounded-full animate-ping pointer-events-none" />}
                                    <button
                                        onMouseDown={handleStartListening}
                                        onMouseUp={stopListening}
                                        onMouseLeave={stopListening}
                                        onTouchStart={(e) => { e.preventDefault(); handleStartListening(); }}
                                        onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                                        className={`w-full h-full rounded-full flex items-center justify-center transition-all transform z-10 relative ${isListening ? 'bg-white scale-110 shadow-lg' : 'bg-white/10 hover:bg-white/20 border-2 border-white/20'}`}
                                    >
                                        <svg className={`w-8 h-8 md:w-10 md:h-10 ${isListening ? 'text-brand-orange' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest hover:underline"
                                >
                                    Overslaan →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
