import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { voiceService, VoiceState } from '../services/voiceService';
import { aiService } from '../services/aiService';
import { AudioWaveform } from './AudioWaveform';
import { DecompositionResult } from '../types';

interface VoiceRecorderProps {
  onDecomposedReady: (result: DecompositionResult) => void;
  onToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onDecomposedReady,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'image'>('voice');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Text input mode
  const [textContent, setTextContent] = useState('');

  // Image mode
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageNote, setImageNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Processing animation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (voiceState === 'listening') {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [voiceState]);

  // Voice service listener
  useEffect(() => {
    voiceService.setCallbacks({
      onTranscript: (txt) => setTranscript(txt),
      onInterim: (intr) => setInterim(intr),
      onStateChange: (st) => setVoiceState(st),
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onError: (err) => onToast(err, 'warning')
    });
  }, [onToast]);

  const handleStartRecording = async () => {
    setTimerSeconds(0);
    setTranscript('');
    setInterim('');
    await voiceService.start();
  };

  const handlePauseRecording = () => {
    voiceService.pause();
  };

  const handleResumeRecording = () => {
    voiceService.resume();
  };

  const handleStopRecording = async () => {
    const finalTxt = voiceService.stop();
    const fullText = (finalTxt || transcript || interim).trim();

    if (!fullText) {
      onToast('No speech detected. Try speaking or using sample input.', 'info');
      return;
    }

    processInput(fullText);
  };

