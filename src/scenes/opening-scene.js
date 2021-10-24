import Phaser from 'phaser'
import { ASSETS } from '../assets';
import { CONFIG } from "../config.js";
import * as script from "../assets/script/openingScript.json";


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

        const fadeTime = 3000;

        context.background = context.add.image(
            CONFIG.width,
            CONFIG.height / 2,
            cutsceneParts[id].image
        );
        context.background.setDisplaySize(CONFIG.width * 2, CONFIG.height);
        const textPos = {
            x: CONFIG.width * 0.7,
            y: CONFIG.height * 0.90
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
        

        setTimeout(() => {
            context.sceneText = context.swapText("SPACE to continue...", textPos, context); 
            let spaceHandler = (event) => {
                if (event.keyCode === 32) {
                    document.removeEventListener("keyup", spaceHandler);
                    console.log("spacebar was pressed")
                    if (id + 1 < cutsceneParts.length) {
                        let fadeTime = 1000;
                        context.cameras.main.fadeOut(fadeTime);
                        context.sceneText.destroy();
                        setTimeout(() => {
                            context.background.destroy();
                            context.runCutscenePart(cutsceneParts, id + 1, context);
                        }, fadeTime); 
                    } else {
                        // swap to the next actual scene
                        console.log("SWAP TO NEXT SCENE");
                    }
                }
            }
            document.addEventListener("keyup", spaceHandler);
        }, cutsceneParts[id].animationTime + fadeTime);

        context.cameras.main.once('camerafadeincomplete', (camera) => {
            context.sceneText = context.swapText(cutsceneParts[id].text, textPos, context);
            context.sound.play(cutsceneParts[id].audio);
        });

        context.cameras.main.fadeIn(fadeTime);
    }

    swapText(newText, textPos, context) {
        if (context.sceneText) {
            context.sceneText.destroy();
        }
        return context.add.text(textPos.x, textPos.y, newText).setOrigin(0.5, 0.5);
    }
}