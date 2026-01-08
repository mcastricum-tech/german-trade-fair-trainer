import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeech() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const synth = window.speechSynthesis;

    const loadVoices = useCallback(() => {
        if (!synth) return;
        const availableVoices = synth.getVoices();
        if (availableVoices.length > 0) {
            const germanVoices = availableVoices.filter(v => v.lang.startsWith('de'));
            setVoices(germanVoices);

            const savedVoiceName = localStorage.getItem('preferred_voice_de');
            const storedVoice = germanVoices.find(v => v.name === savedVoiceName);

            if (storedVoice) {
                setSelectedVoice(storedVoice);
            } else {
                const premiumDefault =
                    germanVoices.find(v => v.name.includes('Google') && v.name.includes('Deutsch')) ||
                    germanVoices.find(v => v.name.includes('Premium')) ||
                    germanVoices.find(v => v.name.includes('Microsoft Stefan')) ||
                    germanVoices[0];

                if (premiumDefault) {
                    setSelectedVoice(premiumDefault);
                }
            }
        }
    }, [synth]);

    useEffect(() => {
        if (!synth) return;
        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    }, [synth, loadVoices]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
            setError("Browser ondersteunt geen spraakherkenning. Gebruik Chrome.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'de-DE';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setError(null);
        };
        recognitionRef.current.onend = () => setIsListening(false);

        recognitionRef.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                setError(`Spraakfout: ${event.error}`);
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const speak = useCallback((text) => {
        if (!synth) return;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setSpeaking(false);
        };
        synth.speak(utterance);
    }, [synth, selectedVoice]);

    const startListening = useCallback(() => {
        setTranscript('');
        setError(null);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        speaking,
        supported,
        voices,
        selectedVoice,
        setSelectedVoice: (voice) => {
            if (voice) localStorage.setItem('preferred_voice_de', voice.name);
            setSelectedVoice(voice);
        },
        resetTranscript,
        error
    };
}
