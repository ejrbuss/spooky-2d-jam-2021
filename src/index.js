import Phaser from "phaser";
import { CONFIG } from "./config.js";
import { GameScene } from "./scenes/game-scene.js";
import { MainMenuScene } from "./scenes/main-menu-scene.js";

// Change me to the current scene you are working on!
const INITIAL_SCENE = GameScene;

const SCENES = [MainMenuScene, GameScene];

const canvas = document.getElementById("game-canvas");

new Phaser.Game({
	antialias: true,
	type: Phaser.WEBGL,
	width: CONFIG.width,
	height: CONFIG.height,
	scene: [INITIAL_SCENE, ...SCENES.filter((scene) => scene !== INITIAL_SCENE)],
	canvas,
});
