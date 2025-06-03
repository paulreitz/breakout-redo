import Phaser from 'phaser';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createActor } from 'xstate';
import { setGameLoading } from '../../state/loading-screens';
import { audioManager } from '../../state/audio-state';
import { gameStateMachine } from '../system/game-state';
import { GameSceneInterface } from './game-scene-interface';
import { level, setLevel, lives, setLives, increaseScore, setPaused } from '../../state/game-states';
import { Route } from '../../types/routes';
import { setCurrentRoute } from '../../state/route-state';

import { BoardBuilder } from '../modules/board-builder';
import { BallSpawner } from '../modules/ball-spawner';
import { GamePlay } from '../modules/game-play';

type stateUdate = (delta: number) => void;

export default class GameScene extends Phaser.Scene implements GameSceneInterface {
    private gameStateActor: ReturnType<typeof createActor>;
    private _state: string;
    private updateFunctions: Record<string, stateUdate> = {};

    private boardBuilder: BoardBuilder;
    private ballSpawner: BallSpawner;
    private gamePlay: GamePlay;

    public paddle: Phaser.Physics.Arcade.Sprite;
    public ball: Phaser.Physics.Arcade.Sprite | undefined;
    public blocksGroup: Phaser.Physics.Arcade.Group;

    private destroy$ = new Subject<void>();

    init(): void {
        this.boardBuilder = new BoardBuilder(this, {
            blocksPerRow: 15,
            blockWidth: 48,
            blockHeight: 16,
            boardStartY: 100,
        });
        
        this.ballSpawner = new BallSpawner(this, {
            spawnX: this.game.canvas.width / 2,
            spawnY: this.game.canvas.height - 100,
            particleCount: 16,
            particleSpawnRadius: 120,
            particleAnimationDuration: 1000,
            particleStagger: 30,
            ballFadeInDuration: 400
        });

        this.gamePlay = new GamePlay(this);

        this.updateFunctions['buildBoard'] = this.buildBoardUpdate.bind(this);
        this.updateFunctions['spawnBall'] = this.ballSpawnUpdate.bind(this);
        this.updateFunctions['gamePlay'] = this.gamePlayUpdate.bind(this);
        this.gameStateActor = createActor(gameStateMachine);
        this.gameStateActor.subscribe((state) => {
            this._state = state.value;
            console.log(`Game state changed to: ${this._state}`);
        });
        this.gameStateActor.on('startBuildBoard', () => {
            this.boardBuilder.startBuilding(() => {
                this.gameStateActor.send({ type: 'ball.spawn' });
            });
        });
        this.gameStateActor.on('startBallSpawn', () => {
            if(this.paddle) {
                this.paddle.setPosition(
                    this.game.canvas.width / 2,
                    this.game.canvas.height - 50
                );
            }
            this.ballSpawner.startSpawning(() => {
                this.gameStateActor.send({ type: 'game.play' });
            });
        });
        this.gameStateActor.on('game.over', () => {
            setTimeout(() => {
                audioManager.stopMusic();
                setCurrentRoute(Route.EndScreen);
            }, 1000);
        });
        fromEvent<KeyboardEvent>(window, 'keyup')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event) => {
                if (event.key === 'Escape' || event.key === 'p') {
                    if (this.game.isPaused) {
                        this.game.resume();
                    } else {
                        this.game.pause();
                    }
                    console.log(`Game paused: ${this.game.isPaused}`);
                    setPaused(this.game.isPaused);
                }
            });
        this.gameStateActor.start();
    }

    create(): void {
        this.physics.world.setBoundsCollision(true, true, true, false);


        this.paddle = this.physics.add.sprite(
            this.game.canvas.width / 2,
            this.game.canvas.height - 50,
            'paddle'
        );
        this.paddle.setName('paddle');
        this.paddle.setOrigin(0.5, 0.5);
        this.paddle.setImmovable(true);
        this.paddle.body?.setSize(this.paddle.width, this.paddle.height);

        this.blocksGroup = this.physics.add.group();
        setGameLoading(false);
        audioManager.startBackgroundMusic();
    }

    resetBlocks(): void {
        this.removeBall();
        setLevel(level() + 1);
        increaseScore(1000 * level());
        this.gameStateActor.send({ type: 'board.clear' });
    }

    update(): void {
        const updateFunction = this.updateFunctions[this._state];
        if (updateFunction) {
            updateFunction(this.game.loop.delta);
        }
    }

    shutdown(): void {
        this.gameStateActor.stop();
        this.boardBuilder.reset();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public addBlockToGroup(block: Phaser.Physics.Arcade.Sprite): void {
        this.blocksGroup.add(block);
        block.setImmovable(true);
    }

    public setBall(ball: Phaser.Physics.Arcade.Sprite): void {
        this.ball = ball;

        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1, 1);
        this.ball.setVelocity(0, 0);

        if (this.ball.body) {
            // @ts-ignore
            this.ball.body.onWorldBounds = true;
        }

        this.physics.world.on('worldbounds', (event: any, body: Phaser.Physics.Arcade.Body) => {
            audioManager.playSfx('klup');
        });
    }

    public removeBall(): void {
        if (this.ball && this.ball.active) {
            this.physics.world.off('worldbounds');
            this.ball.destroy();
            this.ball = undefined;
            this.gamePlay.resetBall();
        }
    }

    private buildBoardUpdate(delta: number): void {
        if (!this.boardBuilder.isComplete()) {
            this.boardBuilder.update(delta);
        }
    }

    private ballSpawnUpdate(delta: number): void {
        if (!this.ballSpawner.isComplete()) {
            this.ballSpawner.update(delta);
        }
    }

    private gamePlayUpdate(delta: number): void {
        this.gamePlay.update(delta);

        if (this.ball && this.ball.y > this.game.canvas.height + 50) {
            this.removeBall();
            setLives(lives() - 1);
            audioManager.playSfx('bunzz');
            setTimeout(() => {
                this.gameStateActor.send({ type: 'ball.gutter' });
            }, 100);
            
        }
    }
}
