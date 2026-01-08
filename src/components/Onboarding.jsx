import React, { useState } from 'react';

export default function Onboarding({ onComplete }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete(name.trim());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-xl text-center">
                <div className="w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-4xl font-bold text-brand-orange font-display mb-4">Willkommen!</h1>
                <p className="text-brand-text text-lg mb-8">Wie heißt du? (Wat is je naam?)</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jouw voornaam"
                        className="w-full px-6 py-4 rounded-full border-2 border-slate-200 text-lg font-bold text-center focus:outline-none focus:border-brand-orange transition-colors"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-4 bg-brand-orange text-white rounded-full font-bold font-display text-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-200"
                    >
                        Starten
                    </button>
                </form>
            </div>
        </div>
    );
}
