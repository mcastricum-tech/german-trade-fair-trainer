import React from 'react';
import { vocabulary, categories } from '../data/vocabulary';

export default function VocabularyList({ speak }) {
    const [activeCategory, setActiveCategory] = React.useState('materials');

    const filteredVocab = vocabulary.filter(v => v.category === activeCategory);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-brand-orange font-display mb-4">Wortschatz Üben</h2>
                <p className="text-brand-text text-lg font-medium">Klik op een kaart om de uitspraak te horen</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
                {Object.entries(categories).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`px-8 py-3 rounded-full font-display text-xl font-bold transition-all ${activeCategory === key
                                ? 'bg-brand-orange text-white shadow-xl transform -translate-y-1'
                                : 'bg-white text-brand-text hover:bg-orange-50 hover:text-brand-orange shadow-sm'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVocab.map(item => (
                    <div
                        key={item.id}
                        className="group bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 duration-300"
                        onClick={() => speak(item.term)}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-bold text-brand-orange bg-orange-50 px-4 py-2 rounded-full uppercase tracking-widest">
                                {categories[item.category]}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-orange group-hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-4xl font-bold text-black mb-3 font-display group-hover:text-brand-orange transition-colors">
                            {item.term}
                        </h3>
                        <p className="text-slate-500 font-medium text-xl">{item.translation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
