// import your assets so webpack includes them
import favicon from "./assets/images/favicon.png";
import mainMenuBackground from "./assets/images/main-menu-background.png";

import cutscene1 from "./assets/images/cutscene1.png";
import cutscene2 from "./assets/images/cutscene2.png";
import cutscene3 from "./assets/images/cutscene3.png";

import victory from "./assets/images/victory.png";

import log1 from "./assets/audio/log1.mp3";
import log2 from "./assets/audio/log2.mp3";
import log3 from "./assets/audio/log3.mp3";
import typeWriter1 from "./assets/audio/typeWriter1.mp3";
import typeWriter2 from "./assets/audio/typeWriter2.mp3";
import typeWriter3 from "./assets/audio/typeWriter3.mp3";
import typeWriter4 from "./assets/audio/typeWriter4.mp3";

import gameBackground from "./assets/images/game-background.png";
import deathVision from "./assets/images/death-vision.png";
import lanes from "./assets/images/lanes.png";
import lanesGlow from "./assets/images/lanes-glow.png";

import player from "./assets/images/player.png";
import you from "./assets/images/you.png";

import note1 from "./assets/images/note1.png";
import note2 from "./assets/images/note2.png";
import note3 from "./assets/images/note3.png";
import noteSuccess from "./assets/images/note-success.png";
import noteFail from "./assets/images/note-fail.png";

import ghostie1 from "./assets/images/ghostie1.png";
import ghostie2 from "./assets/images/ghostie2.png";
import ghostie3 from "./assets/images/ghostie3.png";
import ghostie4 from "./assets/images/ghostie4.png";
import ghostie5 from "./assets/images/ghostie5.png";
import ghostie6 from "./assets/images/ghostie-cameo.png";

import menuSong from "./assets/audio/menu-song.mp3";
import gameSong from "./assets/audio/game-song.mp3";
import hit from "./assets/audio/hit.mp3";
import miss from "./assets/audio/miss.mp3";

// map assets to path for autocomplete
export const ASSETS = {
	images: {
		favicon,
		mainMenuBackground,
		gameBackground,
		deathVision,
		lanes,
		lanesGlow,
		player,
		you,
		opening1: cutscene1,
		opening2: cutscene2,
		opening3: cutscene3,
		victory: victory,
		notes: [note1, note2, note3],
		noteSuccess,
		noteFail,
		ghosties: [ghostie1, ghostie2, ghostie3, ghostie4, ghostie5, ghostie6],
	},
	audio: {
		log1: log1,
		log2: log2,
		log3: log3,
		typeWriter1: typeWriter1,
		typeWriter2: typeWriter2,
		typeWriter3: typeWriter3,
		typeWriter4: typeWriter4,
		menuSong,
		gameSong,
		hit,
		miss,
	},
};
