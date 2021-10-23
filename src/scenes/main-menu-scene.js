import Phaser from "phaser";
import { ASSETS } from "../assets.js";
import { CONFIG } from "../config.js";

export class MainMenuScene extends Phaser.Scene {
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
	}
}
