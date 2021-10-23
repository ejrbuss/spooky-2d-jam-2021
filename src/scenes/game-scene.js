import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { BEATMAP } from "../beatmap.js";
import { CONFIG } from "../config.js";

const FPS_AVE_FACTOR = 0.1;

const H_CENTER = CONFIG.width / 2;
const V_CENTER = CONFIG.height / 2;
const LANE_WIDTH = 5 * CONFIG.widthPercentUnit;
const LANE_HEIGHT = CONFIG.height - 10 * CONFIG.heightPercentUnit;
const PLAYER_Y = LANE_HEIGHT;
const YOU_Y = CONFIG.height - LANE_HEIGHT;

const PLAYER_SPEED = 0.05 * CONFIG.widthPercentUnit;
const YOU_SPEED = 0.05 * CONFIG.widthPercentUnit;

const TEMPO = 80; // in bpm
const QUARTER_BEAT_MS = (60 * 1000) / (TEMPO * 4);
const BEAT_MS = QUARTER_BEAT_MS * 4;
const NOTE_TRAVEL_BEATS = 4;
const NOTE_TRAVEL_MS = NOTE_TRAVEL_BEATS * BEAT_MS;
const NOTE_SPEED = (PLAYER_Y - YOU_Y) / NOTE_TRAVEL_MS;

export class GameScene extends Phaser.Scene {
	constructor() {
		super(GameScene.name);
		this.fps = 0;
		this.scrollSpeed = 0.4;
		this.quarterBeatCount = 0;
	}

	preload() {
		this.load.image(ASSETS.images.gameBackground, ASSETS.images.gameBackground);
		this.load.image(ASSETS.images.player, ASSETS.images.player);
	}

	create() {
		this.background = this.add.tileSprite(
			CONFIG.width / 2,
			CONFIG.height / 2,
			CONFIG.width,
			CONFIG.height,
			ASSETS.images.gameBackground
		);

		this.redLane = this.add.rectangle(
			CONFIG.width / 2 - 2 * LANE_WIDTH,
			CONFIG.height / 2,
			LANE_WIDTH,
			LANE_HEIGHT,
			Phaser.Display.Color.ValueToColor("rgb(230, 100, 100)").color
		);
		this.redLane.setAlpha(0.7);
		this.redLane.setName("redLane");

		this.greenLane = this.add.rectangle(
			CONFIG.width / 2,
			CONFIG.height / 2,
			LANE_WIDTH,
			LANE_HEIGHT,
			Phaser.Display.Color.ValueToColor("rgb(100, 230, 100)").color
		);
		this.greenLane.setAlpha(0.7);
		this.greenLane.setName("greenLane");

		this.blueLane = this.add.rectangle(
			CONFIG.width / 2 + 2 * LANE_WIDTH,
			CONFIG.height / 2,
			LANE_WIDTH,
			LANE_HEIGHT,
			Phaser.Display.Color.ValueToColor("rgb(100, 100, 230)").color
		);
		this.blueLane.setAlpha(0.7);
		this.blueLane.setName("blueLane");

		this.lanes = [this.redLane, this.greenLane, this.blueLane];

		this.onBeatLaneTween = this.add.tween({
			targets: this.lanes,
			duration: QUARTER_BEAT_MS,
			yoyo: true,
			displayWidth: {
				from: LANE_WIDTH,
				to: LANE_WIDTH * 1.1,
			},
			paused: true,
		});

		this.player = this.add.sprite(
			CONFIG.width / 2,
			PLAYER_Y,
			ASSETS.images.player
		);
		this.player.setDisplaySize(LANE_WIDTH, LANE_WIDTH);

		this.you = this.add.sprite(CONFIG.width / 2, YOU_Y, ASSETS.images.you);
		this.you.setDisplaySize(LANE_WIDTH, LANE_WIDTH);

		/** @type {Phaser.GameObjects.Rectangle} */
		this.playerTargetLane = this.greenLane;
		/** @type {Phaser.GameObjects.Rectangle} */
		this.youTargetLane = this.greenLane;

		this.input.keyboard.on(
			Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
			({ keyCode }) => {
				if (
					keyCode === Phaser.Input.Keyboard.KeyCodes.A ||
					keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT
				) {
					this.pressLeft();
					return;
				}
				if (
					keyCode === Phaser.Input.Keyboard.KeyCodes.D ||
					keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT
				) {
					this.pressRight();
					return;
				}
			}
		);

		this.quarterBeatTimer = this.time.addEvent({
			delay: QUARTER_BEAT_MS,
			loop: true,
			callback: () => this.onQuarterBeat(),
		});

		this.notes = [];
		this.findNextNote();

		if (CONFIG.debug) {
			this.debug = this.add.text(0, 0, "debug", {
				fontSize: 24,
				fontFamily: "monospace",
			});
		}
	}

