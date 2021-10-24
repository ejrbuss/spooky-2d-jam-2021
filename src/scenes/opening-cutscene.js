import Phaser from 'phaser'
import { ASSETS } from '../assets';
import { CONFIG } from "../config.js";
import * as script from "../assets/script/openingScript.json";
import { GameScene } from './game-scene.js';


export class OpeningScene extends Phaser.Scene {

    constructor() {
        super('OpeningScene')
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
                audio: ASSETS.audio.log1
            },
            {
                image: ASSETS.images.opening2,
                text: script.script2,
                animationTime: 19000,
                audio: ASSETS.audio.log2
            },
            {
                image: ASSETS.images.opening3,
                text: script.script3,
                animationTime: 11000,
                audio: ASSETS.audio.log3
            },
        ];

        this.runCutscenePart(cutSceneParts, 0, this);
    }

    runCutscenePart(cutsceneParts, id, context) {

        const style = { font: "12px Courier", fill: "#fff" };
        const fadeTime = 3000;

        context.background = context.add.image(
            CONFIG.width,
            CONFIG.height / 2,
            cutsceneParts[id].image
        );
        context.background.setDisplaySize(CONFIG.width * 2, CONFIG.height);
        const textPos = {
            x: 50,
            y: 50
        }

        context.tweens.add({
            targets: context.background,
            x: -1,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            duration: cutsceneParts[id].animationTime + fadeTime
        });
        context.sceneText;
        
        context.label = this.add.text(50, 50, '', style);

        setTimeout(() => {
            context.sceneText = context.swapText("SPACE to continue...", context); 
            let spaceHandler = (event) => {
                if (event.keyCode === 32) {
                    document.removeEventListener("keyup", spaceHandler);
                    console.log("spacebar was pressed")
                    if (id + 1 < cutsceneParts.length) {
                        let fadeTime = 1000;
                        context.cameras.main.fadeOut(fadeTime);
                        setTimeout(() => {
                            context.background.destroy();
                            context.runCutscenePart(cutsceneParts, id + 1, context);
                        }, fadeTime); 
                    } else {
                        // swap to the next actual scene
                        this.scene.start(GameScene.name);
                    }
                }
            }
            document.addEventListener("keyup", spaceHandler);
        }, cutsceneParts[id].animationTime + fadeTime);

        context.cameras.main.once('camerafadeincomplete', (camera) => {
            context.sceneText = context.swapText(cutsceneParts[id].text, context);
            context.sound.play(cutsceneParts[id].audio);
        });

        context.cameras.main.fadeIn(fadeTime);
    }

    swapText(newText, context) {
        context.typewriteText(newText);
    }

    typewriteText(text) {
        const length = text.length
        let i = 0
        this.label.text = "";
        this.time.addEvent({
            callback: () => {
                this.label.text += text[i]
                if (this.getRandomInt(0, 2) === 1) {
                    this.sound.play(this.pickRandomTypeWriterSound(), {
                        volume: 0.2
                    });
                }
                ++i
            },
            repeat: length - 1,
            delay: 50
        })
    }

    pickRandomTypeWriterSound() {
        const sounds = [
            ASSETS.audio.typeWriter1,
            ASSETS.audio.typeWriter2,
            ASSETS.audio.typeWriter3,
            ASSETS.audio.typeWriter4
        ];
        return sounds[this.getRandomInt(0,4)];
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
      }
}