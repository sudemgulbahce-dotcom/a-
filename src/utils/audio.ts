// Interactive Web Audio API Synthesizer for Cute AI sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: "chirp" | "select" | "listen" | "thinking" | "talk" | "munch" | "slurp" | "sparkle" | "boing" | "disappoint") {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case "chirp": {
        // Happy retro double chirp (frequency goes up)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        osc.frequency.setValueAtTime(900, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.2);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case "select": {
        // High click sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "listen": {
        // Cute upward sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case "thinking": {
        // Low warm rhythmic pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.25);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case "talk": {
        // Rapid cute robotic squeak
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        
        const randomPitch = 500 + Math.random() * 400;
        osc.frequency.setValueAtTime(randomPitch, now);
        osc.frequency.setValueAtTime(randomPitch - 100, now + 0.04);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case "munch": {
        // Cute retro munching (two short low square notes)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(80, now + 0.05);
        osc.frequency.setValueAtTime(140, now + 0.1);
        osc.frequency.setValueAtTime(60, now + 0.15);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case "slurp": {
        // Wet liquid slurp transition
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      case "sparkle": {
        // Magical retro twinkle cascade
        const notes = [1000, 1300, 1600, 2000];
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.05;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(freq, t);
          o.frequency.exponentialRampToValueAtTime(freq + 400, t + 0.1);
          g.gain.setValueAtTime(0.04, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.12);
        });
        break;
      }

      case "boing": {
        // Tactile bounce sound for cheek petting
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.15);
        osc.frequency.linearRampToValueAtTime(350, now + 0.3);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case "disappoint": {
        // Whining sound (sad or losing energy)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.35);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  } catch (e) {
    // Fail silently if browser blocks AudioContext or doesn't support Web Audio
    console.warn("Audio feedback error:", e);
  }
}
