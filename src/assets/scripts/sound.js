function midiNoteNumberToFrequency (midi_note_number) {
    var f_ref = 440;
    var n_ref = 57;
    var a = Math.pow(2, 1/12);
    var n = midi_note_number - n_ref;
    var f = f_ref * Math.pow(a, n);
    
    return f;
}

function playSound(dominants, chromas, achromas, highSaturates) {
    var baseRate = dominants[0].rate;
    var loopTime = Math.round(1 / baseRate / 2);
    
    var components = [];
    var parts = [];
    
        //for (var i=0; i < hSColor.length; ++i) {
//    var color = hSColor[i];
//    var lch = chroma.rgb(color).lch();
//    playHighSatColor(color, color.rate);
//}

    for (var i=0; i < achromas.length; ++i) {
        var color = achromas[i];
        var lch = chroma.rgb(color).lch();
        var l = lch[0];
        var ret;
        if (l < 20) {
            ret = playBlackColor(color, color.rate);
        } else if (l > 70) {
            ret = playWhiteColor(color, color.rate);
        } else {
            ret = playGreyColor(color, color.rate);
        }
        parts.push(ret.part);
        components = components.concat(ret.components);
    }

    for (var i = 0; i < chromas.length && i < 3; ++i) {
        var color = chromas[i];
        ret = playChromaColor(color, color.rate);
        parts.push(ret.part);
        components = components.concat(ret.components);
    }
    
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = "" + loopTime + ":0";;
    Tone.Transport.loop = true;
    Tone.Transport.start();
    
    return {
        components : components,
        parts : parts
    }
    
    function makeScore(rate, tempo){
        var score = [];

        var len = loopTime * tempo;   
        for (var i = 0; i*rate*len < len ; i++) {
            var note = Math.round(rate * i * len);
            if (note !== score[score.length-1]) {
                score.push(note);    
            }

        }
        score = score.map(function (note) {
            return "" + note + "*" + tempo + "n"
        })
        return score;
    }
    
    function playChromaColor(color, rate) {
        var score = makeScore(rate, 16);
        var lch = chroma.rgb(color).lch();
        var h = lch[2];

        var midi = Math.round(h / 7) + 40;
        var freq = midiNoteNumberToFrequency(midi);

        var filter = new Tone.Filter({
            type: "highpass",
            frequency: 200,
            Q: 5
        });

        var oscillator1 = new Tone.Oscillator(freq, "sawtooth")
        .connect(filter)
        .start(0);
        var oscillator2 = new Tone.Oscillator(freq, "square")
        .connect(filter)
        .start(0);



        var delay = new Tone.Delay({
            delayTime: 0.6
        });

        var delayGain = new Tone.Gain({
            gain : 0.6
        });

        var gain = new Tone.Gain({
            gain : 0.8
        })
        
        var ampEnv = new Tone.AmplitudeEnvelope({
            attack : 0.01,
            decay: 1,
            sustain: 0,
            release: 2
        }).toMaster();



        filter.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(delay);
        delayGain.connect(gain);
        gain.connect(ampEnv);

        var chromaPart = new Tone.Part(function (time) {
            ampEnv.triggerAttack();    
        }, score).start(0);   
        return {
            part : chromaPart,
            components : [oscillator1, oscillator2, filter, delay, delayGain, ampEnv]
        }
    }
    
    function playHighSatColor(color, rate) {
        var score = makeScore(rate, 4);

        var lch = chroma.rgb(color).lch();

        var delay = color.rate * 50;
        var baseFreq = (lch[2] + 220);

        var oscillator = new Tone.Oscillator(440, "sine").start();

        var env = new Tone.FrequencyEnvelope({
            "attack" : 0.1,
            "decay" : 0.5,
            "sustain" : 0,
            "release" : 0,
            "baseFrequency" : baseFreq
        });

        var delay = new Tone.Delay({
            delayTime: delay
        });

        var delayGain = new Tone.Gain({
            gain : 0.4
        });

        var ampEnv = new Tone.AmplitudeEnvelope({
            attack : 0.4,
            decay: 0.5,
            sustain: 0,
            release: 1
        })

        var filter = new Tone.Filter({
            type: "highpass",
            frequency: 440,
            Q: 0
        }).toMaster();

        env.connect(oscillator.frequency)
        oscillator.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(delay);
        //delayGain.connect(highSatEnv);
        delayGain.connect(filter)


        var highSatPart = new Tone.Part(function (time) {
            env.triggerAttack(time);
        //    highSatEnv.triggerAttackRelease("1", time);
        //    env.triggerRelease(time);
        }, score).start(0);  
        
        return {
            part: highSatPart,
            components: [oscillator, env, filter, delay, delayGain, ampEnv]
        }
    }

    function playBlackColor(color, rate) {

        var score = makeScore(rate, 8);

        var kickEnvelope = new Tone.AmplitudeEnvelope({
            "attack": 0.01,
            "decay": 0.2,
            "sustain": 0,
            "release": 0
        }).toMaster();

        var kick = new Tone.Oscillator("A2").connect(kickEnvelope).start();

        var kickSnapEnv = new Tone.FrequencyEnvelope({
            "attack": 0.005,
            "decay": 0.01,
            "sustain": 0,
            "release": 0,
            "baseFrequency": "A2",
            "octaves": 2.7
        }).connect(kick.frequency);

        var kickPart = new Tone.Part(function(time){
            kickEnvelope.triggerAttack(time);
            kickSnapEnv.triggerAttack(time);
        }, score).start(0);
        return {
            part: kickPart,
            components: [kickEnvelope, kick, kickSnapEnv] 
        }
    }

    function playGreyColor(color, rate) {
        var score = makeScore(rate, 8);

        var baseFreq = (color[0] + color[1] + color[2] + 440) * 6

        var lowPass = new Tone.Filter({
            "frequency": 14000,
        }).toMaster();

        var closedHiHat = new Tone.NoiseSynth({
            "volume" : -10,
            "filter": {
                "Q": 1
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.15
            },
            "filterEnvelope": {
                "attack": 0.01,
                "decay": 0.03,
                "baseFrequency": baseFreq,
                "octaves": -2.5,
                "exponent": 4,
            }
        }).connect(lowPass);

        var closedHatPart = new Tone.Part(function(time){
            closedHiHat.triggerAttack(time);    
        }, score).start(0);
        
        return {
            part: closedHatPart,
            components: [lowPass, closedHiHat] 
        }
    }

    function playWhiteColor(color, rate) {    
        var score = makeScore(rate, 8);
        var baseFreq = (color[0] + color[1] + color[2] + 440) * 6

        var lowPass = new Tone.Filter({
            "frequency": 14000,
        }).toMaster();

        var openHiHat = new Tone.NoiseSynth({
            "filter": {
                "Q": 1
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.3
            },
            "filterEnvelope": {
                "attack": 0.01,
                "decay": 0.03,
                "baseFrequency": baseFreq,
                "octaves": -2.5,
                "exponent": 4,
            }
        }).connect(lowPass);

        var openHiHatPart = new Tone.Part(function(time){
            openHiHat.triggerAttack(time);
        }, score).start(0);
        return {
            part: openHiHatPart,
            components: [lowPass, openHiHat] 
        }
    }
    
}


