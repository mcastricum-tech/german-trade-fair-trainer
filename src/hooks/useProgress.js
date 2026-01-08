import { useState, useEffect } from 'react';

export function useProgress() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('trainer_user');
        return saved ? JSON.parse(saved) : { name: '', score: 0, completed: [] };
    });

    // Mastery tracks performance per unique step ID (scenarioId:index)
    // Value is 0-100 representing confidence/success rate
    const [mastery, setMastery] = useState(() => {
        const saved = localStorage.getItem('trainer_mastery');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('trainer_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('trainer_mastery', JSON.stringify(mastery));
    }, [mastery]);

    const setUserName = (name) => {
        setUser(prev => ({ ...prev, name }));
    };

    const addScore = (points) => {
        setUser(prev => ({ ...prev, score: prev.score + points }));
    };

    const completeScenario = (scenarioId) => {
        if (!user.completed.includes(scenarioId)) {
            setUser(prev => ({
                ...prev,
                completed: [...prev.completed, scenarioId]
            }));
            addScore(50);
        }
    };

    const resetProgress = () => {
        if (window.confirm("Weet je zeker dat je je score en voortgang wilt resetten? Je naam blijft behouden.")) {
            setUser(prev => ({
                ...prev,
                score: 0,
                completed: []
            }));
            setMastery({});
            return true;
        }
        return false;
    };

    const recordAttempt = (stepId, isCorrect) => {
        setMastery(prev => {
            const current = prev[stepId] || { score: 0, attempts: 0, lastResult: null };
            const newAttempts = current.attempts + 1;

            // Simple moving average approach for mastery score
            let newScore = current.score;
            if (isCorrect) {
                newScore = Math.min(100, current.score + 25); // Faster ramp up
            } else {
                newScore = Math.max(0, current.score - 15); // Gentler penalty to encourage
            }

            return {
                ...prev,
                [stepId]: {
                    score: newScore,
                    attempts: newAttempts,
                    lastResult: isCorrect ? 'success' : 'fail',
                    timestamp: Date.now()
                }
            };
        });
    };

    return {
        user,
        mastery,
        setUserName,
        addScore,
        completeScenario,
        resetProgress,
        recordAttempt
    };
}