	pressLeft() {
		if (this.playerTargetLane === this.redLane) {
			return;
		}
		if (this.playerTargetLane === this.greenLane) {
			this.playerTargetLane = this.redLane;
			return;
		}
		if (this.playerTargetLane === this.blueLane) {
			this.playerTargetLane = this.greenLane;
			return;
		}
	}

	pressRight() {
		if (this.playerTargetLane === this.redLane) {
			this.playerTargetLane = this.greenLane;
			return;
		}
		if (this.playerTargetLane === this.greenLane) {
			this.playerTargetLane = this.blueLane;
			return;
		}
		if (this.playerTargetLane === this.blueLane) {
			return;
		}
	}

	/**
	 * Called every quarter of a beat
	 */
	onQuarterBeat() {
		// lane pulse
		if (this.quarterBeatCount % 4 === 0) {
			if (this.onBeatLaneTween.paused) {
				this.onBeatLaneTween.play();
			} else {
				this.onBeatLaneTween.restart();
			}
		}
		this.quarterBeatCount += 1;

		if (this.nextNoteCount === this.quarterBeatCount) {
			this.emitNote();
			this.findNextNote();
		}
	}

	emitNote() {
		const note = this.add.circle(
			this.youTargetLane.x,
			YOU_Y,
			LANE_WIDTH / 3,
			Phaser.Display.Color.ValueToColor("rgb(255, 255, 255)").color
		);
		this.notes.push(note);
	}

	findNextNote() {
		const length = BEATMAP.length;
		for (
			let count = this.quarterBeatCount + NOTE_TRAVEL_BEATS * 4 + 1;
			count < length;
			count += 1
		) {
			const note = BEATMAP[count];
			if (note !== null) {
				// nextNoteCount is the quarter beat to emit the note on
				// so we subtract the number of quarter beats it takes for the
				// note to travel
				this.nextNoteCount = count - NOTE_TRAVEL_BEATS * 4;
				this.youTargetLane = this.lanes[note];
				return;
			}
		}
		this.nextNoteLane = null;
		this.nextNoteCount = null;
	}

	/**
	 *
	 * @param {Phaser.GameObjects.Sprite} note
	 */
	noteSucceed(note) {
		this.add.tween({
			targets: note,
			duration: QUARTER_BEAT_MS,
			fillColor: {
				from: Phaser.Display.Color.ValueToColor("rgb(0, 255, 0)").color,
				to: Phaser.Display.Color.ValueToColor("rgb(0, 255, 0)").color,
			},
			onComplete: () => {
				note.destroy();
			},
		});
	}

	/**
	 *
	 * @param {Phaser.GameObjects.Sprite} note
	 */
	noteFail(note) {
		this.add.tween({
			targets: note,
			duration: QUARTER_BEAT_MS,
			fillColor: {
				from: Phaser.Display.Color.ValueToColor("rgb(255, 0, 0)").color,
				to: Phaser.Display.Color.ValueToColor("rgb(255, 0, 0)").color,
			},
			onComplete: () => {
				note.destroy();
			},
		});
	}

	/**
	 *
	 * @param {Phaser.GameObjects.Sprite} toMove
	 * @param {Phaser.GameObjects.Sprite} target
	 * @param {number} speed
	 * @returns
	 */
	moveToTarget(toMove, target, maxDelta) {
		if (toMove.x === target.x) {
			return;
		}
		if (toMove.x > target.x) {
			toMove.setX(Math.max(target.x, toMove.x - maxDelta));
		} else {
			toMove.setX(Math.min(target.x, toMove.x + maxDelta));
		}
	}

	update(time, delta) {
		// scroll screen
		// this.cameras.default.setScroll(0, this.cameras.default.scrollY + delta);

		if (CONFIG.debug && time) {
			this.debug.setText(JSON.stringify(this.debugData(delta), null, 2));
			this.debug.setX(this.debug.width / 2);
			this.debug.setY(this.debug.height / 2);
		}

		// scroll background
		this.background.setTilePosition(
			0,
			this.background.tilePositionY - delta * this.scrollSpeed
		);

		this.moveToTarget(this.player, this.playerTargetLane, delta * PLAYER_SPEED);
		this.moveToTarget(this.you, this.youTargetLane, delta * YOU_SPEED);

		this.notes.forEach((note) => {
			note.setY(note.y + delta * NOTE_SPEED);
		});
		if (this.notes.length > 0) {
			const nextNote = this.notes[0];
			// Note has reached the end of the lane
			if (nextNote.y >= PLAYER_Y) {
				this.notes.shift();
				if (nextNote.x === this.playerTargetLane.x) {
					this.noteSucceed(nextNote);
				} else {
					this.noteFail(nextNote);
				}
			}
		}
	}

	debugData(delta) {
		// Rolling average
		this.fps *= 1 - FPS_AVE_FACTOR;
		this.fps += (1000 / delta) * FPS_AVE_FACTOR;
		return {
			scene: this.scene.key,
			fps: Math.floor(this.fps),
			target: this.playerTargetLane.name,
		};
	}
}
