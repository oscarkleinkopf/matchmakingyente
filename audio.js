/**
 * Shidej Telephony & Soundscape Engine
 * Procedural Audio Synthesis via Web Audio API + SpeechSynthesis
 */
class ShidejAudio {
  constructor() {
    this.audioCtx = null;
    this.staticNoiseSource = null;
    this.staticNoiseGain = null;
    this.lineHumOscillator = null;
    this.lineHumGain = null;
    
    // Telephone filter chain (For procedural SFX)
    this.phoneFilter = null;
    this.nasalPeaking = null;
    this.masterGain = null;

    // Active SFX nodes
    this.activeOscillators = [];
    this.ringInterval = null;
    this.busyInterval = null;
    
    this.soundEnabled = false;
  }

  /**
   * Initialize Web Audio API context after user interaction
   */
  async init() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      // 1. Create master gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // 2. Create telephone line bandpass filter (300Hz to 3400Hz)
      this.phoneFilter = this.audioCtx.createBiquadFilter();
      this.phoneFilter.type = 'bandpass';
      this.phoneFilter.frequency.setValueAtTime(1500, this.audioCtx.currentTime);
      this.phoneFilter.Q.setValueAtTime(0.85); // Narrow frequency band

      // 3. Create peaking filter for vintage nasal resonance (around 1000Hz)
      this.nasalPeaking = this.audioCtx.createBiquadFilter();
      this.nasalPeaking.type = 'peaking';
      this.nasalPeaking.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
      this.nasalPeaking.Q.setValueAtTime(1.5);
      this.nasalPeaking.gain.setValueAtTime(5, this.audioCtx.currentTime);

      // Connect filter chain: Input -> Bandpass -> Peaking -> Master Gain
      this.phoneFilter.connect(this.nasalPeaking);
      this.nasalPeaking.connect(this.masterGain);

      // 4. Set up continuous background line static/hiss
      this.setupLineStatic();