  const processInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await aiService.processRawTranscript(text, (status) => {
        setProcessingStatus(status);
      });
      setIsProcessing(false);
      onDecomposedReady(result);
    } catch (e) {
      setIsProcessing(false);
      onToast('Failed to decompose memory. Please try again.', 'error');
    }
  };

  // Sample prompt test helper for 1-click testing
  const handleLoadSamplePrompt = () => {
    const sample = "I met Rahul today. He told me about a business opportunity. I should discuss it with him next Friday. I also got an idea to build a food delivery application.";
    setTranscript(sample);
    if (activeTab === 'text') {
      setTextContent(sample);
    }
    onToast('Sample voice input loaded! Click "Process with SAM" or review below.', 'info');
  };

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      onToast('Please enter your thoughts before submitting.', 'warning');
      return;
    }
    processInput(textContent);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = () => {
    if (!imagePreview) {
      onToast('Please select an image first.', 'warning');
      return;
    }
    const note = imageNote.trim() || 'Visual memory captured with SAM.';
    // Send to processing
    processInput(note + ' (Visual memory attached)');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-sam-card/90 to-sam-surface/90 border border-purple-500/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sam-purple/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sam-blue/15 rounded-full blur-3xl pointer-events-none" />

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-30 bg-sam-bg/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-sam-purple/30 border-t-sam-blue animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-sam-highlight animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-sam-text mb-2 animate-pulse">
            {processingStatus || 'Analyzing your thoughts...'}
          </h3>
          <p className="text-sm text-sam-muted max-w-sm">
            SAM is deconstructing, organizing, and linking your memories without losing any nuances.
          </p>
        </div>
      )}

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sam-purple/10 border border-sam-purple/30 text-sam-highlight text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Capture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sam-text tracking-tight">
            Capture Anything
          </h2>
          <p className="text-sm text-sam-muted mt-1">
            Speak or type naturally. SAM understands, categorizes, and organizes automatically.
          </p>
        </div>

        {/* Input Mode Pills */}
        <div className="flex items-center p-1 rounded-xl bg-sam-bg/80 border border-sam-purple/20 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-sam-purple to-sam-blue text-white shadow-glow-purple'
                : 'text-sam-muted hover:text-sam-text'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-sam-purple to-sam-blue text-white shadow-glow-purple'
                : 'text-sam-muted hover:text-sam-text'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Note</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-sam-purple to-sam-blue text-white shadow-glow-purple'
                : 'text-sam-muted hover:text-sam-text'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VOICE CAPTURE */}
      {activeTab === 'voice' && (
        <div className="flex flex-col items-center justify-center py-4">
          {/* Animated Central Glowing Mic Button */}
          <div className="relative mb-6">
            {voiceState === 'listening' && (
              <>
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-sam-purple via-sam-blue to-sam-cyan opacity-40 blur-lg animate-ping" />
                <div className="absolute -inset-2 rounded-full border-2 border-sam-blue/60 animate-pulse" />
              </>
            )}

            <button
              onClick={voiceState === 'listening' ? handleStopRecording : handleStartRecording}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                voiceState === 'listening'
                  ? 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-glow-purple scale-105'
                  : 'bg-gradient-to-tr from-sam-purple via-sam-blue to-sam-cyan shadow-glow-purple hover:scale-105'
              }`}
            >
              {voiceState === 'listening' ? (
                <Square className="w-10 h-10 text-white fill-white" />
              ) : (
                <Mic className="w-10 h-10 text-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Recording Status & Timer */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-wider">
              {voiceState === 'listening' ? (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  RECORDING {formatTimer(timerSeconds)}
                </span>
              ) : voiceState === 'paused' ? (
                <span className="text-amber-400">PAUSED {formatTimer(timerSeconds)}</span>
              ) : (
                <span className="text-sam-muted">CLICK TO SPEAK FREELY</span>
              )}
            </div>

            <p className="text-xs text-sam-muted mt-1">
              {voiceState === 'listening'
                ? 'Speak in any language or order. Say names, promises, or ideas.'
                : 'No manual categorization needed. SAM figures it out.'}
            </p>
          </div>

          {/* Audio Waveform Visualizer */}
          <AudioWaveform
            isRecording={voiceState === 'listening'}
            isPaused={voiceState === 'paused'}
            audioLevel={audioLevel}
          />

          {/* Controls: Pause, Resume, Process */}
          <div className="flex items-center gap-3 mt-4">
            {voiceState === 'listening' && (
              <button
                onClick={handlePauseRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sam-surface border border-sam-purple/30 text-xs font-medium text-sam-text hover:bg-sam-card transition"
              >
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pause</span>
              </button>
            )}

            {voiceState === 'paused' && (
              <button
                onClick={handleResumeRecording}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sam-surface border border-sam-purple/30 text-xs font-medium text-sam-text hover:bg-sam-card transition"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Resume</span>
              </button>
            )}

            {(voiceState === 'listening' || voiceState === 'paused' || transcript) && (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish & Organize</span>
              </button>
            )}
          </div>

          {/* Live Transcript Display Box */}
          {(transcript || interim) && (
            <div className="w-full mt-6 p-4 rounded-xl bg-sam-bg/70 border border-sam-purple/20 text-left">
              <div className="flex items-center justify-between text-xs text-sam-muted mb-1.5">
                <span className="font-semibold text-sam-highlight">Live Transcription</span>
                <span className="text-[10px] uppercase font-mono">Real-time Stream</span>
              </div>
              <p className="text-sm text-sam-text leading-relaxed">
                {transcript}
                <span className="text-sam-muted italic ml-1">{interim}</span>
              </p>
            </div>
          )}

          {/* Quick 1-Click Example Test Button */}
          <div className="w-full mt-6 pt-4 border-t border-sam-purple/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-sam-muted flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Test the master example (Rahul & Food App):</span>
            </span>
            <button
              onClick={handleLoadSamplePrompt}
              className="px-3.5 py-1.5 rounded-lg bg-sam-purple/10 hover:bg-sam-purple/20 border border-sam-purple/30 text-sam-highlight font-medium transition flex items-center gap-1.5"
            >
              <span>Load Master Voice Example</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TEXT NOTE */}
      {activeTab === 'text' && (
        <div className="flex flex-col gap-4 py-2">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Type anything on your mind... E.g. 'I met Rahul today. He told me about a business opportunity. I should discuss it with him next Friday. I also got an idea to build a food delivery application.'"
            rows={5}
            className="w-full p-4 rounded-xl bg-sam-bg/80 border border-sam-purple/20 text-sam-text placeholder-sam-muted/60 text-sm focus:outline-none focus:border-sam-purple/60 focus:ring-1 focus:ring-sam-purple/50 resize-none transition"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleLoadSamplePrompt}
              className="text-xs text-sam-highlight hover:underline flex items-center gap-1"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Insert master example prompt</span>
            </button>

            <button
              onClick={handleTextSubmit}
              disabled={!textContent.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 disabled:opacity-40 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Process with SAM</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: IMAGE MEMORY */}
      {activeTab === 'image' && (
        <div className="flex flex-col gap-4 py-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-xl border-2 border-dashed border-sam-purple/30 hover:border-sam-purple/60 bg-sam-bg/40 flex flex-col items-center justify-center cursor-pointer transition p-4 text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-sam-purple/10 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Upload className="w-6 h-6 text-sam-highlight" />
              </div>
              <p className="text-sm font-semibold text-sam-text">
                Upload image, receipt, ticket, whiteboard or memorable photo
              </p>
              <p className="text-xs text-sam-muted mt-1">PNG, JPG, WebP up to 10MB</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-44 h-32 rounded-xl overflow-hidden border border-sam-purple/30 shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-rose-500/80 text-[10px] text-white hover:bg-rose-600"
                >
                  Change
                </button>
              </div>

              <div className="w-full">
                <label className="text-xs font-medium text-sam-muted block mb-1">
                  Add context / notes about this photo:
                </label>
                <textarea
                  value={imageNote}
                  onChange={(e) => setImageNote(e.target.value)}
                  placeholder="What should SAM remember about this picture?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-sam-bg/80 border border-sam-purple/20 text-sam-text text-xs focus:outline-none focus:border-sam-purple/60"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button
              onClick={handleImageSubmit}
              disabled={!imagePreview}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sam-purple to-sam-blue text-white text-xs font-bold shadow-glow-purple hover:opacity-95 disabled:opacity-40 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Organize Image Memory</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

