// import your assets so webpack includes them
import placeholderBackground from "./assets/images/placeholder-background.png";
import placeholderPlayer from "./assets/images/placeholder-player.png";
import test1 from "./assets/images/test1.png";
import test2 from "./assets/images/test2.png";
import test3 from "./assets/images/test3.png";
import log1 from "./assets/audio/log1.mp3";
import log2 from "./assets/audio/log2.mp3";
import log3 from "./assets/audio/log3.mp3";

// map assets to path for autocomplete
export const ASSETS = {
	images: {
		mainMenuBackground: placeholderBackground,
		player: placeholderPlayer,
		opening1: test1,
		opening2: test2,
		opening3: test3,
	},
	audio: {
		log1: log1,
		log2: log2,
		log3: log3
	},
};
