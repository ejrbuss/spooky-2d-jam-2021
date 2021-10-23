import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { CONFIG } from "../config.js";
import { GameScene } from "./game-scene.js";

export class MainMenuScene extends Phaser.Scene {
	constructor() {
		super(MainMenuScene.name);
	}

	preload() {
		this.load.image(
			ASSETS.images.mainMenuBackground,
			ASSETS.images.mainMenuBackground
		);
	}

	create() {
		this.background = this.add.image(
			CONFIG.width / 2,
			CONFIG.height / 2,
			ASSETS.images.mainMenuBackground
		);
		this.background.setDisplaySize(CONFIG.width, CONFIG.height);

		this.playButton = this.add.text(0, 0, "PLAY", {
			fontSize: 72,
			fontFamily: "Arial",
		});
		// Center relative to button size
		const noHoverColor = "rgb(200, 50, 50)";
		const hoverColor = "rgb(255, 50, 50)";
		this.playButton.setX(CONFIG.width / 2 - this.playButton.width / 2);
		this.playButton.setY(CONFIG.height / 2 - this.playButton.height / 2);
		this.playButton.setBackgroundColor(noHoverColor);
		this.playButton.setInteractive();
		// hover effect
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
			this.playButton.setBackgroundColor(hoverColor);
		});
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
			this.playButton.setBackgroundColor(noHoverColor);
		});
		this.playButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
			this.scene.start(GameScene);
		});
	}
}
