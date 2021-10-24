import Phaser from "phaser";
import { ASSETS } from "../assets";
import { CONFIG } from "../config.js";
import * as script from "../assets/script/openingScript.json";
import { GameScene } from "./game-scene.js";

export class OpeningScene extends Phaser.Scene {
	constructor() {
		super("OpeningScene");
	}

	preload() {
		this.load.image(ASSETS.images.opening1, ASSETS.images.opening1);
		this.load.image(ASSETS.images.opening2, ASSETS.images.opening2);
		this.load.image(ASSETS.images.opening3, ASSETS.images.opening3);
		this.load.audio(ASSETS.audio.log1, ASSETS.audio.log1);
		this.load.audio(ASSETS.audio.log2, ASSETS.audio.log2);
		this.load.audio(ASSETS.audio.log3, ASSETS.audio.log3);
		this.load.audio(ASSETS.audio.typeWriter1, ASSETS.audio.typeWriter1);
		this.load.audio(ASSETS.audio.typeWriter2, ASSETS.audio.typeWriter2);
		this.load.audio(ASSETS.audio.typeWriter3, ASSETS.audio.typeWriter3);
		this.load.audio(ASSETS.audio.typeWriter4, ASSETS.audio.typeWriter4);
	}

	create() {
		const cutSceneParts = [
			{
				image: ASSETS.images.opening1,
				text: script.script1,
				animationTime: 23000,
				audio: this.sound.add(ASSETS.audio.log1),
			},
			{
				image: ASSETS.images.opening2,
				text: script.script2,
				animationTime: 19000,
				audio: this.sound.add(ASSETS.audio.log2),
			},
			{
				image: ASSETS.images.opening3,
				text: script.script3,
				animationTime: 11000,
				audio: this.sound.add(ASSETS.audio.log3),
			},
		];

		this.runCutscenePart(cutSceneParts, 0);
	}

	runCutscenePart(cutsceneParts, id) {
		const style = { font: "12px Courier", fill: "#fff" };
		const fadeTime = 3000;

		this.background = this.add.image(
			CONFIG.width,
			CONFIG.height / 2,
			cutsceneParts[id].image
		);
		this.background.setDisplaySize(CONFIG.width * 2, CONFIG.height);

		this.tweens.add({
			targets: this.background,
			x: -1,
			ease: "Sine.easeInOut",
			yoyo: true,
			repeat: -1,
			duration: cutsceneParts[id].animationTime + fadeTime,
		});

		this.label = this.add.text(50, 50, "", style);

		let cancelled = false;

		const spaceHandler = (event) => {
			if (event.key === " ") {
				cancelled = true;
				cutsceneParts[id].audio.stop();
				if (this.typeWriterEvent) {
					this.typeWriterEvent.destroy();
				}
				document.removeEventListener("keydown", spaceHandler);
				let fadeTime = 1000;
				this.cameras.main.fadeOut(fadeTime);
				setTimeout(() => {
					if (id + 1 < cutsceneParts.length) {
						this.background.destroy();
						this.runCutscenePart(cutsceneParts, id + 1);
					} else {
						this.scene.start(GameScene.name);
					}
				}, fadeTime);
			}
		};
		document.addEventListener("keydown", spaceHandler);

		setTimeout(() => {
			if (cancelled) {
				return;
			}
			this.sceneText = this.swapText("SPACE to continue...");
		}, cutsceneParts[id].animationTime + fadeTime);

		this.cameras.main.once(
			Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
			(_camera) => {
				if (cancelled) {
					return;
				}
				this.sceneText = this.swapText(cutsceneParts[id].text);
				cutsceneParts[id].audio.play();
			}
		);

		this.cameras.main.fadeIn(fadeTime);
	}

	swapText(newText) {
		this.typewriteText(newText);
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
