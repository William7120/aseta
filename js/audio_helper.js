/**
 * ====================================================================
 * AUDIO HELPER - PROCEDURAL SOUND SYNTHESIS ENGINE
 * Extracted directly from:
 * "Infinite Machine Web Design by David McGillivray" (dmcg.co/work/infinitemachine)
 *
 * 100% Native Web Audio API procedural sound synthesis.
 * Zero external audio files, zero network dependencies, 100% offline & instant.
 * ====================================================================
 */
window.AudioHelper = (function() {
    let audioCtx = null;
    let masterOutput = null;
    let soundEnabled = true;
    let lastPlayTime = 0;
    const noiseBufferMap = new WeakMap();

    const SOUND_VOICES = [
        "tick", "click", "tap", "wood", "bubble", "air", 
        "digital", "soft", "glass", "mallet", "metal", "chime", "pluck", "synth"
    ];

    const DEFAULT_SOUND = {
        voice: "glass", pitch: 880, duration: 160, brightness: 55, body: 40,
        sweep: 0, attack: 2, space: 15, variation: 8, volume: 60, notes: 1, interval: 5, gap: 80, tape: 0, reverse: false
    };

    // Authentic Sound Recipes from David McGillivray (Infinite Machine & dmcg.co)
    const RECIPES = {
        // Dial step: Used for project.open, project.close, view.change, archive.branch, nav.hover
        dialStep: { voice: "tick", pitch: 1760, duration: 30, brightness: 55, body: 10, sweep: 0, attack: 0, space: 0, variation: 10, volume: 22, notes: 1, interval: 5, gap: 80, tape: 0, reverse: false },
        
        // Felt step 2: Used for dock.open, dock.close
        feltStep: { voice: "tick", pitch: 880, duration: 80, brightness: 30, body: 30, sweep: 0, attack: 1, space: 0, variation: 10, volume: 25, notes: 1, interval: 5, gap: 80, tape: 0, reverse: false },
        
        // Tap: Used for dock.hover, page.navigate, archive.open
        tap: { voice: "tap", pitch: 1760, duration: 30, brightness: 42, body: 10, sweep: 0, attack: 0, space: 0, variation: 10, volume: 16, notes: 1, interval: 5, gap: 80, tape: 0, reverse: false },
        
        // Felt reveal: Used for contact.copy, profile save, account switch success
        feltReveal: { voice: "soft", pitch: 440, duration: 320, brightness: 30, body: 55, sweep: 0, attack: 4, space: 35, variation: 6, volume: 40, notes: 3, interval: 5, gap: 65, tape: 0, reverse: false },
        
        // Bright chime rise: Used for sound.on, high scores, exam completion fanfare
        brightChime: { voice: "chime", pitch: 2093, duration: 420, brightness: 79, body: 35, sweep: 0, attack: 1, space: 25, variation: 6, volume: 36, notes: 3, interval: 6, gap: 70, tape: 0, reverse: false },
        
        // Glass tap: Crisp acoustic resonant tap
        glassTap: { voice: "glass", pitch: 880, duration: 160, brightness: 55, body: 40, sweep: 0, attack: 2, space: 15, variation: 8, volume: 50, notes: 1, interval: 5, gap: 80, tape: 0, reverse: false },
        
        // Bubble pop: Playful plip / pop
        bubblePop: { voice: "bubble", pitch: 680, duration: 130, sweep: -15, brightness: 30, body: 70, space: 0, volume: 38, variation: 10 },
        
        // Wood tick: Earthy organic click
        woodTick: { voice: "wood", pitch: 330, duration: 90, brightness: 38, body: 75, space: 0, volume: 32 },

        // Tactile Incorrect / Error knock
        errorKnock: { voice: "wood", pitch: 220, duration: 170, sweep: -10, brightness: 22, body: 80, volume: 38 },

        // Tactile Warning / Alert
        warningAlert: { voice: "mallet", pitch: 440, duration: 250, brightness: 58, body: 40, notes: 2, interval: -4, gap: 70, volume: 35 }
    };

    function normalizeSound(e) {
        let n = { ...DEFAULT_SOUND, voice: SOUND_VOICES.includes(e?.voice) ? e.voice : DEFAULT_SOUND.voice };
        const controls = [
            { key: "pitch", min: 80, max: 2400 },
            { key: "duration", min: 30, max: 1400 },
            { key: "brightness", min: 0, max: 100 },
            { key: "body", min: 0, max: 100 },
            { key: "sweep", min: -24, max: 24 },
            { key: "attack", min: 0, max: 80 },
            { key: "space", min: 0, max: 100 },
            { key: "variation", min: 0, max: 100 },
            { key: "volume", min: 0, max: 100 },
            { key: "notes", min: 1, max: 3 },
            { key: "interval", min: -12, max: 12 },
            { key: "gap", min: 30, max: 240 },
            { key: "tape", min: 0, max: 100 }
        ];
        for (let c of controls) {
            let val = e?.[c.key];
            n[c.key] = (typeof val === "number" && Number.isFinite(val)) ? Math.max(c.min, Math.min(c.max, val)) : DEFAULT_SOUND[c.key];
        }
        n.reverse = e?.reverse === true;
        n.notes = Math.round(n.notes);
        n.interval = Math.round(n.interval);
        n.attack = Math.min(n.attack, 0.4 * n.duration);
        return n;
    }

    function soundDuration(e) {
        return e.duration + (Math.max(1, e.notes) - 1) * e.gap;
    }

    function getAudioContext() {
        if (!audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                audioCtx = new AudioCtx({ latencyHint: "interactive" });
                // Studio grade dynamics compressor output stage
                const comp = audioCtx.createDynamicsCompressor();
                comp.threshold.value = -8;
                comp.knee.value = 12;
                comp.ratio.value = 5;
                comp.attack.value = 0.002;
                comp.release.value = 0.08;
                comp.connect(audioCtx.destination);
                masterOutput = comp;
            }
        }
        if (audioCtx && (audioCtx.state === "suspended" || audioCtx.state === "interrupted")) {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    /**
     * Core Procedural Sound Synthesizer
     * Decompiled directly from Infinite Machine / dmcg.co Sound Engine
     */
    function synthesize(ctx, dest, soundRecipe, options = {}) {
        let subGain;
        let c = normalizeSound(soundRecipe);
        let vary = (options.vary === false) ? 0 : (Math.random() - 0.5) * c.variation / 100;
        let pitch = c.pitch * Math.pow(2, 0.35 * vary);
        let startTime = ctx.currentTime + 0.004 + Math.max(0, options.delay || 0);
        let durSec = c.duration / 1000;
        let attackSec = Math.min(0.4 * durSec, Math.max(0.001, c.attack / 1000));
        let totalDurSec = soundDuration(c) / 1000;
        let tapeAmount = c.tape / 100;
        let nodesToDisconnect = [];
        let oscsToDisconnect = [];

        let mainGain = ctx.createGain();
        mainGain.gain.value = (c.volume / 100) * Math.max(0, Math.min(1, options.volume ?? 1)) * 0.48 * (1 + 0.15 * vary);
        mainGain.connect(dest);
        nodesToDisconnect.push(mainGain);

        let filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = Math.min(0.45 * ctx.sampleRate, (500 + (c.brightness / 100) * 13500) * (1 - 0.4 * tapeAmount));
        filter.Q.value = 0.6;
        nodesToDisconnect.push(filter);

        if (tapeAmount > 0) {
            let waveShaper = ctx.createWaveShaper();
            let t = 1 + (c.tape / 100) * 2.4;
            let curve = new Float32Array(1025);
            for (let i = 0; i < curve.length; i++) {
                let n = (i / 512) - 1;
                curve[i] = Math.tanh(n * t) / t;
            }
            waveShaper.curve = curve;
            waveShaper.oversample = "2x";
            let tapeGain = ctx.createGain();
            tapeGain.gain.value = 1 + 0.15 * tapeAmount;
            filter.connect(waveShaper);
            waveShaper.connect(tapeGain);
            tapeGain.connect(mainGain);
            subGain = ctx.createGain();
            nodesToDisconnect.push(waveShaper, tapeGain, subGain);

            for (let [freq, amp] of [[0.7 + 0.3 * Math.random(), 22], [5.6, 9]]) {
                let lfo = ctx.createOscillator();
                lfo.frequency.value = freq;
                let lfoGain = ctx.createGain();
                lfoGain.gain.value = amp * tapeAmount;
                lfo.connect(lfoGain);
                lfoGain.connect(subGain);
                nodesToDisconnect.push(lfoGain);
                lfo.start(startTime);
                lfo.stop(startTime + totalDurSec + 0.01);
                oscsToDisconnect.push(lfo);
            }
        } else {
            filter.connect(mainGain);
        }

        if (c.space > 0) {
            for (let [delayTime, delayGain] of [[0.045, 0.18], [0.095, 0.09]]) {
                let delayNode = ctx.createDelay(0.2);
                delayNode.delayTime.value = delayTime;
                let delayGainNode = ctx.createGain();
                delayGainNode.gain.value = delayGain * (c.space / 100);
                filter.connect(delayNode);
                delayNode.connect(delayGainNode);
                delayGainNode.connect(mainGain);
                nodesToDisconnect.push(delayNode, delayGainNode);
            }
        }

        let bodyNorm = c.body / 100;
        let brightNorm = c.brightness / 100;

        let renderNote = (noteTime, noteFreq, noteScale) => {
            let noteEnd = noteTime + durSec;

            let createEnvGain = (maxGain, noteDur = durSec, targetFilter = filter, attackTime = attackSec) => {
                let g = ctx.createGain();
                g.gain.setValueAtTime(0, noteTime);
                g.gain.linearRampToValueAtTime(Math.max(0.0001, maxGain * noteScale), noteTime + Math.min(attackTime, 0.4 * noteDur));
                g.gain.exponentialRampToValueAtTime(0.0001, noteTime + noteDur);
                g.gain.linearRampToValueAtTime(0, noteTime + noteDur + 0.004);
                g.connect(targetFilter);
                nodesToDisconnect.push(g);
                return g;
            };

            let createToneOsc = (freqMult, waveType, sweepSemi) => {
                let osc = ctx.createOscillator();
                osc.type = waveType;
                let startFreq = Math.max(25, Math.min(0.4 * ctx.sampleRate, noteFreq * freqMult));
                osc.frequency.setValueAtTime(startFreq, noteTime);
                osc.frequency.exponentialRampToValueAtTime(Math.max(25, Math.min(0.4 * ctx.sampleRate, startFreq * Math.pow(2, sweepSemi / 12))), noteEnd);
                if (subGain) subGain.connect(osc.detune);
                osc.start(noteTime);
                osc.stop(noteEnd + 0.01);
                oscsToDisconnect.push(osc);
                return osc;
            };

            let addLayer = (freqMult, maxGain, durMult = 1, waveType = "sine", sweepSemi = c.sweep) => {
                createToneOsc(freqMult, waveType, sweepSemi).connect(createEnvGain(maxGain, durSec * durMult));
            };

            let getNoiseSource = (offsetTime = 0) => {
                let src = ctx.createBufferSource();
                let noiseBuf = noiseBufferMap.get(ctx);
                if (!noiseBuf) {
                    noiseBuf = ctx.createBuffer(1, Math.ceil(1.6 * ctx.sampleRate), ctx.sampleRate);
                    let chan = noiseBuf.getChannelData(0);
                    let seed = 173;
                    for (let i = 0; i < chan.length; i++) {
                        seed = Math.imul(seed, 1664525) + 0x3c6ef35f | 0;
                        chan[i] = (seed >>> 0) / 0x80000000 - 1;
                    }
                    noiseBufferMap.set(ctx, noiseBuf);
                }
                src.buffer = noiseBuf;
                if (subGain) subGain.connect(src.detune);
                src.start(noteTime + offsetTime);
                src.stop(noteEnd + 0.01);
                oscsToDisconnect.push(src);
                return src;
            };

            let addNoiseFiltered = (filterType, freq, q, gainVal, decaySec, attackSecParam = 0.0005) => {
                let fNode = ctx.createBiquadFilter();
                fNode.type = filterType;
                fNode.frequency.value = Math.max(40, Math.min(0.45 * ctx.sampleRate, freq));
                fNode.Q.value = q;
                let gNode = ctx.createGain();
                gNode.gain.setValueAtTime(0, noteTime);
                gNode.gain.linearRampToValueAtTime(Math.max(0.0001, gainVal * noteScale), noteTime + attackSecParam);
                gNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + attackSecParam + decaySec);
                gNode.gain.linearRampToValueAtTime(0, noteTime + attackSecParam + decaySec + 0.004);
                getNoiseSource().connect(fNode);
                fNode.connect(gNode);
                gNode.connect(filter);
                nodesToDisconnect.push(fNode, gNode);
            };

            let addFmLayer = (freqMult, modIndex, gainVal, durMult = 1) => {
                let carrier = createToneOsc(1, "sine", c.sweep);
                let modulator = createToneOsc(freqMult, "sine", c.sweep);
                let maxDev = Math.max(0.1, Math.min(modIndex, (16000 - noteFreq) / (noteFreq * freqMult) - 1));
                let modGain = ctx.createGain();
                modGain.gain.setValueAtTime(maxDev * noteFreq * freqMult, noteTime);
                modGain.gain.exponentialRampToValueAtTime(maxDev * noteFreq * freqMult * 0.06, noteTime + 0.55 * durSec);
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                nodesToDisconnect.push(modGain);
                carrier.connect(createEnvGain(gainVal, durSec * durMult));
            };

            let addNoiseSweep = (gainVal, durMult = 1, isBandpass = false) => {
                let fNode = ctx.createBiquadFilter();
                fNode.type = isBandpass ? "bandpass" : "highpass";
                fNode.frequency.setValueAtTime(isBandpass ? 2 * noteFreq : 1800, noteTime);
                if (isBandpass) {
                    fNode.frequency.exponentialRampToValueAtTime(Math.max(100, Math.min(12000, 2 * noteFreq * Math.pow(2, c.sweep / 12))), noteEnd);
                }
                fNode.Q.value = isBandpass ? (0.7 + 3 * bodyNorm) : 0.5;
                getNoiseSource().connect(fNode);
                fNode.connect(createEnvGain(gainVal, durSec * durMult));
                nodesToDisconnect.push(fNode);
            };

            switch (c.voice) {
                case "glass":
                    addLayer(1, 0.55);
                    addLayer(2.76, 0.16 * brightNorm, 0.55);
                    addLayer(5.4, 0.08 * brightNorm, 0.25);
                    addLayer(0.5, 0.15 * bodyNorm, 0.8);
                    addNoiseSweep(0.09 * brightNorm, 0.12);
                    break;
                case "wood":
                    addLayer(1, 0.4, 0.65);
                    addLayer(1.47, 0.18 * bodyNorm, 0.35);
                    addLayer(0.5, 0.28 * bodyNorm, 0.65);
                    addNoiseSweep(0.4 * brightNorm, 0.25, true);
                    break;
                case "metal":
                    addLayer(1, 0.38);
                    addLayer(2.4, 0.18 * brightNorm, 0.8);
                    addLayer(3.76, 0.12 * brightNorm, 0.5);
                    addLayer(5.91, 0.07 * brightNorm, 0.3);
                    addLayer(0.5, 0.18 * bodyNorm);
                    break;
                case "bubble":
                    addLayer(1, 0.65, 1, "sine", c.sweep - 10);
                    addLayer(0.5, 0.18 * bodyNorm, 0.6, "sine", c.sweep - 6);
                    addNoiseSweep(0.09 * brightNorm, 0.1);
                    break;
                case "air":
                    addNoiseSweep(0.9, 1, true);
                    addLayer(0.5, 0.18 * bodyNorm);
                    break;
                case "digital":
                    addLayer(1, 0.32, 1, "triangle");
                    addLayer(2, 0.08 * brightNorm, 0.5, "square");
                    addLayer(0.5, 0.22 * bodyNorm, 0.8);
                    break;
                case "soft":
                    addLayer(1, 0.5);
                    addLayer(1.5, 0.15 * brightNorm, 0.8);
                    addLayer(2, 0.08 * brightNorm, 0.6);
                    addLayer(0.5, 0.2 * bodyNorm);
                    break;
                case "pluck": {
                    let fNode = ctx.createBiquadFilter();
                    fNode.type = "lowpass";
                    fNode.frequency.setValueAtTime(Math.min(0.45 * ctx.sampleRate, noteFreq * (2 + 14 * brightNorm)), noteTime);
                    fNode.frequency.exponentialRampToValueAtTime(Math.max(60, 1.2 * noteFreq), noteTime + 0.5 * durSec);
                    fNode.Q.value = 0.7 + 6 * bodyNorm;
                    createToneOsc(1, "sawtooth", c.sweep).connect(fNode);
                    fNode.connect(createEnvGain(0.34));
                    nodesToDisconnect.push(fNode);
                    addLayer(0.5, 0.16 * bodyNorm, 0.7);
                    break;
                }
                case "click":
                    for (let [timeOff, gainMult] of [[0, 4], [0.009 + (1 - brightNorm) * 0.008, 1.8]]) {
                        let bandFilter = ctx.createBiquadFilter();
                        bandFilter.type = "bandpass";
                        bandFilter.frequency.value = Math.min(12000, noteFreq * (2.5 + 3 * brightNorm));
                        bandFilter.Q.value = 1.2 + 5 * bodyNorm;
                        let gainNode = ctx.createGain();
                        gainNode.gain.setValueAtTime(0, noteTime + timeOff);
                        gainNode.gain.linearRampToValueAtTime(gainMult * noteScale, noteTime + timeOff + 0.0006);
                        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + timeOff + 0.008 + 0.014 * bodyNorm);
                        gainNode.gain.linearRampToValueAtTime(0, noteTime + timeOff + 0.02);
                        getNoiseSource(timeOff).connect(bandFilter);
                        bandFilter.connect(gainNode);
                        gainNode.connect(filter);
                        nodesToDisconnect.push(bandFilter, gainNode);
                    }
                    addLayer(1, 0.25 + 0.45 * bodyNorm, 0.5);
                    break;
                case "tick":
                    addNoiseFiltered("highpass", 2000 + 5000 * brightNorm, 0.7, 7, 0.0012 + (1 - brightNorm) * 0.0018);
                    addNoiseFiltered("bandpass", 2.1 * noteFreq, 1.5 + 5 * bodyNorm, 10, 0.003 + 0.005 * bodyNorm);
                    addLayer(1, 0.22 + 1.4 * bodyNorm, 0.4);
                    addLayer(2.71, 0.45 * bodyNorm * brightNorm, 0.18);
                    break;
                case "tap": {
                    let attackAdj = Math.max(attackSec, 0.0025 + (1 - brightNorm) * 0.0035);
                    let osc = ctx.createOscillator();
                    let baseF = Math.max(25, Math.min(0.4 * ctx.sampleRate, noteFreq));
                    osc.frequency.setValueAtTime(1.12 * baseF, noteTime);
                    osc.frequency.exponentialRampToValueAtTime(baseF, noteTime + attackAdj + 0.008);
                    osc.frequency.exponentialRampToValueAtTime(Math.max(25, baseF * Math.pow(2, c.sweep / 12)), noteEnd);
                    if (subGain) subGain.connect(osc.detune);
                    osc.start(noteTime);
                    osc.stop(noteEnd + 0.01);
                    oscsToDisconnect.push(osc);
                    osc.connect(createEnvGain(0.56, durSec * (0.3 + 0.55 * bodyNorm), filter, attackAdj));
                    createToneOsc(2.43, "sine", c.sweep).connect(createEnvGain(0.056 + 0.125 * brightNorm, durSec * (0.12 + 0.1 * bodyNorm), filter, attackAdj));
                    addNoiseFiltered("lowpass", 600 + 1400 * brightNorm, 0.5, 0.28 + 0.4 * brightNorm, 0.004, attackAdj);
                    break;
                }
                case "chime":
                    addFmLayer(3.5, 0.5 + 3 * brightNorm, 0.32);
                    addFmLayer(1, 0.4 + 1.6 * brightNorm, 0.1 + 0.16 * bodyNorm, 0.55);
                    addLayer(0.5, 0.1 * bodyNorm);
                    addNoiseFiltered("bandpass", 4 * noteFreq, 1, 0.25 * brightNorm, 0.003);
                    break;
                case "synth": {
                    let fNode = ctx.createBiquadFilter();
                    fNode.type = "lowpass";
                    let hiF = Math.min(0.45 * ctx.sampleRate, noteFreq * (2.5 + 12 * brightNorm));
                    let loF = Math.min(0.45 * ctx.sampleRate, noteFreq * (1.2 + 2.5 * brightNorm));
                    fNode.frequency.setValueAtTime(loF, noteTime);
                    fNode.frequency.exponentialRampToValueAtTime(hiF, noteTime + attackSec + 0.006);
                    fNode.frequency.exponentialRampToValueAtTime(loF, noteTime + attackSec + 0.45 * durSec);
                    fNode.Q.value = 1 + 2.5 * brightNorm;
                    let detuneAmount = 5 + 12 * bodyNorm;
                    for (let det of [-detuneAmount, detuneAmount]) {
                        let osc = createToneOsc(1, "sawtooth", c.sweep);
                        osc.detune.value = det;
                        osc.connect(fNode);
                    }
                    let subGainNode = ctx.createGain();
                    subGainNode.gain.value = 0.5 * bodyNorm;
                    createToneOsc(0.5, "square", c.sweep).connect(subGainNode);
                    subGainNode.connect(fNode);
                    fNode.connect(createEnvGain(0.36));
                    nodesToDisconnect.push(fNode, subGainNode);
                    break;
                }
                case "mallet":
                    addLayer(1, 0.5);
                    addLayer(3.93, 0.04 + 0.14 * brightNorm, 0.22);
                    addLayer(9.2, 0.05 * brightNorm, 0.08);
                    createToneOsc(1, "sine", c.sweep).connect(createEnvGain(0.3 * bodyNorm, durSec, filter, 0.012));
                    addNoiseFiltered("lowpass", 3 * noteFreq + 2400 * brightNorm, 0.7, 0.5 + 0.7 * brightNorm, 0.0025);
                    break;
            }
        };

        for (let i = 0; i < c.notes; i++) {
            renderNote(startTime + (i * c.gap) / 1000, pitch * Math.pow(2, (i * c.interval) / 12), Math.pow(0.9, i));
        }

        let dummyOsc = ctx.createOscillator();
        let dummyGain = ctx.createGain();
        dummyGain.gain.value = 0;
        dummyOsc.connect(dummyGain);
        dummyGain.connect(dest);
        nodesToDisconnect.push(dummyGain);
        dummyOsc.start(startTime);
        dummyOsc.stop(startTime + totalDurSec + 0.12);
        oscsToDisconnect.push(dummyOsc);
        dummyOsc.onended = () => {
            for (let o of oscsToDisconnect) { try { o.disconnect(); } catch(e){} }
            for (let n of nodesToDisconnect) { try { n.disconnect(); } catch(e){} }
        };

        return totalDurSec + 0.12;
    }

    function playRecipe(recipe, volumeMult = 1) {
        if (!soundEnabled) return;
        const now = performance.now();
        if (now - lastPlayTime < 25) return;
        lastPlayTime = now;

        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const dest = masterOutput || ctx.destination;
            synthesize(ctx, dest, recipe, { volume: volumeMult });
        } catch (e) {}
    }

    // Auto unlock audio context on initial user interaction (Chrome requirement)
    if (typeof window !== "undefined") {
        const unlock = () => {
            getAudioContext();
            window.removeEventListener("pointerdown", unlock, true);
            window.removeEventListener("keydown", unlock, true);
        };
        window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
        window.addEventListener("keydown", unlock, { capture: true, passive: true });

        // Automatic Haptic Sound when hovering over UI Entities & Interactive Elements
        // Direct implementation of David McGillivray's "dock.hover" and "nav.hover"
        let lastHoverTarget = null;
        let lastHoverTime = 0;

        document.addEventListener("pointerover", function(e) {
            if (!soundEnabled) return;
            const target = e.target;
            if (!target || typeof target.closest !== "function") return;

            const entity = target.closest(
                "button, a, select, input[type='checkbox'], input[type='radio'], " +
                ".glass-folder-3d, .glass-folder-card, [onclick*='handleGlassFolderClick'], " +
                ".exam-card, .glass-exam-card, [onclick*='startExam'], [onclick*='openEssayStudy'], " +
                ".account-card-item, .avatar-opt-btn, .quick-acc-btn, .nimbus-pill-btn, " +
                ".sidebar-nav-item, .nav-icon-btn, .quiz-option, .answer-item, " +
                "[role='button'], .cursor-pointer"
            );

            if (!entity || entity === lastHoverTarget) return;
            lastHoverTarget = entity;

            const now = performance.now();
            if (now - lastHoverTime < 38) return; // Debounce rapid sweeps
            lastHoverTime = now;

            // Specialized tactile sound per entity type
            if (entity.matches(".glass-folder-3d, .glass-folder-card, [onclick*='handleGlassFolderClick']")) {
                playRecipe(RECIPES.glassTap, 0.38); // Acoustic resonant micro-tap for 3D Glass Folders
            } else if (entity.matches(".exam-card, .glass-exam-card, [onclick*='startExam'], [onclick*='openEssayStudy']")) {
                playRecipe(RECIPES.feltStep, 0.45); // Damped felt step for exam cards
            } else {
                playRecipe(RECIPES.tap, 0.75); // Authentic David McGillivray "Tap" for buttons & pills
            }
        }, { passive: true });

        document.addEventListener("pointerout", function(e) {
            if (lastHoverTarget && (!e.relatedTarget || !lastHoverTarget.contains(e.relatedTarget))) {
                lastHoverTarget = null;
            }
        }, { passive: true });
    }

    return {
        isSoundEnabled: function() {
            return soundEnabled;
        },
        toggleSound: function() {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                // Play Infinite Machine sound.on chime
                this.playSuccessFanfare();
            }
            return soundEnabled;
        },

        // --- AUTHENTIC INFINITE MACHINE / DAVID MCGILLIVRAY SOUND ACTIONS ---

        /**
         * "Dial step" (project.open, project.close, view.change, archive.branch, nav.hover)
         * Ultra-tactile mechanical dial step click.
         */
        playClick: function() {
            playRecipe(RECIPES.dialStep, 1);
        },

        /**
         * "Felt step 2" (dock.open, dock.close)
         * Soft damped tactile step for docks, menus, drawers, search dock.
         */
        playPlip: function() {
            playRecipe(RECIPES.feltStep, 1);
        },

        /**
         * "Tap" (dock.hover, page.navigate, archive.open)
         * Lightweight tactile tap for hovering buttons or subtle selections.
         */
        playTap: function() {
            playRecipe(RECIPES.tap, 1);
        },
        playHover: function() {
            playRecipe(RECIPES.tap, 0.8);
        },

        /**
         * "Felt reveal" (contact.copy, save profile, switch account success)
         * Harmonic 3-note ascending felt chord.
         */
        playCorrect: function() {
            playRecipe(RECIPES.feltReveal, 1);
        },
        playSuccess: function() {
            playRecipe(RECIPES.feltReveal, 1);
        },

        /**
         * "Bright chime rise" (sound.on, full exam completion, high scores)
         * Ascending crystal chime fanfare.
         */
        playSuccessFanfare: function() {
            playRecipe(RECIPES.brightChime, 1);
        },

        /**
         * Deep acoustic wood knock for wrong answer / mistake.
         */
        playIncorrect: function() {
            playRecipe(RECIPES.errorKnock, 1);
        },

        /**
         * Tactile mallet alert for warnings / rate limits.
         */
        playWarning: function() {
            playRecipe(RECIPES.warningAlert, 1);
        },

        /**
         * Direct access to any named Infinite Machine recipe
         */
        playDialStep: function() { playRecipe(RECIPES.dialStep, 1); },
        playFeltStep: function() { playRecipe(RECIPES.feltStep, 1); },
        playGlassTap: function() { playRecipe(RECIPES.glassTap, 1); },
        playBubblePop: function() { playRecipe(RECIPES.bubblePop, 1); },
        playWoodTick: function() { playRecipe(RECIPES.woodTick, 1); },
        playCustomRecipe: function(recipe, volume) { playRecipe(recipe, volume); }
    };
})();
