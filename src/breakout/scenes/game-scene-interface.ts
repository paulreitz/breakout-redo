import Phaser from 'phaser';

export interface GameSceneInterface extends Phaser.Scene {
    paddle: Phaser.Physics.Arcade.Sprite;
    ball: Phaser.Physics.Arcade.Sprite | undefined;
    blocksGroup: Phaser.Physics.Arcade.Group;
    addBlockToGroup: (block: Phaser.Physics.Arcade.Sprite) => void;
    setBall: (ball: Phaser.Physics.Arcade.Sprite) => void;
    removeBall: () => void;
    resetBlocks: () => void;
}