import { useState, useEffect } from 'react';

const STORAGE_KEY = 'german_trainer_user_v1';

export function useProgress() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        }
    }, [user]);

    const setUserName = (name) => {
        setUser({
            name,
            score: 0,
            completedScenarios: []
        });
    };

    const addScore = (points) => {
        setUser(prev => ({
            ...prev,
            score: (prev.score || 0) + points
        }));
    };

    const completeScenario = (scenarioId) => {
        setUser(prev => {
            if (prev.completedScenarios.includes(scenarioId)) {
                return prev;
            }
            return {
                ...prev,
                score: (prev.score || 0) + 100, // 100 XP per new scenario
                completedScenarios: [...prev.completedScenarios, scenarioId]
            };
        });
    };

    return {
        user,
        setUserName,
        addScore,
        completeScenario
    };
}
