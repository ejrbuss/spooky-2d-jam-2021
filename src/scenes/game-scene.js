import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { BEATMAP } from "../beatmap.js";
import { CONFIG } from "../config.js";

const LANE_LEFT = 0;
const LANE_CENTER = 1;
const LANE_RIGHT = 2;

const DEPTH_PLAYER = 3;
const DEPTH_NOTE = 2;
const DEPTH_LANES = 1;
const DEPTH_BACKGROUND = 0;

const LANE_NAMES = ["left", "center", "right"];

const FPS_AVE_FACTOR = 0.1;

const BACKGROUND_WIDTH = 1920;
const BACKGROUND_HEIGHT = 10800;

const H_CENTER = CONFIG.width / 2;
const V_CENTER = CONFIG.height / 2;

const PLAYER_UNIT = 10.0 * CONFIG.widthPercentUnit;
const PLAYER_Y = CONFIG.height - 0.75 * PLAYER_UNIT;
const PLAYER_CENTER_X = H_CENTER - 1.0 * CONFIG.widthPercentUnit;
const PLAYER_LANE_SHIFT = 21.0 * CONFIG.widthPercentUnit;

const YOU_UNIT = 4.0 * CONFIG.widthPercentUnit;
const YOU_Y = V_CENTER - 16 * CONFIG.heightPercentUnit;
const YOU_CENTER_X = H_CENTER + 0.7 * CONFIG.widthPercentUnit;
const YOU_LANE_SHIFT = 3 * CONFIG.widthPercentUnit;

const PLAYER_SPEED = 0.05 * CONFIG.widthPercentUnit;
const YOU_SPEED = 0.025 * CONFIG.widthPercentUnit;
const SCROLL_SPEED = 0.01 * CONFIG.heightPercentUnit;

const TEMPO = 80; // in bpm
const QUARTER_BEAT_MS = (60 * 1000) / (TEMPO * 4);
const BEAT_MS = QUARTER_BEAT_MS * 4;
const NOTE_TRAVEL_BEATS = 4;
const NOTE_TRAVEL_MS = NOTE_TRAVEL_BEATS * BEAT_MS;

export class GameScene extends Phaser.Scene {
	constructor() {
		super(GameScene.name);
		this.fps = 0;
		this.quarterBeatCount = 0;
	}

	preload() {
		this.load.image(ASSETS.images.gameBackground, ASSETS.images.gameBackground);
		this.load.image(ASSETS.images.lanes, ASSETS.images.lanes);
		this.load.image(ASSETS.images.lanesGlow, ASSETS.images.lanesGlow);
		this.load.image(ASSETS.images.player, ASSETS.images.player);
		this.load.image(ASSETS.images.you, ASSETS.images.you);
	}

	create() {
		this.background = this.add.tileSprite(
			H_CENTER,
			V_CENTER,
			BACKGROUND_WIDTH,
			BACKGROUND_WIDTH / (CONFIG.width / CONFIG.height),
			ASSETS.images.gameBackground
		);
		this.background.setDisplaySize(CONFIG.width, CONFIG.height);
		this.background.setDepth(DEPTH_BACKGROUND);

		this.lanes = this.add.sprite(H_CENTER, V_CENTER, ASSETS.images.lanes);
		this.lanes.setDisplaySize(CONFIG.width, CONFIG.height);
		this.lanes.setDepth(DEPTH_LANES);

		this.lanesGlow = this.add.sprite(
			H_CENTER,
			V_CENTER,
			ASSETS.images.lanesGlow
		);
		this.lanesGlow.setDisplaySize(CONFIG.width, CONFIG.height);
		this.lanesGlow.setAlpha(0.5);
		this.lanesGlow.setDepth(DEPTH_LANES);

		this.onBeatLaneTween = this.add.tween({
			targets: this.lanesGlow,
			duration: QUARTER_BEAT_MS * 2,
			yoyo: true,
			alpha: {
				from: 0.5,
				to: 1,
			},
			ease: Phaser.Math.Easing.Sine.InOut,
			paused: true,
		});

		this.player = this.add.sprite(H_CENTER, PLAYER_Y, ASSETS.images.player);
		this.player.setDisplaySize(PLAYER_UNIT, PLAYER_UNIT);
		this.player.setDepth(DEPTH_PLAYER);

		this.you = this.add.sprite(H_CENTER, YOU_Y, ASSETS.images.you);
		this.you.setDisplaySize(YOU_UNIT, YOU_UNIT);
		this.you.setDepth(DEPTH_PLAYER);

		/** @type {Phaser.GameObjects.Rectangle} */
		this.playerTargetLane = LANE_CENTER;
		/** @type {Phaser.GameObjects.Rectangle} */
		this.youTargetLane = LANE_CENTER;

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
		if (this.playerTargetLane === LANE_CENTER) {
			return (this.playerTargetLane = LANE_LEFT);
		}
		if (this.playerTargetLane === LANE_RIGHT) {
			return (this.playerTargetLane = LANE_CENTER);
		}
	}

