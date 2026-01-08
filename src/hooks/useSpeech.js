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

    // Load voices
    useEffect(() => {
        if (!synth) return;

        const loadVoices = () => {
            const allVoices = synth.getVoices();
            const germanVoices = allVoices.filter(v => v.lang.includes('de'));
            setVoices(germanVoices);

            // Smart default: prioritize "Google", "Microsoft", or "Natural"
            // Only set output if no voice is currently selected or if the currently selected one is not available
            // Try to restore from localStorage first, then use smart default
            const savedVoiceName = localStorage.getItem('preferred_voice_de');

            if (germanVoices.length > 0 && !selectedVoice) {
                let initialVoice = null;

                if (savedVoiceName) {
                    initialVoice = germanVoices.find(v => v.name === savedVoiceName);
                }

                if (!initialVoice) {
                    // Smart default: prioritize "Google Deutsch", then "Neural", then any "Google"
                    initialVoice = germanVoices.find(v => v.name === 'Google Deutsch') ||
                        germanVoices.find(v => v.name.includes('Neural')) ||
                        germanVoices.find(v => v.name.includes('Google'));
                }

                setSelectedVoice(initialVoice || germanVoices[0]);
            }
        };

        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    }, [synth, selectedVoice]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
            setError("Browser ondersteunt geen spraakherkenning. Gebruik Chrome of Edge.");
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

            // Map technical error codes to user-friendly messages
            switch (event.error) {
                case 'not-allowed':
                    setError("Geen toegang tot microfoon. Controleer je instellingen.");
                    break;
                case 'no-speech':
                    setError("Geen spraak gedetecteerd. Probeer het opnieuw.");
                    break;
                case 'network':
                    setError("Netwerkfout. Controleer je internetverbinding.");
                    break;
                case 'audio-capture':
                    setError("Microfoon niet gevonden.");
                    break;
                case 'aborted':
                case 'not-allowed':
                    // 'aborted' is normal when stopping; 'not-allowed' is permission denied
                    if (event.error === 'not-allowed') {
                        setError("Geen toegang tot microfoon. Controleer je instellingen.");
                    } else {
                        setError(null); // Ignore aborted
                    }
                    break;
                default:
                    setError(`Fout bij spraakherkenning: ${event.error}`);
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
        utterance.onerror = () => setSpeaking(false);

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
                // Usually means it's already started, just ignore
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
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
        error // Export error state
    };
}
