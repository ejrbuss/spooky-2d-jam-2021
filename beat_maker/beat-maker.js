let beatMaker = {
    songBPM: 80,
    bpmTimeInterval: 0,
    refreshRate: 0,
    // audio: new Audio('../src/audio/game-song.mp3'),
    audio: new Audio('../src/assets/audio/game-song.mp3'),
    tick: new Audio('tick.mp3'),
    isBeatPlaying: false,
    isRecording: false,
    laneKeyCodes: {
        lane1: 74, // j
        lane2: 75, // k
        lane3: 76, // l
    },
    laneSystemKeys: {
        lane1: 0,
        lane2: 1,
        lane3: 2,
    },
    recordedNotes: [],
    startTime: null,
    generatedScript: [],
    beatBox: null,

    init() {
        $('#start-recording-btn').on('click', beatMaker.startRecording);
        $('#stop-btn').on('click', beatMaker.stopRecording);
        $('#process-btn').on('click', beatMaker.processRecording);
        $('#playback-btn').on('click', beatMaker.playBack);

        beatMaker.bpmTimeInterval = Math.round(60000/beatMaker.songBPM);
        beatMaker.refreshRate = Math.round(beatMaker.bpmTimeInterval / 4);
        beatMaker.beatBox = $('#beat-box');
    },

    // --- RECORDING ---

    startRecording(event) {
        if (beatMaker.isRecording) {
            return;
        }

        // set everything up
        beatMaker.toggleBeat();
        let initialWaitTime = beatMaker.bpmTimeInterval * 4;
        beatMaker.startTime = event.timeStamp + initialWaitTime; //ccc is this good?

        // put 4 beats at the beginning of the song before playing.
        setTimeout(() => {
            // START!!
            beatMaker.toggleBeat();
            beatMaker.toggleRecord();
            beatMaker.audio.play();
        }, initialWaitTime);
    },

    toggleRecord() {
        if (beatMaker.isRecording) {
            $(window).off("keydown");

            beatMaker.isRecording = false;
        } else {
            $(window).on("keydown", function(event) {
                if (beatMaker.isValidKey(event.keyCode)) {
                    beatMaker.recordedNotes.push({time: event.timeStamp, key: event.keyCode});
                }
            });

            beatMaker.isRecording = true;
        }
    },

    isValidKey(keyCode) {
        return Object.values(beatMaker.laneKeyCodes).includes(keyCode);
    },

    stopRecording() {
        if (!beatMaker.isRecording) {
            return;
        }

        beatMaker.toggleRecord();
        beatMaker.audio.pause();
        beatMaker.audio = null;
        // beatMaker.toggleBeat();
    },

    // --- PROCESSING ---

    processRecording() {
        if (beatMaker.isRecording || beatMaker.startTime === null) {
            console.log('nothing to process, gtfo');
            return;
        }

        console.log(beatMaker.startTime);
        console.log(beatMaker.recordedNotes);

        // first note
        beatMaker.addNextNote(beatMaker.startTime, beatMaker.recordedNotes[0]);

        // i = 2 to skip the first note, which we already added
        for (let i = 2; i < beatMaker.recordedNotes.length; i++) {
            beatMaker.addNextNote(beatMaker.recordedNotes[i - 1].time, beatMaker.recordedNotes[i]);
        }

        console.log(beatMaker.generatedScript);
    },

    addNextNote(startTime, endObject) {
        // console.log('starttime', startTime);
        // console.log('endtime', endObject.time);

        let interval = endObject.time - startTime;

        // console.log('interval', interval);
        // how much space between the notes? that's how many little entries we need to put in
        let howManyToInsert = Math.round(interval / beatMaker.refreshRate);

        // console.log('how many to insert', howManyToInsert);

        // add in the "null" items, that are like the "silence" or "pauses"
        for (let i = 0; i < howManyToInsert; i++) {
            beatMaker.generatedScript.push(null);
        }

        let noteToInsert;
        switch(endObject.key) {
            case beatMaker.laneKeyCodes.lane1: 
                noteToInsert = beatMaker.laneSystemKeys.lane1;
                break;
            case beatMaker.laneKeyCodes.lane2:
                noteToInsert = beatMaker.laneSystemKeys.lane2;
                break;
            case beatMaker.laneKeyCodes.lane3:
                noteToInsert = beatMaker.laneSystemKeys.lane3;
                break;
            default:
                alert("fuck something broke");
                return;
        }

        beatMaker.generatedScript.push(noteToInsert)
    },

    // --- BEAT ---

    toggleBeat() {
        if (beatMaker.isBeatPlaying) {
            beatMaker.isBeatPlaying = false;
        } else {
            beatMaker.isBeatPlaying = true;
            beatMaker.playBeat();
        }
    },

    playBeat() {
        if (beatMaker.isBeatPlaying) {
            setTimeout(function() {beatMaker.playBeat();}, beatMaker.bpmTimeInterval-2); //ccc WHY MINUS 2?????
            beatMaker.tick.play();
            if (beatMaker.beatBox.css('opacity') === '1') {
                beatMaker.beatBox.css('opacity', 0.5);
            } else {
                beatMaker.beatBox.css('opacity', 1);
            }
        }
    },


    // --- PLAYBACK ---
    startPlayback() {
        
    },
    
};


$(document).ready(function () {
    beatMaker.init();
});
