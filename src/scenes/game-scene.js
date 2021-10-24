import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { BEATMAP } from "../beatmap.js";
import { CONFIG } from "../config.js";
import { MainMenuScene } from "./main-menu-scene.js";
const LANE_LEFT = 0;
const LANE_CENTER = 1;
const LANE_RIGHT = 2;

const DEPTH_UI = 4;
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

const NOTE_HEIGHT_RATIO = 0.6;

const PLAYER_UNIT = 15.0 * CONFIG.widthPercentUnit;
const PLAYER_Y = CONFIG.height - 0.75 * PLAYER_UNIT;
const PLAYER_LANE_SHIFT = 21.0 * CONFIG.widthPercentUnit;

const YOU_UNIT = 4.0 * CONFIG.widthPercentUnit;
const YOU_Y = V_CENTER - 16 * CONFIG.heightPercentUnit;
const YOU_LANE_SHIFT = 3 * CONFIG.widthPercentUnit;

const PLAYER_SPEED = 0.1 * CONFIG.widthPercentUnit;
const YOU_SPEED = 0.03 * CONFIG.widthPercentUnit;
const SCROLL_SPEED = 0.01 * CONFIG.heightPercentUnit;

const TEMPO = 80; // in bpm
const QUARTER_BEAT_MS = (60 * 1000) / (TEMPO * 4);
const BEAT_MS = QUARTER_BEAT_MS * 4;
const NOTE_TRAVEL_BEATS = 2;
const NOTE_TRAVEL_MS = NOTE_TRAVEL_BEATS * BEAT_MS;
const NOTE_LATENCY_MS = QUARTER_BEAT_MS / 16;
const SONG_LATENCY_MS = 4;

const GHOST_COUNT = 1;

const COUNT_IN_QUARTER_BEAT_COUNT = Math.ceil(1000 / QUARTER_BEAT_MS);

export class GameScene extends Phaser.Scene {
	constructor() {
		super(GameScene.name);
	}

	preload() {
		this.load.image(ASSETS.images.gameBackground, ASSETS.images.gameBackground);
		this.load.image(ASSETS.images.deathVision, ASSETS.images.deathVision);
		this.load.image(ASSETS.images.lanes, ASSETS.images.lanes);
		this.load.image(ASSETS.images.lanesGlow, ASSETS.images.lanesGlow);
		this.load.image(ASSETS.images.player, ASSETS.images.player);
		this.load.image(ASSETS.images.you, ASSETS.images.you);
		this.load.image(
			ASSETS.images.notes[LANE_LEFT],
			ASSETS.images.notes[LANE_LEFT]
		);
		this.load.image(
			ASSETS.images.notes[LANE_CENTER],
			ASSETS.images.notes[LANE_CENTER]
		);
		this.load.image(
			ASSETS.images.notes[LANE_RIGHT],
			ASSETS.images.notes[LANE_RIGHT]
		);
		this.load.image(ASSETS.images.noteSuccess, ASSETS.images.noteSuccess);
		this.load.image(ASSETS.images.noteFail, ASSETS.images.noteFail);
		this.load.image(ASSETS.images.ghost, ASSETS.images.ghost);

		this.load.audio(ASSETS.audio.gameSong, ASSETS.audio.gameSong);
		this.load.audio(ASSETS.audio.hit, ASSETS.audio.hit);
		this.load.audio(ASSETS.audio.miss, ASSETS.audio.miss);
	}

