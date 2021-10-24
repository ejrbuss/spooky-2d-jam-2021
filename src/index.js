import Phaser from "phaser";
import { ASSETS } from "./assets.js";
import { CONFIG } from "./config.js";
import { GameScene } from "./scenes/game-scene.js";
import { MainMenuScene } from "./scenes/main-menu-scene.js";
import { OpeningScene } from "./scenes/opening-cutscene.js";
import { VictoryScene } from "./scenes/victory-scene.js";

// Change me to the current scene you are working on!
const INITIAL_SCENE = MainMenuScene;

const SCENES = [MainMenuScene, GameScene, OpeningScene, VictoryScene];

const favicon = document.getElementById("favicon");

favicon.href = ASSETS.images.favicon;

const canvas = document.getElementById("game-canvas");

function resizeCanvasToScreen() {
	const gameAspect = CONFIG.width / CONFIG.height;
	const screenAspect = window.innerWidth / window.innerHeight;

	if (screenAspect < gameAspect) {
		canvas.style.width = "100vw";
		canvas.style.height = `calc(100vw / ${gameAspect})`;
	} else {
		canvas.style.width = `calc(100vh * ${gameAspect})`;
		canvas.style.height = "100vh";
	}
}

window.addEventListener("resize", resizeCanvasToScreen);
resizeCanvasToScreen();

new Phaser.Game({
	antialias: true,
	type: Phaser.WEBGL,
	width: CONFIG.width,
	height: CONFIG.height,
	scene: [INITIAL_SCENE, ...SCENES.filter((scene) => scene !== INITIAL_SCENE)],
	canvas,
});
