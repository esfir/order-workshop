export const soundFiles = ['ui_click', 'item_select', 'duplicate', 'slot_fill', 'order_complete', 'reward', 'wrong_item', 'nothing_selected', 'hint', 'finish', 'background_loop'] as const;
export type Sound = typeof soundFiles[number];
class GameAudio {
  enabled = true;
  musicEnabled = false;
  private context?: AudioContext;
  private music?: HTMLAudioElement;
  private clips = new Set<HTMLAudioElement>();
  unlock() { this.context ??= new AudioContext(); void this.context.resume(); }
  play(name: Sound) {
    if (!this.enabled) return;
    const clip = new Audio(`${import.meta.env.BASE_URL}assets/audio/${name}.mp3`);
    clip.volume = .55;
    this.clips.add(clip);
    clip.onended = () => this.clips.delete(clip);
    void clip.play().catch(() => { this.clips.delete(clip); this.synthesize(name); });
  }
  private synthesize(name: Sound) {
    if (!this.enabled) return;
    this.unlock();
    const ctx = this.context!;
    const notes = name === 'finish' ? [523,659,784,1047] : name === 'order_complete' ? [523,659,784] : name === 'duplicate' ? [660,880] : name === 'wrong_item' || name === 'nothing_selected' ? [330,294] : [640];
    notes.forEach((freq, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination); const t = ctx.currentTime + i * .095; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.09,t+.01); g.gain.exponentialRampToValueAtTime(.001,t+.2); o.start(t); o.stop(t+.22); });
  }
  setMusic(value: boolean) { this.musicEnabled = value; this.music ??= new Audio(`${import.meta.env.BASE_URL}assets/audio/background_loop.mp3`); this.music.loop = true; this.music.volume = .12; if (value && this.enabled) void this.music.play().catch(() => {}); else this.music.pause(); }
  mute(value: boolean) { this.enabled = !value; if (value) { this.clips.forEach(c => c.pause()); this.clips.clear(); } this.setMusic(this.musicEnabled); }
}
export const audio = new GameAudio();
