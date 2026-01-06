// Sound utility for the app - Premium Synthesized Audio
class SoundManager {
    private enabled: boolean = true;
    private audioContext: AudioContext | null = null;

    private initContext() {
        if (typeof window === 'undefined') return null;
        if (!this.audioContext) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    async resume() {
        const ctx = this.initContext();
        if (!ctx) return false;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
        return ctx.state === 'running';
    }

    private createLayeredSound(params: {
        freqs: number[],
        type: OscillatorType,
        duration: number,
        volume: number,
        decay: number,
        attack?: number,
        delay?: number,
        noise?: boolean
    }) {
        const ctx = this.initContext();
        if (!ctx) return;

        if (ctx.state !== 'running') {
            ctx.resume(); // Try to resume if it was just created
        }

        const startTime = ctx.currentTime + (params.delay || 0);
        const attack = params.attack || 0.005;

        if (params.noise) {
            const bufferSize = ctx.sampleRate * params.duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, startTime);
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0, startTime);
            noiseGain.gain.linearRampToValueAtTime(params.volume, startTime + attack);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + params.duration);
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(startTime);
            noise.stop(startTime + params.duration);
        }

        params.freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = params.type;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(params.volume / params.freqs.length, startTime + attack);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + params.duration);
        });
    }

    async toggleAmbient(enable: boolean) {
        // Ambient feature disabled as per user request
    }

    // Enhanced sound profiles
    play(soundName: 'welcome' | 'send_first' | 'send_reply' | 'receive' | 'transition', mode: 'normal' | 'portal' = 'normal'): boolean {
        if (!this.enabled) return false;
        const ctx = this.initContext();
        if (!ctx) return false;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        try {
            if (mode === 'portal') {
                // PORTAL MODE: Abstract, Deep, Glassy
                switch (soundName) {
                    case 'welcome':
                        // Deep atmospheric swell
                        this.createLayeredSound({ freqs: [196, 261.63, 392], type: 'sine', duration: 2.5, volume: 0.25, decay: 2.0, attack: 0.8 });
                        this.createLayeredSound({ freqs: [98], type: 'triangle', duration: 3.0, volume: 0.12, decay: 2.5, attack: 0.8 });
                        break;
                    case 'send_first':
                        // FIRST SEND: "Portal Activation" - Airy, Glassy, Magical
                        // Replaced the heavy "thock" with a lighter, resonant "ping/warp"
                        this.createLayeredSound({ freqs: [523.25, 1046.5], type: 'sine', duration: 1.0, volume: 0.15, decay: 0.8, attack: 0.05 });
                        this.createLayeredSound({ freqs: [261.63], type: 'triangle', duration: 0.4, volume: 0.1, decay: 0.2, attack: 0.01 });
                        break;
                    case 'send_reply':
                        // REPLY CHAT: Softened water droplet
                        this.createLayeredSound({ freqs: [880], type: 'sine', duration: 0.1, volume: 0.12, decay: 0.05, attack: 0.005 });
                        break;
                    case 'receive':
                        // Ethereal glass ping
                        this.createLayeredSound({ freqs: [261.63, 392], type: 'sine', duration: 1.8, volume: 0.18, decay: 1.2, attack: 0.15 });
                        this.createLayeredSound({ freqs: [523.25], type: 'sine', duration: 1.5, volume: 0.08, decay: 1.0, delay: 0.15, attack: 0.2 });
                        break;
                    case 'transition':
                        // Deep soft click
                        this.createLayeredSound({ freqs: [130], type: 'sine', duration: 0.12, volume: 0.15, decay: 0.08, attack: 0.01 });
                        break;
                }
            } else {
                // NORMAL MODE: Sony Style (Premium, "Glassy", Precision)
                switch (soundName) {
                    case 'welcome':
                        // Sony Warm Startup: airy, rising chord
                        this.createLayeredSound({ freqs: [523.25, 659.25, 783.99], type: 'sine', duration: 1.2, volume: 0.12, decay: 0.9, attack: 0.1 });
                        this.createLayeredSound({ freqs: [1046.5], type: 'triangle', duration: 0.8, volume: 0.03, decay: 0.5, delay: 0.1 });
                        break;
                    case 'send_first':
                        // Precision "Click" (PS5 style navigation)
                        this.createLayeredSound({ freqs: [2000], type: 'sine', duration: 0.04, volume: 0.08, decay: 0.02, attack: 0.001 });
                        this.createLayeredSound({ freqs: [4000], type: 'square', duration: 0.01, volume: 0.02, decay: 0.01 });
                        break;
                    case 'send_reply':
                        // Quick fluid "blip"
                        this.createLayeredSound({ freqs: [1500], type: 'sine', duration: 0.05, volume: 0.06, decay: 0.02, attack: 0.001 });
                        break;
                    case 'receive':
                        // Pleasant notification (Soft, glassy double-tone)
                        this.createLayeredSound({ freqs: [1046.5], type: 'sine', duration: 0.6, volume: 0.1, decay: 0.4, attack: 0.01 });
                        this.createLayeredSound({ freqs: [1318.51], type: 'sine', duration: 0.4, volume: 0.05, decay: 0.3, delay: 0.08 });
                        break;
                    case 'transition':
                        // High-tech menu click
                        this.createLayeredSound({ freqs: [3000], type: 'sine', duration: 0.03, volume: 0.04, decay: 0.01, attack: 0.001 });
                        break;
                }
            }
            return ctx.state === 'running';
        } catch (e) {
            return false;
        }
    }

    playLegacy(soundName: string) {
        if (soundName === 'click' || soundName === 'hover' || soundName === 'copy' || soundName === 'portal') return;
        // @ts-expect-error: Legacy support
        this.play(soundName, 'normal');
    }
}

export const soundManager = new SoundManager();
