import { Component, Show } from 'solid-js';
import styles from './game.module.scss';
import { gameLoading } from '../../state/loading-screens';

import GameCanvas from '../../components/game-canvas/game-canvas';
import Hud from '../../components/hud/hud';
import LoadingScreen from '../../components/loading-screen/loading-screen';

const Game: Component = () => {
    return (
        <div class={styles.container}>
            <div class={styles.layer}>
                <div class={styles.layerContent}>
                    <GameCanvas />
                </div>
            </div>
            <Show when={!gameLoading()}>
                <div class={styles.layer} style={{ "pointer-events": "none" }}>
                    <div class={styles.layerContent}>
                        <Hud />
                    </div>
                </div>
            </Show>
            <Show when={gameLoading()}>
                <div class={styles.layer}>
                    <div class={styles.layerContent}>
                        <LoadingScreen />
                    </div>
                </div>
            </Show>
        </div>
    );
}

export default Game;