import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { CONFIG } from "../config.js";

const FPS_AVE_FACTOR = 0.1;
const PLAYER_SPEED = 1;

export class GameScene extends Phaser.Scene {
	constructor() {
		super(GameScene.name);
		this.fps = 0;
		this.scrollSpeed = 0.4;
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

		const laneWidth = 5 * CONFIG.widthPercentUnit;
		const laneHeight = CONFIG.height - 10 * CONFIG.heightPercentUnit;
		this.redLane = this.add.rectangle(
			CONFIG.width / 2 - 2 * laneWidth,
			CONFIG.height / 2,
			laneWidth,
			laneHeight,
			Phaser.Display.Color.ValueToColor("rgb(230, 100, 100)").color
		);
		this.redLane.setAlpha(0.7);
		this.redLane.setName("redLane");

		this.greenLane = this.add.rectangle(
			CONFIG.width / 2,
			CONFIG.height / 2,
			laneWidth,
			laneHeight,
			Phaser.Display.Color.ValueToColor("rgb(100, 230, 100)").color
		);
		this.greenLane.setAlpha(0.7);
		this.greenLane.setName("greenLane");

		this.blueLane = this.add.rectangle(
			CONFIG.width / 2 + 2 * laneWidth,
			CONFIG.height / 2,
			laneWidth,
			laneHeight,
			Phaser.Display.Color.ValueToColor("rgb(100, 100, 230)").color
		);
		this.blueLane.setAlpha(0.7);
		this.blueLane.setName("blueLane");

		this.lanes = [this.redLane, this.greenLane, this.blueLane];

		this.player = this.add.sprite(
			CONFIG.width / 2,
			laneHeight,
			ASSETS.images.player
		);
		this.player.setDisplaySize(laneWidth, laneWidth);

		/** @type {Phaser.GameObjects.Rectangle} */
		this.targetLane = this.greenLane;

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

		if (CONFIG.debug) {
			this.debug = this.add.text(0, 0, "debug", {
				fontSize: 24,
				fontFamily: "monospace",
			});
		}
	}

	pressLeft() {
		console.log("here");
		if (this.targetLane === this.redLane) {
			return;
		}
		if (this.targetLane === this.greenLane) {
			this.targetLane = this.redLane;
			return;
		}
		if (this.targetLane === this.blueLane) {
			this.targetLane = this.greenLane;
			return;
		}
	}

	pressRight() {
		console.log("here");
		if (this.targetLane === this.redLane) {
			this.targetLane = this.greenLane;
			return;
		}
		if (this.targetLane === this.greenLane) {
			this.targetLane = this.blueLane;
			return;
		}
		if (this.targetLane === this.blueLane) {
			return;
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

		// move to target
		if (this.player.x !== this.targetLane.x) {
			const playerX = this.player.x;
			const targetX = this.targetLane.x;
			if (playerX > targetX) {
				this.player.setX(Math.max(targetX, playerX - delta * PLAYER_SPEED));
			} else {
				this.player.setX(Math.min(targetX, playerX + delta * PLAYER_SPEED));
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
			target: this.targetLane.name,
		};
	}
}
