// Subtle UI sounds for the chatbot, synthesized with the Web Audio API so
// no audio files need to be shipped. The AudioContext is created lazily on
// the first user-gesture-triggered play (browsers block audio before that),
// and the mute preference is persisted in localStorage.

const ENABLED_KEY = "optigobot-sound-enabled";

let ctx = null;

const getContext = () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

export const isSoundEnabled = () => {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ENABLED_KEY) !== "off";
  } catch {
    return true;
  }
};

export const setSoundEnabled = (enabled) => {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? "on" : "off");
  } catch {
    // storage unavailable (private mode) — session-only preference
  }
};

// One enveloped oscillator note. `glideTo` optionally bends the pitch for a
// short whoosh/pop feel.
const note = (freq, { type = "sine", delay = 0, dur = 0.12, peak = 0.08, glideTo = null } = {}) => {
  const ac = getContext();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

const play = (fn) => {
  if (!isSoundEnabled()) return;
  try {
    fn();
  } catch {
    // audio must never break the chat
  }
};

// Quick rising pop when the user sends a message.
export const playSend = () =>
  play(() => note(480, { dur: 0.1, peak: 0.06, glideTo: 720 }));

// Gentle two-note chime when a response lands.
export const playReceive = () =>
  play(() => {
    note(660, { dur: 0.12, peak: 0.07 });
    note(880, { delay: 0.1, dur: 0.16, peak: 0.07 });
  });

// Low muted blip for errors.
export const playError = () =>
  play(() => note(240, { type: "triangle", dur: 0.16, peak: 0.08 }));
