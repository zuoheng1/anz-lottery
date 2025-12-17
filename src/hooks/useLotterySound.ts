import { useRef, useEffect, useCallback } from 'react';

export const useLotterySound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmOscillatorsRef = useRef<OscillatorNode[]>([]);
  const bgmGainRef = useRef<GainNode | null>(null);
  const isBgmPlayingRef = useRef(false);

  useEffect(() => {
    // Initialize AudioContext
    // @ts-expect-error - webkitAudioContext is not in standard types but needed for Safari
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
    }
    
    return () => {
      stopBGM();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playBGM = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || isBgmPlayingRef.current) return;

    try {
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Simple Ambient Drone BGM
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.1;
        masterGain.connect(ctx.destination);
        bgmGainRef.current = masterGain;

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = 110; // A2
        osc1.connect(masterGain);
        osc1.start();

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 112; // Detuned slightly
        osc2.connect(masterGain);
        osc2.start();
        
        // Rhythmic LFO for texture
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; // 2Hz
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 50;
        lfo.connect(lfoGain);
        lfoGain.connect(osc2.frequency);
        lfo.start();

        bgmOscillatorsRef.current = [osc1, osc2, lfo];
        isBgmPlayingRef.current = true;
    } catch {
        console.error("Failed to play synthesized BGM");
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmOscillatorsRef.current.length > 0) {
      bgmOscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch { /* ignore */ }
      });
      bgmOscillatorsRef.current = [];
    }
    if (bgmGainRef.current) {
        bgmGainRef.current.disconnect();
        bgmGainRef.current = null;
    }
    isBgmPlayingRef.current = false;
  }, []);

  // Procedural "Tech" Spin Sound (Digital Ticking)
  const playSpinSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }

    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // High pitched digital blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch {
        // ignore
    }
  }, []);

  // Procedural "Win" Sound (Success Chord)
  const playWinSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }

    try {
        // 1. Impact Sound (Kick/Thud)
        const oscLow = ctx.createOscillator();
        const gainLow = ctx.createGain();
        oscLow.connect(gainLow);
        gainLow.connect(ctx.destination);
        
        oscLow.type = 'sine';
        oscLow.frequency.setValueAtTime(150, ctx.currentTime);
        oscLow.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
        
        gainLow.gain.setValueAtTime(0.3, ctx.currentTime);
        gainLow.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscLow.start();
        oscLow.stop(ctx.currentTime + 0.5);

        // 2. High Sparkle (Ding!)
        const playNote = (freq: number, delay: number, type: OscillatorType = 'sine', duration: number = 1.0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
        };

        // Quick Success Chime
        playNote(523.25, 0, 'sine', 0.8); // C5
        playNote(659.25, 0.1, 'sine', 0.8); // E5
        playNote(783.99, 0.2, 'sine', 1.2); // G5
        playNote(1046.50, 0.3, 'sine', 1.5); // C6
    } catch {
        // ignore
    }
  }, []);

  const playCardFlipSound = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.05;
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      noise.start();
      osc.start();
      noise.stop(ctx.currentTime + 0.06);
      osc.stop(ctx.currentTime + 0.16);
    } catch { void 0; }
  }, []);

  return { playBGM, stopBGM, playSpinSound, playWinSound, playCardFlipSound };
};
