import Phaser from "phaser";

// Change to false before release
const DEBUG = false;

const RENDER_WIDTH = 1920;
const RENDER_HEIGHT = 1080;

// Seperate global configuration from index.js so it can be easily imported
export const CONFIG = {
	debug: DEBUG,
	width: RENDER_WIDTH,
	height: RENDER_HEIGHT,
	widthPercentUnit: RENDER_WIDTH / 100,
	heightPercentUnit: RENDER_HEIGHT / 100,
};
