import React, { useState } from 'react';
import { vocabulary, categories } from '../data/vocabulary';

export default function VocabularyList({ speak }) {
    // Convert categories object to array for easier mapping
    const categoryList = Object.entries(categories).map(([id, label]) => ({ id, label }));

    // Initialize with the first category
    const [selectedCategory, setSelectedCategory] = useState(categoryList[0].id);

    const filteredWords = vocabulary.filter(v => v.category === selectedCategory);

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-0">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-brand-orange font-display mb-4 tracking-tight">Wortschatz Üben</h2>
                <p className="text-slate-500 text-lg">Klik op een kaart om de uitspraak te horen 🔊</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 sticky top-20 bg-slate-50/95 p-4 rounded-2xl backdrop-blur-sm z-30 shadow-sm border border-slate-100">
                {categoryList.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-5 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 ${selectedCategory === cat.id
                            ? 'bg-brand-orange text-white shadow-lg ring-2 ring-orange-200'
                            : 'bg-white text-slate-500 hover:text-brand-orange shadow-sm border border-slate-200 hover:border-brand-orange'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Visual Header for Section */}
            <div className="mb-6 flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    {categories[selectedCategory] || 'Alle Woorden'}
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWords.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => speak(item.german)}
                        className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 border border-slate-100 group relative overflow-hidden active:scale-95"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-orange/5 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-150" />

                        <p className="text-2xl font-bold text-black group-hover:text-brand-orange mb-2 font-display">{item.german}</p>
                        <p className="text-slate-500 font-medium">{item.dutch}</p>

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-orange">
                            🔊
                        </div>
                    </div>
                ))}
            </div>

            {filteredWords.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic">
                    Geen woorden gevonden in deze categorie.
                </div>
            )}
        </div>
    );
}
