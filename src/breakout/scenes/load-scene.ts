import Phaser from 'phaser';
import { GameScenes } from '../../types/game-scenes';

export default class LoadScene extends Phaser.Scene {
    preload(): void {
        this.load.image('ball', 'assets/images/ball.png');
        this.load.image('paddle', 'assets/images/paddle.png');

        for (let i = 1; i <= 9; i++) {
            this.load.image(`block_0${i}`, `assets/images/block0${i}.png`);
        }
    }

    create(): void {
        this.scene.start(GameScenes.GAME);
    }
}