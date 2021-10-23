// import your assets so webpack includes them
import placeholderBackground from "./assets/images/placeholder-background.png";
import placeholderPlayer from "./assets/images/placeholder-player.png";

// map assets to path for autocomplete
export const ASSETS = {
	images: {
		mainMenuBackground: placeholderBackground,
		gameBackground: placeholderBackground,
		player: placeholderPlayer,
		you: placeholderPlayer,
	},
	audio: {},
};
