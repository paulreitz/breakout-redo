import Phaser from 'phaser';

import { audioManager } from '../../state/audio-state';
import { GameSceneInterface } from '../scenes/game-scene-interface';
import { level, increaseScore } from '../../state/game-states';

export class GamePlay {
    private scene: GameSceneInterface;
    private mouseX = 0;
    private ballLaunched = false;
    private collisionsSetup = false;

    private readonly BASE_BALL_SPEED = 300;

    constructor(scene: GameSceneInterface) {
        this.scene = scene;
        this.initialize();
    }

    private initialize(): void {
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.mouseX = pointer.x;
        });
    }

    public update(delta: number): void {
        const paddle: Phaser.GameObjects.Image = this.scene.children.getByName('paddle') as Phaser.GameObjects.Image;
        if (paddle) {
            paddle.x = Phaser.Math.Interpolation.Linear([paddle.x, this.mouseX], 0.15);
        }

        if (this.scene.ball && !this.collisionsSetup && this.scene.blocksGroup.children.size > 0) {
            
            this.setupCollisions();
            this.launchBall();
            this.collisionsSetup = true;
        }
    }

    private setupCollisions(): void {
        if (!this.scene.ball) {
            return;
        }

        if (this.scene.blocksGroup.children.size === 0) {
            return;
        }

        this.scene.physics.add.collider(
            this.scene.ball,
            this.scene.paddle,
            this.handleBallPaddleCollision.bind(this)
        );

        this.scene.physics.add.collider(
            this.scene.ball,
            this.scene.blocksGroup,
            this.handleBallBlockCollision.bind(this)
        );

    }

    private launchBall(): void {
        if (this.ballLaunched) return;

        const ball = this.scene.ball;
        if (!ball) return;

        const ballSpeed = this.BASE_BALL_SPEED + (level() * 25);

        const goingRight = Math.random() > 0.5;
        const minAngle = goingRight ? -135 : -45;
        const maxAngle = goingRight ? -45 : -135;
        const launchAngle = Phaser.Math.DegToRad(
            Phaser.Math.Between(Math.min(minAngle, maxAngle), Math.max(minAngle, maxAngle))
        );

        const velocityX = Math.cos(launchAngle) * ballSpeed;
        const velocityY = Math.sin(launchAngle) * ballSpeed;

        ball.setVelocity(velocityX, velocityY);
        this.ballLaunched = true;
    }

    public resetBall(): void {
        this.ballLaunched = false;
        this.collisionsSetup = false;
    }

    private handleBallPaddleCollision(
        ballObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
        paddleObject: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
    ): void {
        audioManager.playSfx('ploomp');
        const ball = ballObj as Phaser.Physics.Arcade.Sprite;
        const paddle = paddleObject as Phaser.Physics.Arcade.Sprite;
        const paddleCenter = paddle.x;
        const ballHitPosition = (ball.x - paddleCenter) / (paddle.width / 2);

        const clampedHitPosition = Phaser.Math.Clamp(ballHitPosition, -0.8, 0.8);

        const baseAngle = -90;
        const maxAngleOffset = 60;
        const newAngle = baseAngle + (clampedHitPosition * maxAngleOffset);
        const radians = Phaser.Math.DegToRad(newAngle);

        if (!ball.body) {
            return;
        }
        const currentSpeed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2);
        const newSpeed = Math.max(currentSpeed, this.BASE_BALL_SPEED + (level() * 25));

        ball.setVelocity(
            Math.cos(radians) * newSpeed,
            Math.sin(radians) * newSpeed
        );
        // play sound effect
    }

    private handleBallBlockCollision(
        ballObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
        blockObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
    ): void {
        increaseScore(10);
        audioManager.playSfx('thwong');
        const ball = ballObj as Phaser.Physics.Arcade.Sprite;
        const block = blockObj as Phaser.Physics.Arcade.Sprite;
        
        block.destroy();

        this.createBlockDestroyEffect(block.x, block.y);

        if (this.scene.blocksGroup.children.size === 0) {
            this.scene.resetBlocks();
        }
    }

    private createBlockDestroyEffect(x: number, y: number): void {
        const particles = this.scene.add.particles(x, y, 'ball', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 5
        });

        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    public reset(): void {
        this.ballLaunched = false;
        this.collisionsSetup = false;
    }
}