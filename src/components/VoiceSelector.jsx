import React from 'react';
import { useSpeech } from '../hooks/useSpeech';

export default function VoiceSelector({
    voices,
    selectedVoice,
    onSelect
}) {
    if (!voices || voices.length === 0) return null;

    return (
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <label htmlFor="voice-select" className="text-xs font-bold text-brand-orange uppercase tracking-widest">
                Stem
            </label>
            <select
                id="voice-select"
                value={selectedVoice ? selectedVoice.name : ''}
                onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    onSelect(voice);
                }}
                className="text-sm font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
                {voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                        {voice.name.replace(/Google|Microsoft|Desktop/g, '').replace(/\(.*\)/, '').trim()}
                    </option>
                ))}
            </select>
        </div>
    );
}
