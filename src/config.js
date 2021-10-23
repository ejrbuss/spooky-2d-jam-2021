import Phaser from "phaser";

// Change this to false if you are having performance issues
const USE_DEVICE_PIXELS = true;

const PIXEL_RATIO = USE_DEVICE_PIXELS ? window.devicePixelRatio : 1;
const RENDER_WIDTH = 1024 * PIXEL_RATIO;
const RENDER_HEIGHT = 576 * PIXEL_RATIO;

// Seperate global configuration from index.js so it can be easily imported
export const CONFIG = {
	width: RENDER_WIDTH,
	height: RENDER_HEIGHT,
	widthPercentUnit: RENDER_WIDTH / 100,
	heightPercentUnit: RENDER_HEIGHT / 100,
};
