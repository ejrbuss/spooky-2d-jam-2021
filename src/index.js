import Phaser from "phaser";
import { CONFIG } from "./config.js";
import { MainMenuScene } from "./scenes/main-menu-scene.js";

// Change me to the current scene you are working on!
const INITIAL_SCENE = MainMenuScene;

const canvas = document.getElementById("game-canvas");

new Phaser.Game({
	type: Phaser.WEBGL,
	width: CONFIG.width,
	height: CONFIG.height,
	scene: INITIAL_SCENE,
	canvas,
});
