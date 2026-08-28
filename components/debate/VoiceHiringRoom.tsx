'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DebateMessage, AgentType } from '@/lib/validation/schemas';
import { 
  PERSONA_VOICE_CONFIGS, 
  resolveAgentVoice, 
  PersonaVoiceProfile 
} from '@/lib/voice/voice-config';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Headphones, 
  Radio,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  Square
} from 'lucide-react';

interface VoiceHiringRoomProps {
  messages: DebateMessage[];
}

export const VoiceHiringRoom: React.FC<VoiceHiringRoomProps> = ({ messages }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSupported, setTtsSupported] = useState(true);

  // References to prevent stale closure bugs in onend handlers
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef<number | null>(null);
  const playbackSpeedRef = useRef(1.0);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;
  currentIndexRef.current = activeMessageIndex;
  playbackSpeedRef.current = playbackSpeed;
  availableVoicesRef.current = availableVoices;

  // ── 1. Voice Population ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
          availableVoicesRef.current = voices;
        }
      } catch (e) {
        console.warn('Could not load speech synthesis voices:', e);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup: cancel all speech on unmount
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── 2. Sequential Speech Queue Engine ─────────────────────────────────────
  const playMessageAtIndex = useCallback((index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (index >= messages.length || index < 0) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveMessageIndex(null);
      isPlayingRef.current = false;
      return;
    }

    const msg = messages[index];
    const speaker = msg.speaker_agent_type;
    const config: PersonaVoiceProfile = PERSONA_VOICE_CONFIGS[speaker] || PERSONA_VOICE_CONFIGS.TECHNICAL;

    setActiveMessageIndex(index);
    currentIndexRef.current = index;
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(msg.content);
    utterance.rate = config.rate * playbackSpeedRef.current;
    utterance.pitch = config.pitch;

    // Resolve voice from available system voices
    const assignedVoice = resolveAgentVoice(speaker, availableVoicesRef.current);
    if (assignedVoice) {
      utterance.voice = assignedVoice;
    }

    utterance.onend = () => {
      // Check ref directly to avoid stale state closure
      if (isPlayingRef.current && !isPausedRef.current) {
        const nextIdx = index + 1;
        if (nextIdx < messages.length) {
          playMessageAtIndex(nextIdx);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setActiveMessageIndex(null);
          isPlayingRef.current = false;
        }
      }
    };

    utterance.onerror = (e) => {
      // If cancelled intentionally, do not reset
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e.error);
        setIsPlaying(false);
        setIsPaused(false);
        isPlayingRef.current = false;
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [messages]);

  // ── 3. Playback Controls ──────────────────────────────────────────────────
  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isPausedRef.current = false;
      isPlayingRef.current = true;
    } else {
      const startIndex = activeMessageIndex !== null ? activeMessageIndex : 0;
      playMessageAtIndex(startIndex);
    }
  };

  const handlePause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    isPausedRef.current = true;
    isPlayingRef.current = false;
  };

  const handleStop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveMessageIndex(null);
    isPlayingRef.current = false;
    isPausedRef.current = false;
  };

  const handleSkipNext = () => {
    const nextIdx = (activeMessageIndex !== null ? activeMessageIndex : -1) + 1;
    if (nextIdx < messages.length) {
      playMessageAtIndex(nextIdx);
    } else {
      handleStop();
    }
  };

  const handleSkipPrev = () => {
    const prevIdx = (activeMessageIndex !== null ? activeMessageIndex : 1) - 1;
    if (prevIdx >= 0) {
      playMessageAtIndex(prevIdx);
    } else {
      playMessageAtIndex(0);
    }
  };

  const handleJumpToConflict = () => {
    const conflictIdx = messages.findIndex(m => m.message_type === 'CHALLENGE' || m.message_type === 'REVISION');
    const targetIdx = conflictIdx >= 0 ? conflictIdx : 0;
    playMessageAtIndex(targetIdx);
  };

  // Current active message info
  const currentMessage = activeMessageIndex !== null ? messages[activeMessageIndex] : null;
  const currentSpeakerConfig = currentMessage
    ? (PERSONA_VOICE_CONFIGS[currentMessage.speaker_agent_type] || PERSONA_VOICE_CONFIGS.TECHNICAL)
    : null;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated border border-primary-500/30 shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-inner">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base text-white">Multi-Persona Voice Debate Room</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-primary-500/15 text-primary-300 font-semibold border border-primary-500/30">
                4 INDEPENDENT VOICES
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Listen to the structured debate with dedicated persona audio models (Technical, HR, Manager, Skeptic).
            </p>
          </div>
        </div>

        {/* Master Audio Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleJumpToConflict}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-surface-elevated hover:bg-gray-700 text-gray-200 border border-surface-border flex items-center gap-1.5 transition-colors"
            title="Jump to first adversarial cross-examination"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Jump to Conflict
          </button>

          {/* Speed selector */}
          <button
            type="button"
            onClick={() => {
              const speeds = [1.0, 1.25, 1.5, 0.85];
              const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(next);
            }}
            className="px-3 py-2 text-xs font-mono font-bold rounded-xl bg-surface-elevated text-gray-300 border border-surface-border hover:text-white transition-colors"
            title="Toggle playback speed"
          >
            {playbackSpeed}x
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={handleSkipPrev}
            disabled={activeMessageIndex === null || activeMessageIndex <= 0}
            className="p-2 text-gray-300 hover:text-white rounded-xl bg-surface-elevated border border-surface-border disabled:opacity-40 transition-colors"
            title="Previous turn"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          {isPlaying ? (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              {isPaused ? 'Resume' : activeMessageIndex !== null ? 'Continue' : 'Play Debate'}
            </button>
          )}

          {/* Next */}
          <button
            type="button"
            onClick={handleSkipNext}
            disabled={activeMessageIndex !== null && activeMessageIndex >= messages.length - 1}
            className="p-2 text-gray-300 hover:text-white rounded-xl bg-surface-elevated border border-surface-border disabled:opacity-40 transition-colors"
            title="Skip to next turn"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Stop */}
          <button
            type="button"
            onClick={handleStop}
            className="p-2 text-gray-400 hover:text-rose-400 rounded-xl hover:bg-surface-elevated transition-colors"
            title="Stop & Reset Audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Speaker Banner */}
      {currentMessage && currentSpeakerConfig && isPlaying && (
        <div className={`p-4 rounded-xl border ${currentSpeakerConfig.badgeBg} ${currentSpeakerConfig.badgeBorder} flex items-center justify-between gap-4 animate-in fade-in`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className={`text-xs font-bold font-mono ${currentSpeakerConfig.textColor}`}>
                {currentSpeakerConfig.title.toUpperCase()} ● SPEAKING
              </span>
            </div>
            <span className="text-xs text-gray-300 hidden md:inline">
              Turn {activeMessageIndex! + 1} of {messages.length} ({currentMessage.message_type})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">
              Target: <strong className="text-white">{currentMessage.target_agent_type || 'PANEL'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 4 Persona Voice Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {(['TECHNICAL', 'HR_CULTURE', 'HIRING_MANAGER', 'SKEPTIC'] as AgentType[]).map((agent) => {
          const config = PERSONA_VOICE_CONFIGS[agent];
          const isCurrentSpeaker = activeMessageIndex !== null && messages[activeMessageIndex]?.speaker_agent_type === agent;

          return (
            <div
              key={agent}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrentSpeaker && isPlaying
                  ? `${config.badgeBg} ${config.badgeBorder} text-white shadow-lg shadow-primary-500/10 scale-[1.02]`
                  : 'bg-black/30 border-surface-border text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className={`font-bold ${isCurrentSpeaker && isPlaying ? config.textColor : 'text-gray-300'}`}>
                  {config.shortName}
                </span>
                {isCurrentSpeaker && isPlaying && (
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] truncate">
                {isCurrentSpeaker && isPlaying ? (
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    ● Speaking now...
                  </span>
                ) : (
                  <span className="text-gray-500">{config.description}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fallback Notice if TTS is unavailable */}
      {!ttsSupported && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Speech Synthesis is unavailable in this browser environment. The interactive text transcript below remains 100% functional.</span>
        </div>
      )}
    </div>
  );
};
