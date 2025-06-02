import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import styles from './game-canvas.module.scss';
import Phaser from 'phaser';
import BreakoutGame from '../../breakout/breakout';

const GameCanvas: Component = () => {
    const [canvasID, _setCanvasID] = createSignal<string>('game-canvas');
    let game: BreakoutGame | null = null;

    onMount(() => {
        const gameConfig: Phaser.Types.Core.GameConfig = {
            type: Phaser.CANVAS,
            canvas: document.getElementById(canvasID()) as HTMLCanvasElement,
            backgroundColor: '#3e3e3e',
            scale: {
                mode: Phaser.Scale.EXPAND,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 800,
                height: 600,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0, x: 0 },
                    debug: false,
                },
            },
            transparent: true,
        }
        if (!game) {
            game = new BreakoutGame(gameConfig);
        }
    });

    onCleanup(() => {
        if (game) {
            game.destroy(true);
            game = null;
        }
    });

    return (
        <div class={styles.container}>
            <canvas id={canvasID()} class={styles.canvas} />
        </div>
    );
}

export default GameCanvas;