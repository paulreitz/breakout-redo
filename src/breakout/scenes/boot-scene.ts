import Phaser from 'phaser';
import { GameScenes } from '../../types/game-scenes';

export default class BootScene extends Phaser.Scene {
    create(): void {
        this.scene.run(GameScenes.LOADING);
    }
}