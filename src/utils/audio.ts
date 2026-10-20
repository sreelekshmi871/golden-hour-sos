// Web Audio API synthesizer for CPR Metronome, emergency chimes, and Speech Synthesis

class EmergencyAudioEngine {
  private ctx: AudioContext | null = null;
  private metronomeInterval: any = null;
  public isMetronomeRunning = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play subtle, heartbeat-like thump sound effect (Web Audio API) for tactile haptic-like feedback
  playHeartbeatThump() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Dual-thump heartbeat simulation (lub - dub)
      const playThump = (startTime: number, startFreq: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Lowpass filter to simulate deep chest cavity acoustic resonance
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, startTime);
        filter.Q.setValueAtTime(3.5, startTime);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(38, startTime + duration);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      };

      // First beat: Lub (stronger, slightly higher pitch)
      playThump(now, 85, 0.13, 0.65);
      // Second beat: Dub (shorter, deeper)
      playThump(now + 0.14, 68, 0.16, 0.45);
    } catch (e) {
      console.warn('Heartbeat thump playback error:', e);
    }
  }

  // Play attention-grabbing ER dispatch chime
  playAlertChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25); // A6
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.5); // E6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  // Play single CPR click tone (110 BPM)
  playCprClick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('CPR click error:', e);
    }
  }

  // Start continuous CPR Metronome at 110 BPM (AHA guideline is 100-120 bpm)
  startCprMetronome(onBeat?: (count: number) => void) {
    if (this.isMetronomeRunning) return;
    this.isMetronomeRunning = true;
    let count = 0;
    const intervalMs = (60 / 110) * 1000; // ~545ms

    this.playCprClick();
    count++;
    if (onBeat) onBeat(count);

    this.metronomeInterval = setInterval(() => {
      this.playCprClick();
      count = (count % 30) + 1; // 30 compressions cycle
      if (onBeat) onBeat(count);
    }, intervalMs);
  }

  stopCprMetronome() {
    if (this.metronomeInterval) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    this.isMetronomeRunning = false;
  }

  // Text to speech for immediate bystander guidance
  speak(text: string, lang: 'en' | 'ta' = 'en') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior speeches

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ta') {
      const tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      const englishVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (englishVoice) utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
