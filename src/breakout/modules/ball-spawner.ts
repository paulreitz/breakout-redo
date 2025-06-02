import Phaser from 'phaser';
import { audioManager } from '../../state/audio-state';
import { GameSceneInterface } from '../scenes/game-scene-interface';

export interface BallSpawnerConfig {
    spawnX?: number;
    spawnY?: number;
    particleCount?: number;
    particleSpawnRadius?: number;
    particleAnimationDuration?: number;
    particleStagger?: number;
    ballFadeInDuration?: number;
}

export class BallSpawner {
    private scene: GameSceneInterface;
    private config: Required<BallSpawnerConfig>;

    private spawningStarted = false;
    private animationTime = 0;
    private currentParticleIndex = 0;
    private nextParticleAnimationTime = 0;
    private spawnComplete = false;
    private particlesComplete = false;

    private particles: Phaser.GameObjects.Image[] = [];
    private ball?: Phaser.Physics.Arcade.Sprite;
    private onComplete?: () => void;

    constructor(scene: GameSceneInterface, config: BallSpawnerConfig = {}) {
        this.scene = scene;
        this.config = {
            spawnX: config.spawnX ?? scene.game.canvas.width / 2,
            spawnY: config.spawnY ?? scene.game.canvas.height - 100,
            particleCount: config.particleCount ?? 12,
            particleSpawnRadius: config.particleSpawnRadius ?? 100,
            particleAnimationDuration: config.particleAnimationDuration ?? 800,
            particleStagger: config.particleStagger ?? 50,
            ballFadeInDuration: config.ballFadeInDuration ?? 300
        };
    }

    public startSpawning(onComplete?: () => void): void {
        this.onComplete = onComplete;
        this.initializeSpawning();
        audioManager.playSfx('swoop');
    }

    public update(delta: number): void {
        if (!this.spawningStarted) return;
        this.animationTime += delta;

        if (
            this.currentParticleIndex < this.config.particleCount &&
            this.animationTime >= this.nextParticleAnimationTime
        ) {
            this.createNextParticle();
            this.scheduleNextParticle();
        }

        if (
            this.currentParticleIndex >= this.config.particleCount &&
            !this.particlesComplete
        ) {
            this.checkParticlesComplete();
        }
    }

    public getBall(): Phaser.GameObjects.Image | undefined {
        return this.ball;
    }

    public isComplete(): boolean {
        return this.spawnComplete;
    }

    public reset(): void {
        this.destroyParticles();
        if (this.scene.ball) {
            this.scene.removeBall();
        }
        this.spawningStarted = false;
        this.animationTime = 0;
        this.currentParticleIndex = 0;
        this.nextParticleAnimationTime = 0;
        this.spawnComplete = false;
        this.particlesComplete = false;
        this.particles = [];
        this.onComplete = undefined;
        this.ball = undefined;
    }

    private initializeSpawning(): void {
        this.spawningStarted = true;
        this.animationTime = 0;
        this.currentParticleIndex = 0;
        this.spawnComplete = false;
        this.particlesComplete = false;
        this.particles = [];
        this.ball = undefined;

        this.nextParticleAnimationTime = 100;
    }

    private createNextParticle(): void {
        const angle = (this.currentParticleIndex / this.config.particleCount) * Math.PI * 2;
        const startX = this.config.spawnX + Math.cos(angle) * this.config.particleSpawnRadius;
        const startY = this.config.spawnY + Math.sin(angle) * this.config.particleSpawnRadius;

        const particle = this.scene.add.image(startX, startY, 'ball');
        particle.setOrigin(0.5, 0.5);
        particle.setScale(0.8);
        particle.setAlpha(0.8);

        this.particles.push(particle);

        this.scene.tweens.add({
            targets: particle,
            x: this.config.spawnX,
            y: this.config.spawnY,
            scale: 0.1,
            alpha: 0,
            duration: this.config.particleAnimationDuration,
            ease: 'Power2',
            onComplete: () => {
                particle.destroy();
            }
        });
        this.currentParticleIndex++;
    }

    private scheduleNextParticle(): void {
        this.nextParticleAnimationTime = this.animationTime + this.config.particleStagger;
    }

    private checkParticlesComplete(): void {
        const particleCompleteTime = this.config.particleAnimationDuration * 0.7;

        if (this.animationTime >= this.nextParticleAnimationTime + particleCompleteTime) {
            this.particlesComplete = true;
            this.spawnBall();
        }
    }

    private spawnBall(): void {
        audioManager.playSfx('plomp');

        this.ball = this.scene.physics.add.sprite(this.config.spawnX, this.config.spawnY, 'ball');
        this.ball.setName('ball');
        this.ball.setOrigin(0.5, 0.5);
        this.ball.setAlpha(0);
        this.ball.setScale(0.5);

        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1, 1);
        this.ball.setVelocity(0, 0);

        const ballSize = Math.min(this.ball.width, this.ball.height);
        this.ball.body?.setSize(ballSize, ballSize);
        this.ball.body?.setCircle(ballSize / 2);

        this.scene.setBall(this.ball);

        this.scene.tweens.add({
            targets: this.ball,
            alpha: 1,
            scale: 1,
            duration: this.config.ballFadeInDuration,
            ease: 'Back.easeOut',
            onComplete: ()=> {
                this.completeSpawning();
            }
        });
    }

    private completeSpawning(): void {
        this.spawnComplete = true;

        if (this.onComplete) {
            this.onComplete();
        }
    }

    private destroyParticles(): void {
        this.particles.forEach((particle) => {
            if (particle && particle.active) {
                particle.destroy();
            }
        });
        this.particles = [];
    }

    private destroyBall(): void {
        if (this.ball && this.ball.active) {
            this.ball.destroy();
            this.ball = undefined;
        }
    }
}