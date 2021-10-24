// import your assets so webpack includes them
import placeholderBackground from "./assets/images/placeholder-background.png";
import placeholderPlayer from "./assets/images/placeholder-player.png";

import gameBackground from "./assets/images/game-background.png";
import lanes from "./assets/images/lanes.png";
import lanesGlow from "./assets/images/lanes-glow.png";

// map assets to path for autocomplete
export const ASSETS = {
	images: {
		mainMenuBackground: placeholderBackground,
		gameBackground,
		lanes,
		lanesGlow,
		player: placeholderPlayer,
		you: placeholderPlayer,
	},
	audio: {},
};
