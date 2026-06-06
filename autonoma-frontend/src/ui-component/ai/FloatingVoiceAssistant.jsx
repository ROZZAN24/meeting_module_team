import React, { useState, useEffect, useRef } from 'react';
import { Box, Fab, Typography, Paper, Fade, IconButton, Stack } from '@mui/material';
import { IconMicrophone, IconVolume, IconX, IconBrandGoogleFilled } from '@tabler/icons-react';
import { keyframes } from '@mui/system';
import axiosServices from 'utils/axios';

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const waveAnimation = keyframes`
  0% { transform: scaleY(0.5); }
  50% { transform: scaleY(1.2); }
  100% { transform: scaleY(0.5); }
`;

export default function FloatingVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [displayedAiResponse, setDisplayedAiResponse] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const typingTimerRef = useRef(null);

  const recognitionTimerRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ta-IN'; // Default to Tamil to capture native speech better

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        if (recognitionTimerRef.current) clearTimeout(recognitionTimerRef.current);
        
        // Wait 2 seconds after they stop speaking before processing
        recognitionTimerRef.current = setTimeout(() => {
          if (currentTranscript.trim()) {
            recognition.stop();
            processAIRequest(currentTranscript);
          }
        }, 2000);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListen = () => {
    if (!isOpen) setIsOpen(true);
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setAiResponse('');
      setDisplayedAiResponse('');
      clearInterval(typingTimerRef.current);
      synthRef.current?.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.start();
    }
  };

  const processAIRequest = async (text) => {
    if (!text.trim()) return;
    setAiResponse('Thinking...');
    setDisplayedAiResponse('Thinking...');
    try {
      const res = await axiosServices.post('/api/assistant/chat', { prompt: text });
      const reply = res.data.response || "Sorry, I couldn't understand that.";
      setAiResponse(reply);
      animateTyping(reply);
      speakText(reply);
    } catch (error) {
      const errorMsg = 'Oops! Something went wrong. Check if API key is configured.';
      setAiResponse(errorMsg);
      animateTyping(errorMsg);
      speakText('Oops! Something went wrong.');
    }
  };

  const animateTyping = (text) => {
    setDisplayedAiResponse('');
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    
    let i = 0;
    typingTimerRef.current = setInterval(() => {
      setDisplayedAiResponse(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(typingTimerRef.current);
      }
    }, 30); // 30ms per character for a natural typing speed
  };

  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    
    let preferredVoice;
    if (isTamil) {
      utterance.lang = 'ta-IN';
      // Prioritize high-quality cloud voices first
      preferredVoice = voices.find(v => v.name === 'Google தமிழ்' || v.name.includes('Google Tamil')) 
        || voices.find(v => v.lang.includes('ta') && v.name.includes('Google'))
        || voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil')) 
        || voices.find(v => v.lang.includes('hi')) 
        || voices.find(v => v.name.includes('Google')) 
        || voices[0];
    } else {
      utterance.lang = 'en-IN';
      preferredVoice = voices.find(v => v.name.includes('Google') || v.lang === 'en-IN') || voices[0];
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically resume listening if the session is still open
      if (isOpenRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error("Auto-resume failed:", e);
          }
        }, 300);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsListening(false);
    setIsSpeaking(false);
    clearInterval(typingTimerRef.current);
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="voice-assistant"
        onClick={toggleListen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
          color: '#fff',
          animation: isListening || isSpeaking ? `${pulseAnimation} 2s infinite` : 'none',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 12px 36px rgba(99, 102, 241, 0.6)',
          }
        }}
      >
        {isListening ? <IconMicrophone size={28} /> : isSpeaking ? <IconVolume size={28} /> : <IconMicrophone size={28} stroke={2.5} />}
      </Fab>

      <Fade in={isOpen}>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 320,
            minHeight: 200,
            zIndex: 1299,
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={800} display="flex" alignItems="center" gap={1}>
              <IconMicrophone size={20} /> Autonoma AI
            </Typography>
            <IconButton size="small" onClick={handleClose} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <IconX size={18} />
            </IconButton>
          </Box>

          {/* Body */}
          <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {isListening && (
              <Box display="flex" justifyContent="center" gap={0.5} mb={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ width: 4, height: 16, bgcolor: '#6366F1', borderRadius: 4, animation: `${waveAnimation} 1s infinite ease-in-out`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </Box>
            )}

            {!isListening && !isSpeaking && !transcript && (
              <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ fontStyle: 'italic' }}>
                Tap the microphone and say something...
              </Typography>
            )}

            {transcript && (
              <Box mb={2}>
                <Typography variant="caption" fontWeight={700} color="#6366F1">You:</Typography>
                <Typography variant="body2" sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', p: 1.5, borderRadius: '12px', borderTopLeftRadius: 0, mt: 0.5 }}>
                  {transcript}
                </Typography>
              </Box>
            )}

            {aiResponse && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="#A855F7">BOS(S):</Typography>
                <Typography variant="body2" sx={{ bgcolor: 'rgba(168, 85, 247, 0.08)', p: 1.5, borderRadius: '12px', borderTopLeftRadius: 0, mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {displayedAiResponse}
                </Typography>
              </Box>
            )}
            
            {isSpeaking && (
              <Box display="flex" justifyContent="center" gap={0.5} mt={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ width: 4, height: 16, bgcolor: '#A855F7', borderRadius: 4, animation: `${waveAnimation} 0.8s infinite ease-in-out`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