	create() {
		this.fps = 0;
		this.quarterBeatCount = -COUNT_IN_QUARTER_BEAT_COUNT;
		this.score = 0;
		this.combo = 0;
		this.health = 100;
		this.nextNoteSound = null;

		this.background = this.add.tileSprite(
			H_CENTER,
			V_CENTER,
			BACKGROUND_WIDTH,
			BACKGROUND_WIDTH / (CONFIG.width / CONFIG.height),
			ASSETS.images.gameBackground
		);
		this.background.setDisplaySize(CONFIG.width, CONFIG.height);
		this.background.setDepth(DEPTH_BACKGROUND);

		this.deathVision = this.add.image(
			H_CENTER,
			V_CENTER,
			ASSETS.images.deathVision
		);
		this.deathVision.setDisplaySize(CONFIG.width, CONFIG.height);
		this.deathVision.setDepth(DEPTH_UI);
		this.deathVision.setAlpha(0);

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

		this.notes = [];
		this.findNextNote();

		this.scoreTitleText = this.add.text(
			H_CENTER,
			1.5 * CONFIG.widthPercentUnit,
			"Score",
			{
				fontSize: Math.floor(1 * CONFIG.widthPercentUnit),
				fontFamily: "Tahoma",
			}
		);
		this.scoreTitleText.setDepth(DEPTH_UI);
		this.scoreTitleText.setX(H_CENTER - this.scoreTitleText.width / 2);

		this.scoreText = this.add.text(H_CENTER, 3 * CONFIG.widthPercentUnit, "", {
			fontSize: Math.floor(3 * CONFIG.widthPercentUnit),
			fontFamily: "Tahoma",
		});
		this.scoreText.setDepth(DEPTH_UI);

		this.comboText = this.add.text(H_CENTER, 7 * CONFIG.widthPercentUnit, "", {
			fontSize: Math.floor(1.5 * CONFIG.widthPercentUnit),
			fontFamily: "Tahoma",
		});
		this.comboText.setDepth(DEPTH_UI);

		this.updateScoreText();

		if (CONFIG.debug) {
			this.debug = this.add.text(0, 0, "debug", {
				fontSize: 24,
				fontFamily: "monospace",
			});
		}
		this.gameSong = this.sound.add(ASSETS.audio.gameSong, {
			delay: SONG_LATENCY_MS,
		}); //, { volume: 0.1 });
		this.hitSound = this.sound.add(ASSETS.audio.hit, { volume: 0.7 });
		this.missSound = this.sound.add(ASSETS.audio.miss, { volume: 1 });

		this.gameSong.once(Phaser.Sound.Events.COMPLETE, () => {
			this.cameras.main.fadeOut(1000);
			this.time.delayedCall(1000, () => {
				// TODO replace with outro scene
				this.scene.start(MainMenuScene.name);
			});
		});
		this.quarterBeatTimer = this.time.addEvent({
			delay: QUARTER_BEAT_MS,
			loop: true,
			callback: () => this.onQuarterBeat(),
		});

		// ghosties
		for (let i = 0; i < GHOST_COUNT; i += 1) {}
		this.ghost = this.add.sprite(H_CENTER, V_CENTER, ASSETS.images.ghost);
		this.ghost.setDisplaySize(YOU_UNIT, YOU_UNIT);
		this.ghost.setDepth(DEPTH_UI);

		this.cameras.main.fadeIn(1000);
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
		if (this.quarterBeatCount === 0) {
			this.gameSong.play();
		}
		this.quarterBeatCount += 1;
		if (this.nextNoteCount === this.quarterBeatCount) {
			this.emitNote();
			this.findNextNote();
		}
		if (this.nextNoteSound) {
			this.nextNoteSound.play();
			this.nextNoteSound = null;
		}
		if (this.quarterBeatCount % 4 === 0) {
			if (this.onBeatLaneTween.paused) {
				this.onBeatLaneTween.play();
			} else {
				this.onBeatLaneTween.restart();
			}
		}
	}

