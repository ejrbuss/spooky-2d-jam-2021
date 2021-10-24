import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { CONFIG } from "../config.js";
import { OpeningScene } from "./opening-cutscene.js";

const BLUR_SPEED = 0.01;

export class MainMenuScene extends Phaser.Scene {
	constructor() {
		super(MainMenuScene.name);
	}

	preload() {
		this.load.image(
			ASSETS.images.mainMenuBackground,
			ASSETS.images.mainMenuBackground
		);
		this.load.audio(ASSETS.audio.menuSong, ASSETS.audio.menuSong);
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

		this.playButton = this.add.text(
			CONFIG.width / 2 + 20 * CONFIG.widthPercentUnit,
			CONFIG.height - 8 * CONFIG.widthPercentUnit,
			"SPACE to start...",
			{
				fontSize: Math.floor(2 * CONFIG.widthPercentUnit),
				fontFamily: "Courier",
				fill: "rgb(255, 255, 255)",
			}
		);
		this.playButton.setInteractive();
		this.playButton.setPadding(
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit,
			2 * CONFIG.widthPercentUnit
		);
		this.playButton.setShadow(
			0,
			0,
			"rgb(255, 255, 255)",
			this.currentShadowBlur
		);
		// hover effect
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
			this.play();
		});
		this.input.keyboard.on(
			Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
			({ keyCode }) => {
				if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
					this.play();
				}
			}
		);
		this.menuSong = this.sound.add(ASSETS.audio.menuSong, { loop: true });
		this.menuSong.play();
		this.cameras.main.fadeIn(2000);

		const highScore = JSON.parse(localStorage.getItem("highscores"));
		if (highScore && highScore.length > 0) {
			this.add.text(
				3 * CONFIG.widthPercentUnit,
				3 * CONFIG.widthPercentUnit,
				`HIGHSCORE: ${highScore[0].score}`,
				{
					fontSize: Math.floor(2 * CONFIG.widthPercentUnit),
					fontFamily: "Courier",
					fill: "rgb(255, 255, 255)",
				}
			);
		}
	}

	play() {
		this.menuSong.stop();
		this.scene.start(OpeningScene.name);
	}

	update(_time, delta) {
		if (this.targetShadowBlur === this.currentShadowBlur) {
			this.targetShadowBlur =
				this.targetShadowBlur === 0 ? 0.5 * CONFIG.widthPercentUnit : 0;
		}
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
