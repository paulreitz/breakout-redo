import Phaser from 'phaser';
import { GameScenes } from '../../types/game-scenes';
import { getBasePath } from '../../state/route-state';

export default class LoadScene extends Phaser.Scene {
    preload(): void {
        this.load.image('ball', `${getBasePath()}assets/images/ball.png`);
        this.load.image('paddle', `${getBasePath()}assets/images/paddle.png`);

        for (let i = 1; i <= 9; i++) {
            this.load.image(`block_0${i}`, `${getBasePath()}assets/images/block0${i}.png`);
        }
    }

    create(): void {
        this.scene.start(GameScenes.GAME);
    }
}