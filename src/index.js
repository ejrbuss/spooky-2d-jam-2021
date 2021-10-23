import Phaser from "phaser";
import { CONFIG } from "./config.js";
import { GameScene } from "./scenes/game-scene.js";
import { MainMenuScene } from "./scenes/main-menu-scene.js";

// Change me to the current scene you are working on!
const INITIAL_SCENE = MainMenuScene;

const SCENES = [MainMenuScene, GameScene];

const canvas = document.getElementById("game-canvas");

const game = new Phaser.Game({
	type: Phaser.WEBGL,
	width: CONFIG.width,
	height: CONFIG.height,
	scene: SCENES,
	canvas,
});

game.scene.start(INITIAL_SCENE);
