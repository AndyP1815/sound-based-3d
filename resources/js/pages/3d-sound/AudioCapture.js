export default class AudioCapture {
    constructor() {
        this.audioContext = null;
        this.stream = null;
        this.source = null;
        this.analyser = null;
        this.data = null;
    }

    async start() {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        const audioTracks = this.stream.getAudioTracks();

        if (audioTracks.length === 0) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;

            throw new Error('No audio track captured');
        }

        this.audioContext = new AudioContext();

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.source =
            this.audioContext.createMediaStreamSource(this.stream);

        this.analyser =
            this.audioContext.createAnalyser();

        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        this.source.connect(this.analyser);

        this.data = new Uint8Array(
            this.analyser.frequencyBinCount
        );
    }

    getFrequencyData() {
        if (!this.analyser || !this.data) {
            return null;
        }

        this.analyser.getByteFrequencyData(this.data);

        return this.data;
    }

    getAnalysis(barCount = 64) {
        const data = this.getFrequencyData();

        if (!data) {
            return {
                bass: 0,
                mid: 0,
                treble: 0,
                level: 0,
                bars: new Float32Array(barCount)
            };
        }

        const bassEnd = Math.floor(data.length * 0.01);
        const midEnd = Math.floor(data.length * 0.08);

        const average = (start, end) => {
            let sum = 0;
            for (let i = start; i < end; i++) {
                sum += data[i];
            }
            return sum / (end - start) / 255;
        };

        const bars = new Float32Array(barCount);
        const minBin = 2;
        const maxBin = Math.floor(data.length * 0.9);
        const logMin = Math.log(minBin);
        const logMax = Math.log(maxBin);

        for (let i = 0; i < barCount; i++) {
            const start = Math.floor(Math.exp(logMin + (i / barCount) * (logMax - logMin)));
            const end = Math.max(
                start + 1,
                Math.floor(Math.exp(logMin + ((i + 1) / barCount) * (logMax - logMin)))
            );
            bars[i] = Math.pow(average(start, Math.min(end, data.length)), 0.65);
        }

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }

        return {
            bass: average(1, Math.max(bassEnd, 2)),
            mid: average(bassEnd, midEnd),
            treble: average(midEnd, data.length),
            level: sum / data.length / 255,
            bars
        };
    }

    getAverageFrequency() {
        const data = this.getFrequencyData();

        if (!data) {
            return 0;
        }

        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }

        return sum / data.length / 255;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.stream = null;
        this.audioContext = null;
        this.source = null;
        this.analyser = null;
        this.data = null;
    }
}