	emitNote() {
		const lane = this.youTargetLane;
		const fromWidth = 1.0 * CONFIG.widthPercentUnit;
		const toWidth = 10.0 * CONFIG.widthPercentUnit;
		const fromHeight = fromWidth * NOTE_HEIGHT_RATIO;
		const toHeight = toWidth * NOTE_HEIGHT_RATIO;
		const fromX = this.targetX(YOU_LANE_SHIFT * 0.8, lane);
		const toX = this.targetX(PLAYER_LANE_SHIFT * 0.9, lane);
		const fromY = YOU_Y + 1.0 * CONFIG.heightPercentUnit;
		const toY = PLAYER_Y;
		const note = this.add.sprite(fromX, fromY, ASSETS.images.notes[lane]);
		note.setDisplaySize(fromWidth, fromHeight);
		note.setDepth(DEPTH_NOTE);
		this.add.tween({
			targets: note,
			duration: NOTE_TRAVEL_MS - NOTE_LATENCY_MS,
			displayWidth: { from: fromWidth, to: toWidth },
			displayHeight: { from: fromHeight, to: toHeight },
			x: { from: fromX, to: toX },
			y: { from: fromY, to: toY },
			ease: Phaser.Math.Easing.Circular.In,
			onComplete: () => {
				if (this.playerTargetLane === lane) {
					return this.noteHit(note);
				} else {
					return this.noteMiss(note);
				}
			},
		});
	}

	findNextNote() {
		const length = BEATMAP.length;
		for (
			let count = this.quarterBeatCount + NOTE_TRAVEL_BEATS * 4 + 1;
			count < length;
			count += 1
		) {
			const lane = BEATMAP[count];
			if (typeof lane === "number") {
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
	noteHit(note) {
		this.nextNoteSound = this.hitSound;
		this.health = Math.min(100, this.health + 5);
		this.combo += 1;
		this.score += 10 * this.combo;
		note.setTexture(ASSETS.images.noteSuccess);
		this.add.tween({
			targets: note,
			duration: QUARTER_BEAT_MS,
			alpha: { from: 1, to: 0 },
			scale: { from: 1, to: 2 },
			onComplete: () => {
				note.destroy();
			},
		});
		this.updateScoreText();
	}

	/**
	 *
	 * @param {Phaser.GameObjects.Sprite} note
	 */
	noteMiss(note) {
		this.nextNoteSound = this.missSound;
		this.health -= 15;
		this.combo = 0;
		note.setTexture(ASSETS.images.noteFail);
		this.add.tween({
			targets: note,
			duration: QUARTER_BEAT_MS,
			duration: QUARTER_BEAT_MS,
			alpha: { from: 1, to: 0 },
			scale: { from: 1, to: 2 },
			onComplete: () => {
				note.destroy();
			},
		});
		this.updateScoreText();
		if (this.health <= 0) {
			this.gameSong.stop();
			this.cameras.main.fadeOut(1000);
			this.time.delayedCall(1000, () => {
				// TODO replace with failure scene
				this.scene.start(MainMenuScene.name);
			});
		}
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
			toMove.setRotation(0);
			return;
		}
		if (toMove.x > targetX) {
			toMove.setX(Math.max(targetX, toMove.x - maxDelta));
			toMove.setRotation(-Math.PI / 12);
		} else {
			toMove.setX(Math.min(targetX, toMove.x + maxDelta));
			toMove.setRotation(+Math.PI / 12);
		}
	}

	targetX(shift, lane) {
		switch (lane) {
			case LANE_LEFT:
				return (H_CENTER - shift) * 1.01; //add slight 1% compensation to make up for uneven lanes
			case LANE_CENTER:
				return H_CENTER;
			case LANE_RIGHT:
				return (H_CENTER + shift) * 0.995;
		}
	}

	updateScoreText() {
		this.scoreText.setText(this.score.toLocaleString());
		this.comboText.setText("COMBO ×" + this.combo.toLocaleString());
		this.scoreText.setX(H_CENTER - this.scoreText.width / 2);
		this.comboText.setX(H_CENTER - this.comboText.width / 2);
		this.deathVision.setAlpha(1 - this.health / 100);
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

		// move player
		this.moveToTarget(
			this.player,
			this.targetX(PLAYER_LANE_SHIFT, this.playerTargetLane),
			delta * PLAYER_SPEED
		);

		// move you
		this.moveToTarget(
			this.you,
			this.targetX(YOU_LANE_SHIFT, this.youTargetLane),
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