	pressRight() {
		if (this.playerTargetLane === LANE_LEFT) {
			return (this.playerTargetLane = LANE_CENTER);
		}
		if (this.playerTargetLane === LANE_CENTER) {
			return (this.playerTargetLane = LANE_RIGHT);
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
		const lane = this.youTargetLane;
		const fromRadius = YOU_UNIT / 8;
		const toRadius = PLAYER_UNIT / 4;
		const fromX = this.targetX(YOU_CENTER_X, YOU_LANE_SHIFT * 0.8, lane);
		const toX = this.targetX(PLAYER_CENTER_X, PLAYER_LANE_SHIFT * 0.9, lane);
		const fromY = YOU_Y;
		const toY = PLAYER_Y;
		const note = this.add.circle(
			fromX,
			fromY,
			fromRadius,
			Phaser.Display.Color.ValueToColor("rgb(255, 255, 255)").color
		);
		note.setDepth(DEPTH_NOTE);
		this.add.tween({
			targets: note,
			duration: NOTE_TRAVEL_MS,
			radius: { from: fromRadius, to: toRadius },
			x: { from: fromX, to: toX },
			y: { from: fromY, to: toY },
			ease: Phaser.Math.Easing.Quadratic.In,
			onComplete: () => {
				if (this.playerTargetLane === lane) {
					return this.noteSucceed(note);
				} else {
					return this.noteFail(note);
				}
			},
		});
	}

	findNextNote() {
		const length = BEATMAP.length;
		for (
			let count = this.quarterBeatCount + NOTE_TRAVEL_BEATS * 4 + 1;
			true; // count < length;
			count += 1
		) {
			const lane = BEATMAP[count % length];
			if (lane !== null) {
				// nextNoteCount is the quarter beat to emit the note on
				// so we subtract the number of quarter beats it takes for the
				// note to travel
				this.nextNoteCount = count - NOTE_TRAVEL_BEATS * 4;
				this.youTargetLane = lane;
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
	moveToTarget(toMove, targetX, maxDelta) {
		if (toMove.x === targetX) {
			return;
		}
		if (toMove.x > targetX) {
			toMove.setX(Math.max(targetX, toMove.x - maxDelta));
		} else {
			toMove.setX(Math.min(targetX, toMove.x + maxDelta));
		}
	}

	targetX(center, shift, lane) {
		switch (lane) {
			case 0:
				return center - shift;
			case 1:
				return center;
			case 2:
				return center + shift;
		}
	}

	update(time, delta) {
		if (CONFIG.debug && time) {
			this.debug.setText(JSON.stringify(this.debugData(delta), null, 2));
		}

		// scroll background
		this.background.setTilePosition(
			0,
			this.background.tilePositionY - delta * SCROLL_SPEED
		);

		this.moveToTarget(
			this.player,
			this.targetX(PLAYER_CENTER_X, PLAYER_LANE_SHIFT, this.playerTargetLane),
			delta * PLAYER_SPEED
		);
		this.moveToTarget(
			this.you,
			this.targetX(YOU_CENTER_X, YOU_LANE_SHIFT, this.youTargetLane),
			delta * YOU_SPEED
		);
	}

	debugData(delta) {
		// Rolling average
		this.fps *= 1 - FPS_AVE_FACTOR;
		this.fps += (1000 / delta) * FPS_AVE_FACTOR;
		return {
			scene: this.scene.key,
			fps: Math.floor(this.fps),
			playerTarget: LANE_NAMES[this.playerTargetLane],
			youTarget: LANE_NAMES[this.youTargetLane],
		};
	}
}
