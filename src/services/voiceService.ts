export type VoiceState = 'idle' | 'listening' | 'paused' | 'processing' | 'error';

export interface VoiceServiceCallbacks {
  onTranscript?: (transcript: string) => void;
  onInterim?: (interim: string) => void;
  onStateChange?: (state: VoiceState) => void;
  onError?: (error: string) => void;
  onAudioLevel?: (level: number) => void; // 0 to 1
}

class VoiceService {
  private recognition: any = null;
  private state: VoiceState = 'idle';
  private transcript = '';
  private interimTranscript = '';
  private callbacks: VoiceServiceCallbacks = {};
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.setState('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          this.transcript += final;
          this.callbacks.onTranscript?.(this.transcript.trim());
        }
        this.interimTranscript = interim;
        this.callbacks.onInterim?.(interim);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.callbacks.onError?.('Microphone access denied. Please grant permission in browser settings.');
        } else if (event.error === 'network') {
          this.callbacks.onError?.('Speech network error. You can still type or test sample input.');
        } else {
          this.callbacks.onError?.(`Speech recognition warning: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        if (this.state === 'listening') {
          // If stopped unexpectedly while still listening
          this.setState('idle');
        }
      };
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public setCallbacks(callbacks: VoiceServiceCallbacks) {
    this.callbacks = callbacks;
  }

  public async start(): Promise<void> {
    this.transcript = '';
    this.interimTranscript = '';

    // Start Audio analyser for realistic waveform animation
    try {
      await this.startAudioMeter();
    } catch (e) {
      console.log('Audio visualizer fallback to synth waves', e);
    }

    if (this.recognition) {
      try {
        this.recognition.start();
        this.setState('listening');
      } catch (err: any) {
        // Recognition might already be running
        console.warn('Recognition start caught:', err);
        this.setState('listening');
      }
    } else {
      // Speech recognition not natively supported, start visualizer and simulate listening state
      this.setState('listening');
      this.callbacks.onError?.('Speech recognition is not supported in this browser. You can type or use the "Try Sample Voice" demo.');
    }
  }

  public pause(): void {
    if (this.state === 'listening') {
      if (this.recognition) {
        try { this.recognition.stop(); } catch {}
      }
      this.setState('paused');
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      if (this.recognition) {
        try { this.recognition.start(); } catch {}
      }
      this.setState('listening');
    }
  }

  public stop(): string {
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }
    this.stopAudioMeter();
    this.setState('idle');
    const result = (this.transcript + ' ' + this.interimTranscript).trim();
    return result;
  }

  public cancel(): void {
    if (this.recognition) {
      try { this.recognition.abort(); } catch {}
    }
    this.stopAudioMeter();
    this.transcript = '';
    this.interimTranscript = '';
    this.setState('idle');
  }

  private setState(state: VoiceState) {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  private async startAudioMeter(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || this.state !== 'listening') return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 128); // 0 to 1
        this.callbacks.onAudioLevel?.(normalized);

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      // Permission denied or not available; fallback to synthetic fluctuation
      this.startSyntheticMeter();
    }
  }

  private startSyntheticMeter(): void {
    const loop = () => {
      if (this.state !== 'listening') return;
      const synthLevel = 0.2 + Math.random() * 0.7;
      this.callbacks.onAudioLevel?.(synthLevel);
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private stopAudioMeter(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
  }
}

export const voiceService = new VoiceService();

