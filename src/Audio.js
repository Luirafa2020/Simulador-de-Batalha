export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Keep it not too loud
        this.masterGain.connect(this.ctx.destination);

        this.enabled = false;

        // Enable audio on first interaction
        window.addEventListener('click', () => {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.enabled = true;
        }, { once: true });
    }

    playTone(freq, type, duration, startTime = 0) {
        if (!this.enabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playNoise(duration) {
        if (!this.enabled) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }

    playAttack() {
        // "Whoosh"
        this.playTone(400, 'triangle', 0.1);
        this.playTone(300, 'triangle', 0.1, 0.05);
    }

    playHit() {
        // "Crunch"
        this.playNoise(0.1);
        this.playTone(100, 'sawtooth', 0.1);
    }

    playDeath() {
        // "Bweoop"
        this.playTone(200, 'square', 0.1);
        this.playTone(150, 'square', 0.1, 0.1);
        this.playTone(100, 'square', 0.2, 0.2);
    }

    playSpawn() {
        this.playTone(400, 'sine', 0.1);
        this.playTone(600, 'sine', 0.1, 0.1);
        this.playTone(800, 'sine', 0.2, 0.2);
    }
}
