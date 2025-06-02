import Phaser from 'phaser';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { GameScenes } from '../types/game-scenes';
import BootScene from './scenes/boot-scene';
import LoadScene from './scenes/load-scene';
import GameScene from './scenes/game-scene';

export default class BreakoutGame extends Phaser.Game {
    private destroy$ = new Subject<void>();

    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);

        this.scene.add(GameScenes.BOOT, BootScene);
        this.scene.add(GameScenes.LOADING, LoadScene);
        this.scene.add(GameScenes.GAME, GameScene);

        this.scene.start(GameScenes.BOOT);

        fromEvent(window, 'resize')
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(100)
            )
            .subscribe(() => {
                const aspectRatio = 800 / 600;
                const windowRatio = window.innerWidth / window.innerHeight;

                let newWidth, newHeight;
                if (windowRatio > aspectRatio) {
                    newHeight = window.innerHeight;
                    newWidth = newHeight * aspectRatio;
                } else {
                    newWidth = window.innerWidth;
                    newHeight = newWidth / aspectRatio;
                }

                this.scale.resize(newWidth, newHeight);
            });
    }

    destroy(fromScene: boolean): void {
        super.destroy(fromScene);
        this.scene.remove(GameScenes.BOOT);
        this.scene.remove(GameScenes.LOADING);
        this.scene.remove(GameScenes.GAME);
        this.destroy$.next();
        this.destroy$.complete();
    }
}
