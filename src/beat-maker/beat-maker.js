const beatMaker = {
	songBPM: 80,
	userLatencyInterval: 150,
	audioSource: "../assets/audio/game-song.mp3",
	tick: new Audio("tick.mp3"),
	isBeatPlaying: false,
	isRecording: false,
	keyToLane: {
		j: 0,
		k: 1,
		l: 2,
	},
	keyEvents: [],
	quarterBeatCount: null,
	lastQuarterBeat: null,
	startTime: null,
	quarterBeatInterval: null,
	beatBox: null,
	/** @type {Audio} */ audio: null,

	init() {
		$("#start-recording-btn").on("click", beatMaker.startRecording);
		$("#stop-btn").on("click", beatMaker.stopRecording);
		window.addEventListener("keydown", (event) => {
			if (beatMaker.isRecording) {
				beatMaker.keyEvents.push([Date.now(), event.key]);
			}
		});
		beatMaker.beatBox = $("#beat-box");
	},

	// --- RECORDING ---

	heartBeat() {
		if (!beatMaker.isRecording) {
			return;
		}
		const now = Date.now();
		const nextQuarterBeat =
			beatMaker.lastQuarterBeat + beatMaker.quarterBeatInterval;
		if (now >= nextQuarterBeat) {
			beatMaker.quarterBeatCount += 1;
			beatMaker.lastQuarterBeat = nextQuarterBeat;
			if (beatMaker.isBeatPlaying && beatMaker.quarterBeatCount % 4 === 0) {
				beatMaker.tick.play();
				if (beatMaker.beatBox.css("opacity") === "1") {
					beatMaker.beatBox.css("opacity", 0.5);
				} else {
					beatMaker.beatBox.css("opacity", 1);
				}
			}
			if (beatMaker.quarterBeatCount === 16) {
				beatMaker.audio.play();
			}
		}
		if (beatMaker.isBeatPlaying) {
		}
		setTimeout(beatMaker.heartBeat);
	},

	startRecording(event) {
		beatMaker.isRecording = true;
		beatMaker.isBeatPlaying = true;

		beatMaker.audio = new Audio(beatMaker.audioSource);
		beatMaker.keyEvents = [];
		beatMaker.quarterBeatInterval = (60 * 1000) / (beatMaker.songBPM * 4);
		beatMaker.quarterBeatCount = 0;
		const now = Date.now();
		beatMaker.lastQuarterBeat = now;
		beatMaker.startTime = now;
		beatMaker.tick.play();

		beatMaker.heartBeat();
	},

	stopRecording() {
		beatMaker.isRecording = false;
		beatMaker.audio.pause();
		beatMaker.processRecording();
	},

	// --- PROCESSING ---

	processRecording() {
		const beatmap = [];
		const timeOffset =
			beatMaker.startTime +
			beatMaker.quarterBeatInterval * 16 +
			beatMaker.userLatencyInterval;
		beatMaker.keyEvents.forEach((event) => {
			const [keyTime, key] = event;
			const time = keyTime - timeOffset;
			const lane = beatMaker.keyToLane[key];
			if (typeof lane !== "number") {
				return;
			}
			const closestQuarterBeat = Math.floor(
				time / beatMaker.quarterBeatInterval
			);
			while (beatmap.length < closestQuarterBeat) {
				beatmap.push(null);
			}
			beatmap.push(lane);
		});
		console.log(JSON.stringify(beatmap, null, "\t"));
	},
};

$(document).ready(function () {
	beatMaker.init();
});
