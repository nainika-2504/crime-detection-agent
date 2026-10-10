/**
 * Web Audio API synthesized sound generator for vintage lamp interaction.
 * Zero external audio dependencies ensures 100% reliability and offline support.
 */

let audioCtx = null;
let soundEnabled = true;

export function toggleSound() {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext() {
  if (!soundEnabled) return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext not available or blocked:', err);
    return null;
  }
}

/**
 * Play authentic vintage glass bulb crack and light shatter sound
 */
export function playGlassCrackSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    // 1. Initial sharp impact 'snap'
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(3200, now);
    snapOsc.frequency.exponentialRampToValueAtTime(450, now + 0.08);

    snapGain.gain.setValueAtTime(0.28, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.1);

    // 2. High-frequency glass stress noise
    const bufferSize = ctx.sampleRate * 0.25;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(5400, now);
    noiseFilter.Q.setValueAtTime(4.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now + 0.01);

    // 3. Delicate glass shard scatter resonance
    const shardFreqs = [4200, 5800, 6900, 8100];
    shardFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.35);

      gain.gain.setValueAtTime(0.05 / (idx + 1), now + 0.08 + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.08 + idx * 0.03);
      osc.stop(now + 0.45);
    });

    // 4. Subtle deep metal lamp resonance
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(140, now);
    humOsc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    humGain.gain.setValueAtTime(0.18, now);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    humOsc.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + 0.5);

  } catch (e) {
    console.warn('Audio play error:', e);
  }
}