function stopSound(parts, components) {
    Tone.Transport.stop()
    for (var i = 0; i < parts.length; i++) {
        parts[i].dispose();
    }
    for (var i = 0; i< components.length; i++) {
        components[i].dispose();
    }
}

//



//var highSatEnvelope = new Tone.AmplitudeEnvelope({
//    "attack": 0.01,
//    "decay": 0.2,
//    "sustain": 0,
//    "release": 0,
//}).toMaster();





//var blackColor = {
//    r: 20,
//    g: 10,
//    b: 15,
//    rate: 0.3
//};
//
//var highSatPart = new Tone.Part(function(time){
//    kickEnvelope.triggerAttack(time);
//    kickSnapEnv.triggerAttack(time);
//}, ["0", "0:0:3", "0:2:0", "0:3:1"]).start(0);


//
//var BMP;
//var kickSound;
//var kickNote;
//
//var kickEnvelope = new Tone.AmplitudeEnvelope({
//    "attack": 0.01,
//    "decay": 0.2,
//    "sustain": 0,
//    "release": 0
//}).toMaster();
//
//var kick = new Tone.Oscillator("D2").connect(kickEnvelope).start();
//
//var kickSnapEnv = new Tone.FrequencyEnvelope({
//    "attack": 0.005,
//    "decay": 0.01,
//    "sustain": 0,
//    "release": 0,
//    "baseFrequency": "D2",
//    "octaves": 2
//}).connect(kick.frequency);
//
//var kickPart = new Tone.Part(function(time){
//    kickEnvelope.triggerAttack(time);
//    kickSnapEnv.triggerAttack(time);
//}, ["0", "0:0:3", "0:2:0", "0:3:1"]).start(0);
//
//Tone.Transport.loopStart = 0;
//Tone.Transport.loopEnd = "1:0";
//Tone.Transport.loop = true;
//Tone.Transport.start();



