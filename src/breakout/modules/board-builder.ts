import Phaser from "phaser";
import { level } from "../../state/game-states";
import { logger } from "../../utils/logger";
import { audioManager } from '../../state/audio-state';
import { GameSceneInterface } from "../scenes/game-scene-interface";

export interface BoardBuilderConfig {
    blocksPerRow?: number;
    blockWidth?: number;
    blockHeight?: number;
    boardStartX?: number;
    boardStartY?: number;
    animationStagger?: number;
    fadeInDuration?: number;
}

export class BoardBuilder {
    private scene: GameSceneInterface;
    private config: Required<BoardBuilderConfig>;

    private buildingStarted = false;
    private animationTime = 0;
    private currentBlockIndex = 0;
    private totalBlocks = 0;
    private nextBLockAnimationTime = 0;
    private buildComplete = false;

    private blocks: Phaser.Physics.Arcade.Sprite[] = [];
    private onComplete?: () => void;

    constructor(scene: GameSceneInterface, config: BoardBuilderConfig = {}) {
        this.scene = scene;
        this.config = {
            blocksPerRow: config.blocksPerRow ?? 10,
            blockWidth: config.blockWidth ?? 64,
            blockHeight: config.blockHeight ?? 32,
            boardStartX:
                config.boardStartX ??
                this.calculateCenteredStartX(
                    config.blocksPerRow ?? 10,
                    config.blockWidth ?? 64
                ),
            boardStartY: config.boardStartY ?? 100,
            animationStagger: config.animationStagger ?? 50,
            fadeInDuration: config.fadeInDuration ?? 100,
        };
    }

    public startBuilding(onComplete?: () => void): void {
        this.onComplete = onComplete;
        this.initializeBuilding();
    }

    public update(delta: number): void {
        if (!this.buildingStarted) return;
        this.animationTime += delta;

        if (
            this.currentBlockIndex < this.totalBlocks &&
            this.animationTime >= this.nextBLockAnimationTime
        ) {
            this.animateInNextBlock();
            this.scehduleNextBlock();
        }

        if (this.currentBlockIndex >= this.totalBlocks && !this.buildComplete) {
            this.completeBuilding();
        }
    }

    public getBlocks(): Phaser.Physics.Arcade.Sprite[] {
        return [...this.blocks];
    }

    public isComplete(): boolean {
        return this.buildComplete;
    }

    public reset(): void {
        this.destroyBlocks();
        this.buildingStarted = false;
        this.animationTime = 0;
        this.currentBlockIndex = 0;
        this.totalBlocks = 0;
        this.nextBLockAnimationTime = 0;
        this.buildComplete = false;
        this.blocks = [];
        this.onComplete = undefined;
    }

    public destroyBlocks(): void {
        this.blocks.forEach((block) => {
            if (block && block.active) {
                this.scene.blocksGroup.remove(block);
                block.destroy();
            }
        });

        this.scene.blocksGroup.clear(true, true);
        this.blocks = [];
    }

    private calculateCenteredStartX(blocksPerRow: number, blockWidth: number): number {
        return (this.scene.game.canvas.width - (blocksPerRow * blockWidth)) / 2;
    }

    private initializeBuilding(): void {
        this.buildingStarted = true;
        this.animationTime = 0;
        this.currentBlockIndex = 0;
        this.buildComplete = false;
        this.blocks = [];

        if (this.scene.blocksGroup) {
            this.scene.blocksGroup.clear(true, true);
        }

        const totalRows = Math.min(5 + level(), 9);
        this.totalBlocks = totalRows * this.config.blocksPerRow;

        this.nextBLockAnimationTime = 100;
    }

    private animateInNextBlock(): void {
        const row = Math.floor(this.currentBlockIndex / this.config.blocksPerRow);
        const col = this.currentBlockIndex % this.config.blocksPerRow;

        const x = this.config.boardStartX + (col * this.config.blockWidth) + (this.config.blockWidth / 2);
        const y = this.config.boardStartY + (row * this.config.blockHeight) + (this.config.blockHeight / 2);

        const blockType = `block_0${(row % 9) + 1}`;

        const block = this.scene.physics.add.sprite(x, y, blockType);
        block.setOrigin(0.5, 0.5);
        block.setAlpha(0);

        block.setImmovable(true);
        
        if (block.body) {
            block.body.setSize(this.config.blockWidth, this.config.blockHeight);
        }

        this.scene.addBlockToGroup(block);
        this.blocks.push(block);

        this.scene.tweens.add({
            targets: block,
            alpha: 1,
            duration: this.config.fadeInDuration,
            ease: 'Power2',
        });

        this.currentBlockIndex++;
        audioManager.playSfx('thwup');
    }

    private scehduleNextBlock(): void {
        this.nextBLockAnimationTime = this.animationTime + this.config.animationStagger;
    }

    private completeBuilding(): void {
        this.buildComplete = true;

        if (this.onComplete) {
            this.onComplete();
        }
    }
}