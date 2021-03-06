import Phaser from "phaser";
import { ASSETS } from "../assets";
import { CONFIG } from "../config.js";
import { MainMenuScene } from "./main-menu-scene.js";

export class VictoryScene extends Phaser.Scene {
	constructor() {
		super("VictoryScene");
	}

	preload() {
		this.load.image(ASSETS.images.victory, ASSETS.images.victory);
	}

	create() {
		this.background = this.add.image(
			CONFIG.width / 2,
			CONFIG.height / 2,
			ASSETS.images.victory
		);
		this.background.setDisplaySize(CONFIG.width, CONFIG.height);

		this.label = this.add.text(
			3 * CONFIG.widthPercentUnit,
			3 * CONFIG.widthPercentUnit,
			"",
			{
				fontSize: Math.floor(1.5 * CONFIG.widthPercentUnit),
				fontFamily: "Courier",
				fill: "rgb(255, 255, 255)",
			}
		);

		let highScoreString = "HIGHSCORES\n------------------------------";

		const scores = this.getHighScores();
		for (let scoreId in scores) {
			const score = scores[scoreId];
			highScoreString += `\n${(
				parseInt(scoreId) + 1
			).toString()}:\t${score.score.toString()}\t(${score.notes.toString()} / 283)${score.notes === 283 ? " *PERFECT*" : ""}`;
		}
		this.typewriteText(highScoreString);
		this.input.keyboard.on(
			Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
			({ keyCode }) => {
				if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
					this.scene.start(MainMenuScene.name);
				}
			}
		);
	}

	getHighScores() {
		let scores = JSON.parse(localStorage.getItem("highscores"));
		if (!scores) scores = [];
		let result = [];
		for (let s of scores) {
			result.push({score: parseInt(s.score), notes: parseInt(s.notes)});
		}
		return result;
	}

	typewriteText(text) {
		const length = text.length;
		let i = 0;
		// destroy previous events
		if (this.typeWriterEvent) {
			this.typeWriterEvent.destroy();
		}
		this.label.text = "";
		this.typeWriterEvent = this.time.addEvent({
			callback: () => {
				this.label.text += text[i];
				if (this.getRandomInt(0, 2) === 1) {
					this.sound.play(this.pickRandomTypeWriterSound(), {
						volume: 0.2,
					});
				}
				++i;
			},
			repeat: length - 1,
			delay: 50,
		});
	}

	pickRandomTypeWriterSound() {
		const sounds = [
			ASSETS.audio.typeWriter1,
			ASSETS.audio.typeWriter2,
			ASSETS.audio.typeWriter3,
			ASSETS.audio.typeWriter4,
		];
		return sounds[this.getRandomInt(0, 4)];
	}

	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
}