      this.soundEnabled = true;
      console.log("Shidej Audio Engine Initialized Successfully.");
    } catch (e) {
      console.error("Failed to initialize Web Audio API:", e);
    }
  }

  /**
   * Procedural White Noise Generator for vintage telephone line hiss/static
   */
  setupLineStatic() {
    if (!this.audioCtx) return;

    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.staticNoiseSource = this.audioCtx.createBufferSource();
    this.staticNoiseSource.buffer = noiseBuffer;
    this.staticNoiseSource.loop = true;

    // Static volume gain (very quiet, background crackle)
    this.staticNoiseGain = this.audioCtx.createGain();
    this.staticNoiseGain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);

    // Grid hum (60Hz electrical hum to give warm analog depth)
    this.lineHumOscillator = this.audioCtx.createOscillator();
    this.lineHumOscillator.type = 'sine';
    this.lineHumOscillator.frequency.setValueAtTime(60, this.audioCtx.currentTime);

    this.lineHumGain = this.audioCtx.createGain();
    this.lineHumGain.gain.setValueAtTime(0.005, this.audioCtx.currentTime);

    // Route static and hum through telephone filter to sound in-line!
    this.staticNoiseSource.connect(this.staticNoiseGain);
    this.staticNoiseGain.connect(this.phoneFilter);

    this.lineHumOscillator.connect(this.lineHumGain);
    this.lineHumGain.connect(this.phoneFilter);

    // Start static noise and hum
    this.staticNoiseSource.start(0);
    this.lineHumOscillator.start(0);

    // Keep it muted initially until call starts
    this.staticNoiseGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.lineHumGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
  }

  /**
   * Turn telephone line static hum ON or OFF
   */
  setLineStaticActive(active) {
    if (!this.soundEnabled || !this.staticNoiseGain) return;
    const targetStatic = active ? 0.025 : 0;
    const targetHum = active ? 0.008 : 0;
    
    this.staticNoiseGain.gain.setTargetAtTime(targetStatic, this.audioCtx.currentTime, 0.1);
    this.lineHumGain.gain.setTargetAtTime(targetHum, this.audioCtx.currentTime, 0.1);
  }

  /**
   * Generate static scratch pops (crackles) when phone lines pick up or disconnect
   */
  playLineCrackle() {
    if (!this.soundEnabled) return;
    
    const now = this.audioCtx.currentTime;
    const crackleCount = Math.floor(Math.random() * 4) + 3;
    
    for (let i = 0; i < crackleCount; i++) {
      const triggerTime = now + (i * 0.08) + (Math.random() * 0.05);
      
      const clickOsc = this.audioCtx.createOscillator();
      const clickGain = this.audioCtx.createGain();
      
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(100 + Math.random() * 300, triggerTime);
      
      clickGain.gain.setValueAtTime(0, triggerTime);
      clickGain.gain.linearRampToValueAtTime(0.08, triggerTime + 0.002);
      clickGain.gain.exponentialRampToValueAtTime(0.001, triggerTime + 0.02);
      
      clickOsc.connect(clickGain);
      clickGain.connect(this.phoneFilter);
      
      clickOsc.start(triggerTime);
      clickOsc.stop(triggerTime + 0.03);
    }
  }

  /**
   * Play continuous 1930s dial tone (combined 350Hz + 440Hz hum)
   */
  playDialTone() {
    if (!this.soundEnabled) return;
    this.stopAllActiveSFX();

    console.log("Playing Dial Tone...");
    const now = this.audioCtx.currentTime;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const dialGain = this.audioCtx.createGain();

    osc1.frequency.setValueAtTime(350, now);
    osc2.frequency.setValueAtTime(440, now);
    dialGain.gain.setValueAtTime(0.06, now);

    osc1.connect(dialGain);
    osc2.connect(dialGain);
    
    // Run dial tone through the telephone line bandpass
    dialGain.connect(this.phoneFilter);

    osc1.start(now);
    osc2.start(now);

    this.activeOscillators.push(osc1, osc2, dialGain);
  }

  stopDialTone() {
    this.stopAllActiveSFX();
  }

  /**
   * Play vintage telephone bell ring procedurally
   * Vintage double-bell ringing cadence: 2s ring, 4s silent
   */
  playRingTone(callback) {
    if (!this.soundEnabled) return;
    this.stopAllActiveSFX();
    
    console.log("Playing Bell Ringing Tone...");
    
    const triggerRing = () => {
      if (!this.audioCtx) return;
      
      const now = this.audioCtx.currentTime;
      const duration = 1.8; // Ring duration
      
      // Dual high-frequency bells (combining 853Hz and 960Hz)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const ringGain = this.audioCtx.createGain();
      
      osc1.frequency.setValueAtTime(853, now);
      osc2.frequency.setValueAtTime(960, now);
      
      // Wobble LFO at 20Hz to simulate the physical metal striker hitting the bells
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(22, now);
      lfoGain.gain.setValueAtTime(0.3, now);
      
      // Connect LFO to ring volume modulation
      lfo.connect(lfoGain);
      lfoGain.connect(ringGain.gain);
      
      ringGain.gain.setValueAtTime(0.04, now);
      
      // Fade out ringing bell slowly
      ringGain.gain.setValueAtTime(0.04, now + duration - 0.3);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc1.connect(ringGain);
      osc2.connect(ringGain);
      ringGain.connect(this.masterGain); // Ringing bypasses phone line filter, sounds in the room!
      
      osc1.start(now);
      osc2.start(now);
      lfo.start(now);
      
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      lfo.stop(now + duration);
      
      if (callback) {
        callback();
      }
    };

    // Run immediately then loop every 5.5 seconds
    triggerRing();
    this.ringInterval = setInterval(triggerRing, 5500);
  }

  stopRingTone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    this.stopAllActiveSFX();
  }

  /**
   * Play continuous busy tone (480Hz + 620Hz pulsing at 2Hz)
   */
  playBusyTone() {
    if (!this.soundEnabled) return;
    this.stopAllActiveSFX();

    const triggerBusyPulse = () => {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const pulseDuration = 0.25;

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const busyGain = this.audioCtx.createGain();

      osc1.frequency.setValueAtTime(480, now);
      osc2.frequency.setValueAtTime(620, now);
      busyGain.gain.setValueAtTime(0.06, now);
      
      busyGain.gain.setValueAtTime(0.06, now + pulseDuration - 0.05);
      busyGain.gain.exponentialRampToValueAtTime(0.0001, now + pulseDuration);

      osc1.connect(busyGain);
      osc2.connect(busyGain);
      busyGain.connect(this.phoneFilter);

      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + pulseDuration);
      osc2.stop(now + pulseDuration);
    };

    triggerBusyPulse();
    this.busyInterval = setInterval(triggerBusyPulse, 500);
  }

  stopBusyTone() {
    if (this.busyInterval) {
      clearInterval(this.busyInterval);
      this.busyInterval = null;
    }
    this.stopAllActiveSFX();
  }

  /**
   * Play rotary dial mechanics
   * isWindUp = true: when user drags the dial wheel (single ratchet sound)
   * isWindUp = false: when wheel is released and ticks back (rapid ratchets proportional to count)
   */
  playMechanicalClick(isWindUp, clicksCount = 1) {
    if (!this.soundEnabled) return;

    const now = this.audioCtx.currentTime;
    
    if (isWindUp) {
      // Single dry click of spring winding
      this.synthMechanicalTick(now);
    } else {
      // Rapid ticks (return wheel clicks)
      for (let i = 0; i < clicksCount; i++) {
        const tickTime = now + (i * 0.065);
        this.synthMechanicalTick(tickTime);
      }
    }
  }

  /**
   * Procedural synthesizer for a single mechanical metallic ratchet tick
   */
  synthMechanicalTick(time) {
    // 1. High frequency brief chime
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2500 + Math.random() * 1000, time);
    
    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.02);

    // 2. Low woody thud
    const thudOsc = this.audioCtx.createOscillator();
    const thudGain = this.audioCtx.createGain();
    
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(150 + Math.random() * 50, time);
    
    thudGain.gain.setValueAtTime(0.05, time);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);
    
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    
    thudOsc.start(time);
    thudOsc.stop(time + 0.03);
  }

  /**
   * Play heavy physical slamming receiver sound
   */
  playReceiverSlam() {
    if (!this.soundEnabled) return;
    this.stopAllActiveSFX();

    const now = this.audioCtx.currentTime;

    // Synthesize physical slam with noise burst & low frequencies
    const bufferSize = 0.3 * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, now);

    const slamGain = this.audioCtx.createGain();
    slamGain.gain.setValueAtTime(0.3, now);
    slamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(noiseFilter);
    noiseFilter.connect(slamGain);
    slamGain.connect(this.masterGain);

    // Add metallic clink
    const clink = this.audioCtx.createOscillator();
    const clinkGain = this.audioCtx.createGain();
    clink.frequency.setValueAtTime(1800, now);
    clinkGain.gain.setValueAtTime(0.08, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    clink.connect(clinkGain);
    clinkGain.connect(this.masterGain);

    noise.start(now);
    clink.start(now);
    clink.stop(now + 0.2);
  }

  /**
   * SpeechSynthesis voice speaker
   */
  speakVoice(text, isFather, onStartCallback, onEndCallback) {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported by this browser.");
      if (onStartCallback) onStartCallback();
      setTimeout(() => { if (onEndCallback) onEndCallback(); }, 3000);
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';

    // Fetch available voices
    let voices = window.speechSynthesis.getVoices();

    const selectVoice = () => {
      voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (isFather) {
        // Look for Spanish male voices (deep, threatening)
        selectedVoice = voices.find(v => v.lang.includes('es') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pedro') || v.name.toLowerCase().includes('julio') || v.name.toLowerCase().includes('enrique') || v.name.toLowerCase().includes('microsoft helena') === false));
      } else {
        // Look for Spanish female voices (sweet, whispered)
        selectedVoice = voices.find(v => v.lang.includes('es') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('sabela') || v.name.toLowerCase().includes('laura')));
      }

      // Fallback: any Spanish voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('es'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`Speech selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      }
    };

    selectVoice();

    // If voices aren't loaded yet, try again when they change
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        selectVoice();
      };
    }

    if (isFather) {
      utterance.pitch = 0.55; // Menacing deep pitch
      utterance.rate = 0.85;  // Intimidating, slow warning speed
      utterance.volume = 1.0;
    } else {
      utterance.pitch = 1.15; // Sweet, soft pitch
      utterance.rate = 0.95;  // Careful whispering speed
      utterance.volume = 0.8;
    }

    utterance.onstart = () => {
      // Active background telephone grid static noise and crackles when speaking!
      this.setLineStaticActive(true);
      this.playLineCrackle();
      if (onStartCallback) onStartCallback();
    };

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopAllActiveSFX() {
    this.activeOscillators.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  stopVoice() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.setLineStaticActive(false);
  }
}

// Export a single instance to be used by app.js
window.shidejAudio = new ShidejAudio();
