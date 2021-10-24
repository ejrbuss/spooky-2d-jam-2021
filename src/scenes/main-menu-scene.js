import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { CONFIG } from "../config.js";
import { GameScene } from "./game-scene.js";

const BLUR_SPEED = 0.05;

export class MainMenuScene extends Phaser.Scene {
	constructor() {
		super(MainMenuScene.name);
	}

	preload() {
		this.load.image(
			ASSETS.images.mainMenuBackground,
			ASSETS.images.mainMenuBackground
		);
		this.targetShadowBlur = 0;
		this.currentShadowBlur = 0;
	}

	create() {
		this.background = this.add.image(
			CONFIG.width / 2,
			CONFIG.height / 2,
			ASSETS.images.mainMenuBackground
		);
		this.background.setDisplaySize(CONFIG.width, CONFIG.height);

		this.playButton = this.add.text(0, 0, "START", {
			fontSize: 4 * CONFIG.widthPercentUnit,
			fontFamily: "TAHOMA",
		});
		this.playButton.setInteractive();
		this.playButton.setPadding(
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit
		);
		this.playButton.setX(CONFIG.width / 2 - this.playButton.width / 2);
		this.playButton.setY(CONFIG.height / 2 - this.playButton.height / 2);
		this.playButton.setShadow(
			0,
			0,
			"rgb(255, 255, 255)",
			this.currentShadowBlur
		);
		// hover effect
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
			this.targetShadowBlur = 0.5 * CONFIG.widthPercentUnit;
		});
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
			this.targetShadowBlur = 0;
		});
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
			this.scene.start(GameScene.name);
		});
	}

	update(_time, delta) {
		if (this.targetShadowBlur !== this.currentShadowBlur) {
			if (this.targetShadowBlur > this.currentShadowBlur) {
				this.currentShadowBlur = Math.min(
					this.targetShadowBlur,
					this.currentShadowBlur + BLUR_SPEED * delta
				);
			} else {
				this.currentShadowBlur = Math.max(
					this.targetShadowBlur,
					this.currentShadowBlur - BLUR_SPEED * delta
				);
			}
			this.playButton.setShadowBlur(this.currentShadowBlur);
		}
	}
}