//var oscillator = new Tone.Oscillator(440, "sine");
//var output = new Tone.Gain({
//    gain : 1
//}).toMaster();
//
//var env = new Tone.FrequencyEnvelope({
//    "attack" : 0.2,
//    "deay" : 0.4,
//    "sustain" : 0.0,
//    "release" : 1,
//    "baseFrequency" : "C2",
//    "octaves" : 4
//});
//env.connect(oscillator.frequency);
//
//var delay = new Tone.Delay({
//    delayTime: 0.1
//});
//
//var delayGain = new Tone.Gain({
//    gain : 0.5
//});
//
//oscillator.connect(delay);
//
//delay.connect(delayGain);
//delayGain.connect(delay);
//delayGain.connect(output);
//
//oscillator.start();
//output.toMaster();
//env.triggerAttack();

//
//		//HATS
//
//		//filtering the hi-hats a bit
//		//to make them sound nicer
//		var lowPass = new Tone.Filter({
//		    "frequency": 14000,
//		}).toMaster();
//
//		//we can make our own hi hats with 
//		//the noise synth and a sharp filter envelope
//		var openHiHat = new Tone.NoiseSynth({
//			"volume" : -10,
//		    "filter": {
//		        "Q": 1
//		    },
//		    "envelope": {
//		        "attack": 0.01,
//		        "decay": 0.3
//		    },
//		    "filterEnvelope": {
//		        "attack": 0.01,
//		        "decay": 0.03,
//		        "baseFrequency": 4000,
//		        "octaves": -2.5,
//		        "exponent": 4,
//		    }
//		}).connect(lowPass);
//
//		var openHiHatPart = new Tone.Part(function(time){
//			openHiHat.triggerAttack(time);
//		}, ["2*8n", "6*8n"]).start(0);
//
//		var closedHiHat = new Tone.NoiseSynth({
//			"volume" : -10,
//		    "filter": {
//		        "Q": 1
//		    },
//		    "envelope": {
//		        "attack": 0.01,
//		        "decay": 0.15
//		    },
//		    "filterEnvelope": {
//		        "attack": 0.01,
//		        "decay": 0.03,
//		        "baseFrequency": 4000,
//		        "octaves": -2.5,
//		        "exponent": 4,
//
//		    }
//		}).connect(lowPass);
//
//		var closedHatPart = new Tone.Part(function(time){
//			closedHiHat.triggerAttack(time);
//		}, ["0*8n", "1*16n", "1*8n", "3*8n", "4*8n", "5*8n", "7*8n", "12*8n"]).start(0);
//
//		//BASS
//		var bassEnvelope = new Tone.AmplitudeEnvelope({
//		    "attack": 0.01,
//		    "decay": 0.2,
//		    "sustain": 0,
//		    "release": 0,
//		}).toMaster();
//
//		var bassFilter = new Tone.Filter({
//		    "frequency": 600,
//		    "Q": 8
//		});
//
//		var bass = new Tone.PulseOscillator("A2", 0.4).chain(bassFilter, bassEnvelope);
//		bass.start();
//
//		var bassPart = new Tone.Part(function(time, note){
//			bass.frequency.setValueAtTime(note, time);
//		    bassEnvelope.triggerAttack(time);
//		}, [["0:0:0", "A2"],
//            ["0:0:1", "A2"],
//			["1:2:1", "G2"]
////			["0:2:2", "C2"],
////			["0:3:2", "A1"]
//           ]).start(0);
//
//		//BLEEP
//		var bleepEnvelope = new Tone.AmplitudeEnvelope({
//		    "attack": 0.01,
//		    "decay": 0.4,
//		    "sustain": 0,
//		    "release": 0,
//		}).toMaster();
//
//
//		var bleep = new Tone.Oscillator("A4").connect(bleepEnvelope);
//		bleep.start();
//
//		var bleepLoop = new Tone.Loop(function(time){
//			 bleepEnvelope.triggerAttack(time);
//		}, "2n").start(0);
//
		//KICK
//		var kickEnvelope = new Tone.AmplitudeEnvelope({
//		    "attack": 0.01,
//		    "decay": 0.2,
//		    "sustain": 0,
//		    "release": 0
//		}).toMaster();
//
//		var kick = new Tone.Oscillator("A2").connect(kickEnvelope).start();
//
//		kickSnapEnv = new Tone.FrequencyEnvelope({
//		    "attack": 0.005,
//		    "decay": 0.01,
//		    "sustain": 0,
//		    "release": 0,
//		    "baseFrequency": "A2",
//		    "octaves": 2.7
//		}).connect(kick.frequency);
//
//		var kickPart = new Tone.Part(function(time){
//			kickEnvelope.triggerAttack(time);
//			kickSnapEnv.triggerAttack(time);
//		}, ["0", "0:0:3", "0:2:0", "0:3:1"]).start(0);
//
////		//TRANSPORT
//		Tone.Transport.loopStart = 0;
//		Tone.Transport.loopEnd = "1:0";
//		Tone.Transport.loop = true;
////Tone.Transport.bpm.value = 120;
////
//Tone.Transport.start()